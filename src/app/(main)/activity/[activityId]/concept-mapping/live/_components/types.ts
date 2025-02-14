import CustomEdge from "./edge";
import InputEdge from "./input-edge";

export const enum NodeType {
  DropZone = 'dropZone',
  Static = 'static',
}

export const edgeTypes = {
  'custom-edge': CustomEdge,
  'input-edge': InputEdge
}