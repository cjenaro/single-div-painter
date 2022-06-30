import type { Color, Shape } from "@prisma/client";
import { Tool } from "@prisma/client";
import type { APP_TOOLS } from "./constants";
import { ACTIONS } from "./constants";

export type ShapeWithColors = Shape & {
  colors: Color[];
};

function getGradientType(type: Tool, direction: number | null) {
  let gradientType = "";
  let dir = direction || 90;
  if (type === Tool.CIRCLE) {
    gradientType = "radial-gradient(";
  } else if (type === Tool.SQUARE) {
    gradientType = "linear-gradient(" + dir + "deg, ";
  }

  return gradientType;
}

function getColors(shape: ShapeWithColors) {
  let colors = shape.colors
    .map((color) => `${color.color} ${color.stop}%`)
    .join(", ");
  if (shape.type === Tool.CIRCLE) {
    colors = colors + ", transparent 50%";
  }

  return colors;
}

export function getSelectedSize(shape: Shape) {
  return `${shape.width + 5}px ${shape.height + 5}px`;
}

function getSize(shape: Shape) {
  return `${shape.width}px ${shape.height}px`;
}

export function getSelectedPosition(shape: Shape) {
  return `${shape.x - 2.5}px ${shape.y - 2.5}px`;
}

function getPosition(shape: Shape) {
  return `${shape.x}px ${shape.y}px`;
}

export function createBackgroundImageFromShapes(
  shapes: ShapeWithColors[],
  formData?: FormData,
  sessionTool?: Tool | APP_TOOLS
): {
  backgroundImage: string;
  backgroundSize: string;
  backgroundPosition: string;
} {
  if (!shapes || shapes.length < 1)
    return {
      backgroundImage: "",
      backgroundPosition: "",
      backgroundSize: "",
    };
  let shapesForReducer = shapes;

  let isMoving =
    formData && formData.get("action")?.toString() === ACTIONS.MOVE_SHAPE;
  let isResizing =
    formData && formData.get("action")?.toString() === ACTIONS.RESIZE_SHAPE;

  if (formData && formData.get("action")?.toString() === ACTIONS.ADD_SHAPE) {
    let sTool =
      sessionTool === Tool.CIRCLE || sessionTool === Tool.SQUARE
        ? sessionTool
        : Tool.CIRCLE;
    let oUIShape: ShapeWithColors = {
      id: -1,
      type: sTool,
      direction: 90,
      x: Number(formData.get("x")) || 50,
      y: Number(formData.get("y")) || 50,
      height: Number(formData.get("height")) || 50,
      width: Number(formData.get("width")) || 50,
      colors: [
        { id: -1, shapeId: -1, color: "#c4c4c4", opacity: 1, stop: 50 },
        { id: -1, shapeId: -1, color: "#c4c4c4", opacity: 1, stop: 50 },
      ],
    };

    shapesForReducer.push(oUIShape);
  }

  return shapesForReducer.reduce(
    (prev, current, index) => {
      let ouiShape = { ...current };
      let isLast = index === shapes.length - 1;
      let gradient = getGradientType(ouiShape.type, ouiShape.direction);

      if (isMoving && formData && isSelectedShape(ouiShape, formData)) {
        let x = Number(formData.get("x")?.toString());
        let y = Number(formData.get("y")?.toString());
        let width = Number(formData.get("width")?.toString());
        let height = Number(formData.get("height")?.toString());

        ouiShape.x = x;
        ouiShape.y = y;
        ouiShape.width = width;
        ouiShape.height = height;
      }

      if (isResizing && formData && isSelectedShape(ouiShape, formData)) {
        let width = Number(formData.get("width")?.toString());
        let height = Number(formData.get("height")?.toString());

        ouiShape.width = width;
        ouiShape.height = height;
      }

      let colors = getColors(ouiShape);

      let ending = isLast ? "" : ", ";

      return {
        backgroundImage:
          prev.backgroundImage + gradient + colors + ")" + ending,
        backgroundSize: prev.backgroundSize + getSize(ouiShape) + ending,
        backgroundPosition:
          prev.backgroundPosition + getPosition(ouiShape) + ending,
      };
    },
    {
      backgroundImage: "",
      backgroundSize: "",
      backgroundPosition: "",
    }
  );
}

function isSelectedShape(shape: ShapeWithColors, formData?: FormData) {
  if (!formData) return false;
  const selected = Number(formData.get("selected")?.toString());
  if (!selected) return false;

  return selected === shape.id;
}
