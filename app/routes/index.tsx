import type { ActionFunction, LoaderFunction } from "@remix-run/node";
import type { DrawingSession } from "~/server/db.server";
import type { ShapeWithColors } from "~/utils/drawing";
import { Tool } from "@prisma/client";
import { useFetcher, useLoaderData } from "@remix-run/react";
import { db } from "db/index.server";
import Main from "~/components/main";
import SelectedShape from "~/components/selected-shape";
import Sidebar from "~/components/sidebar";
import { createDrawingSession, getDrawingSession } from "~/server/db.server";
import { ACTIONS, ERRORS } from "~/utils/constants";

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

    let direction = Number(data.get("direction")?.toString());
    if (!direction || Number.isNaN(direction)) {
      return { error: ERRORS.BAD_SHAPE, field: "direction" };
    }

    let shape = await db.shape.update({
      where: {
        id: selected,
      },
      data: {
        width,
        height,
        direction,
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

    let colorStops = data.getAll("color-stops");
    if (!colorStops) {
      return { error: ERRORS.BAD_SHAPE, field: "color-stops" };
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
            stop: Number(colorStops[index]),
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
              { color: "#c4c4c4", opacity: 1, stop: 50 },
              { color: "#c4c4c4", opacity: 1, stop: 50 },
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

  return (
    <>
      <Sidebar fetcher={fetcher} session={session} />
      <Main
        fetcher={fetcher}
        session={session}
        selectedShape={selectedShape}
        shapes={shapes}
      />
      {selectedShape?.id ? (
        <SelectedShape selectedShape={selectedShape} fetcher={fetcher} />
      ) : null}
    </>
  );
}
