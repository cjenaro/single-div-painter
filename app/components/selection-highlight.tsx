import { Tool } from "@prisma/client";
import type { useFetcher } from "@remix-run/react";
import type { ShapeWithColors } from "~/utils/drawing";
// @ts-ignore
import angleToCoordinates from "css-gradient-angle-to-svg-gradient-coordinates";

const STROKE_WIDTH = 0.1;

function isWithin(n1: number, n2: number, within = STROKE_WIDTH * 30) {
  return Math.abs(n1 - n2) <= within;
}

export default function SelectionHighlight({
  shape,
  fetcher,
  setDragInfo,
}: {
  shape: ShapeWithColors;
  fetcher: ReturnType<typeof useFetcher>;
  setDragInfo: React.Dispatch<
    React.SetStateAction<
      | {
          startX: number;
          startY: number;
          isIncreasingSize: boolean;
        }
      | undefined
    >
  >;
}) {
  let size = Math.max(shape.width, shape.height);
  let w = shape.width / size;
  let h = shape.height / size;

  let delta = Math.abs(shape.width - shape.height);

  let l =
    shape.type === Tool.CIRCLE && shape.height > shape.width
      ? shape.x - delta / 2
      : shape.x;
  let t =
    shape.type === Tool.CIRCLE && shape.height < shape.width
      ? shape.y - delta / 2
      : shape.y;

  const handleDragStart: React.DragEventHandler<HTMLFormElement> = (event) => {
    event.nativeEvent.preventDefault();

    let parent = event.currentTarget.parentElement as HTMLDivElement;

    let { left, top } = parent.getBoundingClientRect();

    let x = event.clientX - left;
    let y = event.clientY - top;

    let isIncreasingSize =
      !!shape &&
      (isWithin(shape.x, x) ||
        isWithin(shape.x + shape.width, x) ||
        isWithin(shape.y, y) ||
        isWithin(shape.y + shape.height, y));

    console.log(isIncreasingSize);

    setDragInfo({
      startX: event.clientX,
      startY: event.clientY,
      isIncreasingSize,
    });
  };

  const handleDragEnd: React.DragEventHandler<HTMLFormElement> = (event) => {
    console.log(event.clientX);
    console.log(event.clientY);

    setDragInfo(undefined);
  };

  const coordinates = angleToCoordinates(shape.direction || 90);

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
      className="absolute"
    >
      <svg
        className="w-full h-full"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 1 1"
      >
        <defs>
          {shape.type === Tool.CIRCLE ? (
            <radialGradient id="fill" {...coordinates}>
              {shape.colors.map((color) => (
                <stop
                  key={color.id}
                  offset={`${color.stop}%`}
                  stopColor={color.color}
                />
              ))}
            </radialGradient>
          ) : (
            <linearGradient id="fill" {...coordinates}>
              {shape.colors.map((color) => (
                <stop
                  key={color.id}
                  offset={`${color.stop}%`}
                  stopColor={color.color}
                />
              ))}
            </linearGradient>
          )}
        </defs>
        {shape.type === Tool.CIRCLE ? (
          <>
            <ellipse
              rx={w - STROKE_WIDTH / 2.5}
              ry={h - STROKE_WIDTH / 2.5}
              cx="0.5"
              cy="0.5"
              className="cursor-pointer"
              fill="url(#fill)"
            />
            <ellipse
              rx={w / 2.5}
              ry={h / 2.5}
              cx="0.5"
              cy="0.5"
              stroke="yellow"
              strokeWidth={STROKE_WIDTH}
              className="cursor-row-resize"
            />
          </>
        ) : (
          <>
            <rect
              width={w}
              height={h}
              x="0"
              y="0"
              stroke="yellow"
              strokeWidth={STROKE_WIDTH}
              className="cursor-row-resize"
            />
            <rect
              width={w - STROKE_WIDTH}
              height={h - STROKE_WIDTH}
              x={0 + STROKE_WIDTH / 2}
              y={0 + STROKE_WIDTH / 2}
              className="cursor-pointer"
              fill="url(#fill)"
            />
          </>
        )}
      </svg>
    </fetcher.Form>
  );
}
