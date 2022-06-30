import type { useFetcher } from "@remix-run/react";
import { ACTIONS } from "~/utils/constants";
import type { ShapeWithColors } from "~/utils/drawing";

export default function SelectedShape({
  selectedShape,
  fetcher,
}: {
  fetcher: ReturnType<typeof useFetcher>;
  selectedShape: ShapeWithColors;
}) {
  return (
    <fetcher.Form
      method="post"
      className="edit bg-sky-100 flex flex-col relative z-10"
    >
      <input type="hidden" name="action" value={ACTIONS.EDIT_SHAPE} />
      <input
        type="hidden"
        name="selected"
        value={selectedShape.id.toString()}
      />
      <label
        htmlFor="x"
        className="flex flex-col justify-center items-start mb-4"
      >
        x:
        <input
          id="x"
          type="number"
          name="x"
          defaultValue={selectedShape.x}
          className="mt-2 rounded-md p-2 w-full"
        />
      </label>
      <label
        htmlFor="y"
        className="flex flex-col justify-center items-start mb-4"
      >
        y:
        <input
          id="y"
          type="number"
          name="y"
          defaultValue={selectedShape.y}
          className="mt-2 rounded-md p-2 w-full"
        />
      </label>

      <label
        htmlFor="height"
        className="flex flex-col justify-center items-start mb-4"
      >
        height:
        <input
          type="number"
          id="height"
          name="height"
          defaultValue={selectedShape.height}
          className="mt-2 rounded-md p-2 w-full"
        />
      </label>

      <label
        htmlFor="width"
        className="flex flex-col justify-center items-start mb-4"
      >
        width:
        <input
          type="number"
          id="width"
          name="width"
          defaultValue={selectedShape.width}
          className="mt-2 rounded-md p-2 w-full"
        />
      </label>
      <label
        htmlFor="direction"
        className="flex flex-col justify-center items-start mb-4"
      >
        direction:
        <input
          type="number"
          id="direction"
          name="direction"
          defaultValue={selectedShape?.direction || 90}
          className="mt-2 rounded-md p-2 w-full"
        />
      </label>
      {selectedShape?.colors?.length > 0
        ? selectedShape.colors.map((color, index) => {
            return (
              <div
                key={color.id}
                className="grid grid-cols-1 mb-4 gap-2 uppercase"
              >
                <input type="hidden" name="colors-id" value={color.id} />
                <label
                  htmlFor={`colors[${index}]`}
                  className="grid grid-cols-2 mb-4 gap-2 uppercase"
                >
                  {color.color}:
                  <input
                    type="color"
                    id={`colors[${index}]`}
                    name="colors"
                    defaultValue={color.color}
                    className="justify-self-end col-span-1 rounded-md w-full"
                  />
                </label>
                <label
                  htmlFor={`color-stops[${index}]`}
                  key={color.id}
                  className="grid grid-cols-2 mb-4 gap-2 uppercase"
                >
                  Stop:
                  <input
                    type="number"
                    name="color-stops"
                    id={`color-stops[${index}]`}
                    defaultValue={color.stop}
                    className="justify-self-end col-span-1 rounded-md p-2 w-full"
                  />
                </label>
              </div>
            );
          })
        : null}

      <button
        type="submit"
        className="p-4 rounded-md bg-sky-900 text-sky-50 hover:bg-sky-500"
      >
        Edit
      </button>
    </fetcher.Form>
  );
}
