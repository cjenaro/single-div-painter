import type { Color, Shape } from "@prisma/client";
import { Tool } from "@prisma/client";

export type ShapeWithColors = Shape & {
  colors: Color[];
};

function getGradientType(type: Tool) {
  let gradientType = "";
  if (type === Tool.CIRCLE) {
    gradientType = "radial-gradient(";
  } else if (type === Tool.SQUARE) {
    gradientType = "linear-gradient(";
  }

  return gradientType;
}

function getColors(shape: ShapeWithColors) {
  let colors = shape.colors.map((color) => color.color).join(", ");
  if (shape.type === Tool.CIRCLE) {
    colors = colors + " 50%, transparent 50%";
  }

  return colors;
}

function getSelectedColors(shape: ShapeWithColors) {
  let colors = "hotpink, hotpink";
  if (shape.type === Tool.CIRCLE) {
    colors = colors + " 50%, transparent 50%";
  }

  return colors;
}

function getSelectedSize(shape: Shape) {
  return `${shape.width + 5}px ${shape.height + 5}px`;
}

function getSize(shape: Shape) {
  return `${shape.width}px ${shape.height}px`;
}

function getSelectedPosition(shape: Shape) {
  return `${shape.x - 2.5}px ${shape.y - 2.5}px`;
}

function getPosition(shape: Shape) {
  return `${shape.x}px ${shape.y}px`;
}

export function createBackgroundImageFromShapes(
  shapes: ShapeWithColors[],
  selected?: number
) {
  if (!shapes || shapes.length < 1) return {};

  return shapes.reduce(
    (prev, current, index) => {
      let isLast = index === shapes.length - 1;
      let gradient = getGradientType(current.type);
      let isSelected: boolean = selected === current.id;
      let colors = getColors(current);

      let selectedBgImg = "";
      let selectedBgSize = "";
      let selectedBgPosition = "";
      let ending = isLast ? "" : ", ";

      if (isSelected) {
        selectedBgImg =
          ", " + gradient + getSelectedColors(current) + ")" + ending;
        selectedBgSize = ", " + getSelectedSize(current) + ending;
        selectedBgPosition = ", " + getSelectedPosition(current) + ending;
      }

      return {
        backgroundImage:
          prev.backgroundImage +
          gradient +
          colors +
          ")" +
          (isSelected ? selectedBgImg : ending),
        backgroundSize:
          prev.backgroundSize +
          getSize(current) +
          (isSelected ? selectedBgSize : ending),
        backgroundPosition:
          prev.backgroundPosition +
          getPosition(current) +
          (isSelected ? selectedBgPosition : ending),
      };
    },
    {
      backgroundImage: "",
      backgroundSize: "",
      backgroundPosition: "",
    }
  );
}
