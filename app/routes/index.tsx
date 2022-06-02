import { Tool } from "@prisma/client";
import type { ActionFunction, LoaderFunction } from "@remix-run/node";
import { useFetcher, useLoaderData } from "@remix-run/react";
import { db } from "db/index.server";
import React from "react";
import type { DrawingSession } from "~/server/db.server";
import { createDrawingSession, getDrawingSession } from "~/server/db.server";
import type { ShapeWithColors } from "~/utils/drawing";
import { createBackgroundImageFromShapes } from "~/utils/drawing";

export const loader: LoaderFunction = async ({ request }) => {
  let session = await getDrawingSession(request);
  let selectedShape = null;
  let shapes = await db.shape.findMany({
    include: {
      colors: true,
    },
  });

  if (!session) {
    session = {
      tool: Tool.CIRCLE,
    };
  }

  if (session.selectedShape) {
    selectedShape = shapes.find((s) => s.id === Number(session.selectedShape));
  }

  return {
    session,
    selectedShape,
    shapes,
  };
};

enum ERRORS {
  NO_ACTION = "NO_ACTION",
  NO_TOOL = "NO_TOOL",
  BAD_TOOL = "BAD_TOOL",
  BAD_ACTION = "BAD_ACTION",
  BAD_SHAPE = "BAD_SHAPE",
  BAD_SELECTION = "BAD_SELECTION",
  FAILED_DELETE = "FAILED_DELETE",
  FAILED_UPDATE = "FAILED_UPDATE",
}

enum ACTIONS {
  CLEAR_SESSION = "CLEAR_SESSION",
  PICK_TOOL = "PICK_TOOL",
  ADD_SHAPE = "ADD_SHAPE",
  REMOVE_SHAPE = "REMOVE_SHAPE",
  SELECT_SHAPE = "SELECT_SHAPE",
  EDIT_SHAPE = "EDIT_SHAPE",
}

export const action: ActionFunction = async ({ request }) => {
  const data = await request.formData();
  const drawingSession = await getDrawingSession(request);
  let tool = drawingSession?.tool || Tool.CIRCLE;

  const action = data.get("action")?.toString();

  if (!action) {
    return {
      error: ERRORS.NO_ACTION,
    };
  }

  if (action === ACTIONS.EDIT_SHAPE) {
    const selected = Number(data.get("selected")?.toString());
    if (!selected || Number.isNaN(selected)) {
      return { error: ERRORS.BAD_SELECTION };
    }

    let width = Number(data.get("width")?.toString());
    if (!width || Number.isNaN(width)) {
      return { error: ERRORS.BAD_SHAPE, field: "width" };
    }

    let height = Number(data.get("height")?.toString());
    if (!height || Number.isNaN(height)) {
      return { error: ERRORS.BAD_SHAPE, field: "height" };
    }

    let x = Number(data.get("x")?.toString());
    if (!x || Number.isNaN(x)) {
      return { error: ERRORS.BAD_SHAPE, field: "x" };
    }

    let y = Number(data.get("y")?.toString());
    if (!y || Number.isNaN(y)) {
      return { error: ERRORS.BAD_SHAPE, field: "y" };
    }

    let shape = await db.shape.update({
      where: {
        id: selected,
      },
      data: {
        width,
        height,
        x,
        y,
      },
    });

    if (!shape) {
      return {
        error: ERRORS.FAILED_UPDATE,
      };
    }

    let colors = data.getAll("colors");
    if (!colors) {
      return { error: ERRORS.BAD_SHAPE, field: "colors" };
    }

    let colorsId = data.getAll("colors-id");
    if (!colorsId) {
      return { error: ERRORS.BAD_SHAPE, field: "colors-id" };
    }

    await Promise.all(
      colorsId.map((id, index) => {
        return db.color.update({
          where: {
            id: Number(id.toString()),
          },
          data: {
            color: colors[index].toString(),
          },
        });
      })
    );

    return createDrawingSession(request, {
      ...drawingSession,
    });
  }

  if (action === ACTIONS.SELECT_SHAPE) {
    const selected = Number(data.get("selected")?.toString());
    if (!selected || Number.isNaN(selected)) {
      return { error: ERRORS.BAD_SELECTION };
    }

    return createDrawingSession(request, {
      ...drawingSession,
      selectedShape: selected,
    });
  }

  if (action === ACTIONS.CLEAR_SESSION) {
    await db.shape.deleteMany();
    return createDrawingSession(request, { tool });
  }

  if (action === ACTIONS.PICK_TOOL) {
    tool = data.get("tool")?.toString() as Tool;

    if (!tool) return { error: ERRORS.NO_TOOL };
    if (tool !== Tool.CIRCLE && tool !== Tool.SQUARE)
      return { error: ERRORS.BAD_TOOL };

    return createDrawingSession(request, { tool });
  }

  if (action === ACTIONS.ADD_SHAPE) {
    const x = data.get("x")?.toString()
      ? Number(data.get("x")?.toString())
      : 50;
    const y = data.get("y")?.toString()
      ? Number(data.get("y")?.toString())
      : 50;

    await db.shape.create({
      data: {
        type: tool,
        x,
        y,
        height: 50,
        width: 50,
        colors: {
          createMany: {
            data: [
              { color: "#c4c4c4", opacity: 1 },
              { color: "#c4c4c4", opacity: 1 },
            ],
          },
        },
      },
    });

    return createDrawingSession(request, {
      tool,
    });
  }

  if (action === ACTIONS.REMOVE_SHAPE) {
    const shapeId = Number(data.get("shapeId")?.toString());
    const shape = await db.shape.delete({
      where: {
        id: shapeId,
      },
    });

    if (!shape) {
      return {
        error: ERRORS.FAILED_DELETE,
      };
    }

    return createDrawingSession(request, {
      tool,
    });
  }

  return {
    error: ERRORS.BAD_ACTION,
  };
};

