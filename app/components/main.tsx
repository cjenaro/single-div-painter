import type { useFetcher } from "@remix-run/react";
import React from "react";
import type { DrawingSession } from "~/server/db.server";
import { ACTIONS, APP_TOOLS } from "~/utils/constants";
import type { ShapeWithColors } from "~/utils/drawing";
import { createBackgroundImageFromShapes } from "~/utils/drawing";
import SelectionHighlight from "./selection-highlight";

export type DragInfo = {
  startX: number;
  startY: number;
  yOffset: number;
  xOffset: number;
};

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
  const [dragInfo, setDragInfo] = React.useState<DragInfo>();

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

    if (clickedOn && session.tool === APP_TOOLS.SELECT) {
      form.set("selected", clickedOn.id.toString());
      form.set("action", ACTIONS.SELECT_SHAPE);
      return fetcher.submit(form, { method: "post" });
    }

    const x = clientX - left;
    const y = clientY - top;

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
          dragInfo={dragInfo}
        />
      ) : null}
    </div>
  );
}
