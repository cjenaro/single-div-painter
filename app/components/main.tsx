import type { useFetcher } from "@remix-run/react";
import React from "react";
import type { DrawingSession } from "~/server/db.server";
import { ACTIONS } from "~/utils/constants";
import type { ShapeWithColors } from "~/utils/drawing";
import { createBackgroundImageFromShapes } from "~/utils/drawing";
import SelectionHighlight from "./selection-highlight";

export default function Main({
  fetcher,
  session,
  shapes,
  selectedShape,
}: {
  fetcher: ReturnType<typeof useFetcher>;
  session: DrawingSession;
  selectedShape: ShapeWithColors | null;
  shapes: ShapeWithColors[];
}) {
  const [dragInfo, setDragInfo] = React.useState<
    { startX: number; startY: number; isIncreasingSize: boolean } | undefined
  >();

  function handleMouse(event: React.MouseEvent<HTMLFormElement>) {
    if (dragInfo) return;
    const { clientX, clientY, currentTarget } = event;
    const { top, left } = currentTarget.getBoundingClientRect();
    const form = new FormData(currentTarget);
    const clickedOn = shapes.find((shape) => {
      const cx = clientX - left;
      const cy = clientY - top;

      return (
        cx > shape.x &&
        cx < shape.x + shape.width &&
        cy > shape.y &&
        cy < shape.y + shape.height
      );
    });

    if (clickedOn) {
      console.log(clickedOn);
      form.set("selected", clickedOn.id.toString());
      form.set("action", ACTIONS.SELECT_SHAPE);
      return fetcher.submit(form, { method: "post" });
    }

    const x = clientX - left;
    const y = clientY - top;

    console.log(x, y);

    form.set("x", x.toString());
    form.set("y", y.toString());

    fetcher.submit(form, { method: "post" });
  }

  return (
    <div className="relative">
      <fetcher.Form
        method="post"
        className="w-full h-full"
        onClick={handleMouse}
      >
        <input type="hidden" name="action" value={ACTIONS.ADD_SHAPE} />
        <div
          className="drawing"
          style={createBackgroundImageFromShapes(
            shapes,
            fetcher.submission?.formData,
            session.tool
          )}
        ></div>
      </fetcher.Form>
      {selectedShape?.id ? (
        <SelectionHighlight
          shape={selectedShape}
          fetcher={fetcher}
          setDragInfo={setDragInfo}
        />
      ) : null}
    </div>
  );
}