type LoaderData = {
  session: DrawingSession;
  shapes: ShapeWithColors[];
  selectedShape: ShapeWithColors | null;
};

export default function Index() {
  const { session, selectedShape, shapes } = useLoaderData<LoaderData>();

  const fetcher = useFetcher();

  function handleMouse(event: React.MouseEvent<HTMLFormElement>) {
    const { clientX, clientY, currentTarget } = event;
    const form = new FormData(currentTarget);
    const clickedOn = shapes.find((shape) => {
      const cx = clientX - currentTarget.offsetLeft;
      const cy = clientY - currentTarget.offsetTop;

      return (
        cx > shape.x &&
        cx < shape.x + shape.width &&
        cy > shape.y &&
        cy < shape.y + shape.height
      );
    });

    if (clickedOn) {
      form.set("selected", clickedOn.id.toString());
      form.set("action", ACTIONS.SELECT_SHAPE);
      return fetcher.submit(form, { method: "post" });
    }

    const x = clientX - currentTarget.offsetLeft;
    const y = clientY - currentTarget.offsetTop;

    form.set("x", x.toString());
    form.set("y", y.toString());

    fetcher.submit(form, { method: "post" });
  }

  return (
    <>
      <aside className="bg-sky-100">
        <h5 className="text-lg">Pick your tool</h5>
        <nav>
          <ul className="p-0 m-0">
            <li className="mb-3 p-3 text-center">
              <fetcher.Form
                method="post"
                className="flex items-center justify-center"
              >
                <input
                  type="hidden"
                  name="action"
                  value={ACTIONS.CLEAR_SESSION}
                />
                <button
                  className="uppercase bg-sky-500 text-white bold flex-1 text-center rounded-md p-2"
                  type="submit"
                >
                  Clear
                </button>
              </fetcher.Form>
            </li>
            <li className="mb-3 p-3 text-center">
              <fetcher.Form
                method="post"
                className="flex items-center justify-center"
              >
                <input type="hidden" name="action" value={ACTIONS.PICK_TOOL} />
                <input type="hidden" name="tool" value={Tool.CIRCLE} />
                <button
                  type="submit"
                  disabled={session?.tool === Tool.CIRCLE}
                  className="bg-sky-500 text-white bold flex-1 text-center rounded-md p-2 disabled:bg-sky-900 disabled:opacity-40"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6 mx-auto"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <circle
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      r="10"
                      cy="12"
                      cx="12"
                    />
                  </svg>
                </button>
              </fetcher.Form>
            </li>
            <li className="p-3 text-center">
              <fetcher.Form
                method="post"
                className="flex items-center justify-center"
              >
                <input type="hidden" name="action" value={ACTIONS.PICK_TOOL} />
                <input type="hidden" name="tool" value={Tool.SQUARE} />
                <button
                  type="submit"
                  disabled={session?.tool === Tool.SQUARE}
                  className="bg-sky-500 text-white bold flex-1 text-center rounded-md p-2 disabled:bg-sky-900 disabled:opacity-40"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6 text-center mx-auto"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <rect
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      width="20"
                      height="20"
                      y="1"
                      x="1"
                    />
                  </svg>
                </button>
              </fetcher.Form>
            </li>
          </ul>
        </nav>
      </aside>

      <fetcher.Form method="post" onClick={handleMouse}>
        <input type="hidden" name="action" value={ACTIONS.ADD_SHAPE} />
        <div
          className="drawing"
          style={createBackgroundImageFromShapes(shapes, selectedShape?.id)}
        ></div>
      </fetcher.Form>

      {selectedShape?.id ? (
        <fetcher.Form method="post" className="edit">
          <input type="hidden" name="action" value={ACTIONS.EDIT_SHAPE} />
          <input
            type="hidden"
            name="selected"
            value={selectedShape.id.toString()}
          />
          <label htmlFor="x">
            x:
            <input
              id="x"
              type="number"
              name="x"
              defaultValue={selectedShape.x}
            />
          </label>
          <label htmlFor="y">
            y:
            <input
              id="y"
              type="number"
              name="y"
              defaultValue={selectedShape.y}
            />
          </label>

          <label htmlFor="height">
            height:
            <input
              type="number"
              id="height"
              name="height"
              defaultValue={selectedShape.height}
            />
          </label>

          <label htmlFor="width">
            width:
            <input
              type="number"
              id="width"
              name="width"
              defaultValue={selectedShape.width}
            />
          </label>
          {selectedShape?.colors?.length > 0
            ? selectedShape.colors.map((color, index) => {
                return (
                  <label htmlFor={`colors[${index}]`} key={color.id}>
                    {color.color}:
                    <input
                      type="color"
                      id={`colors[${index}]`}
                      name="colors"
                      defaultValue={color.color}
                    />
                    <input type="hidden" name="colors-id" value={color.id} />
                  </label>
                );
              })
            : null}

          <button type="submit">Edit</button>
        </fetcher.Form>
      ) : null}
    </>
  );
}
