import { Tool } from "@prisma/client";
import type { useFetcher } from "@remix-run/react";
import type { ShapeWithColors } from "~/utils/drawing";
import { createBackgroundImageFromShapes } from "~/utils/drawing";
import { ACTIONS } from "~/utils/constants";
import type { DragInfo } from "./main";
import React from "react";

export default function SelectionHighlight({
  shape,
  fetcher,
  setDragInfo,
  dragInfo,
}: {
  shape: ShapeWithColors;
  fetcher: ReturnType<typeof useFetcher>;
  dragInfo: DragInfo | undefined;
  setDragInfo: React.Dispatch<React.SetStateAction<DragInfo | undefined>>;
}) {
  let size = Math.max(shape.width, shape.height);

  let l = shape.x;
  let t = shape.y;

  let justDragged =
    fetcher.submission?.formData.get("action") === ACTIONS.MOVE_SHAPE;

  if (justDragged) {
    let newX = Number(fetcher.submission?.formData.get("x"));
    let newY = Number(fetcher.submission?.formData.get("y"));
    l = newX;
    t = newY;
  }

  const handleDragStart: React.DragEventHandler<HTMLFormElement> = (event) => {
    let parent = event.currentTarget.parentElement as HTMLDivElement;

    let { left, top } = parent.getBoundingClientRect();

    let x = event.clientX - left;
    let y = event.clientY - top;

    // offset from pointer to shapes edge
    let xOffset = x - shape.x;
    let yOffset = y - shape.y;

    setDragInfo({
      startX: x,
      startY: y,
      yOffset,
      xOffset,
    });
  };

  const handleDragEnd: React.DragEventHandler<HTMLFormElement> = (event) => {
    if (!dragInfo) return;
    event.preventDefault();

    let parent = event.currentTarget.parentElement as HTMLDivElement;
    let { left, top } = parent.getBoundingClientRect();
    let x = event.clientX - left - dragInfo.xOffset;
    let y = event.clientY - top - dragInfo.yOffset;

    let data = new FormData(event.currentTarget);
    let height = shape.height;
    let width = shape.width;

    data.set("action", ACTIONS.MOVE_SHAPE);

    data.set("selected", shape.id.toString());
    data.set("width", width.toString());
    data.set("height", height.toString());
    data.set("x", x.toString());
    data.set("y", y.toString());

    fetcher.submit(data, { method: "post" });

    setDragInfo(undefined);
  };

  function handlePointerUp(event: React.PointerEvent<HTMLDivElement>) {
    let el = event.target as HTMLDivElement;
    let { width, height } = el.getBoundingClientRect();
    let data = new FormData();
    data.set("action", ACTIONS.RESIZE_SHAPE);
    data.set("selected", shape.id.toString());
    data.set("width", width.toString());
    data.set("height", height.toString());

    fetcher.submit(data, { method: "post" });
  }

  return (
    <fetcher.Form
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      draggable="true"
      style={{
        left: l + "px",
        top: t + "px",
        width: size + "px",
        height: size + "px",
      }}
      className="absolute cursor-pointer"
    >
      <div
        className="resize overflow-auto border-2 border-yellow-200 bg-no-repeat"
        onPointerUp={handlePointerUp}
        style={{
          width: shape.width + "px",
          height: shape.height + "px",
          backgroundImage: createBackgroundImageFromShapes([shape])
            .backgroundImage,
        }}
      ></div>
    </fetcher.Form>
  );
}
