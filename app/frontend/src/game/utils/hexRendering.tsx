import type { Edge, Vertex } from "../types/gameboard.types";

/** @description hextile pixel height */
export const HEX_SIZE = 50;

/** @description axial coordinates (col & row) to pixels (pointy-topped) */
export const axialToPixel = (q: number, r: number, size: number) => ({
  x: size * (Math.sqrt(3) * q + Math.sqrt(3) / 2 * r),
  y: size * (3 / 2 * r)
});

/** @description generates hextile's vertices (6 corners per hex) */
export const getHexCorners = (q: number, r: number, size: number): Vertex[] => {
  const center = axialToPixel(q, r, size);
  const corners: Vertex[] = [];

  for (let i = 0; i < 6; i++) {
    const angle_deg = 60 * i - 30; // pointy-topped
    const angle_rad = (Math.PI / 180) * angle_deg;
    corners.push({
      id: `${q}:${r}:${i}`,
      x: center.x + size * Math.cos(angle_rad),
      y: center.y + size * Math.sin(angle_rad)
    });
  }
  return corners;
};

/** @description generates all the edges of a hexagon (between consecutive vertices) */
export const getHexEdges = (q: number, r: number, size: number): Edge[] => {
  const corners = getHexCorners(q, r, size);
  const edges: Edge[] = [];

  for (let i = 0; i < 6; i++) {
    const nextIndex = (i + 1) % 6;
    edges.push({
      id: `${corners[i].id}-${corners[nextIndex].id}`,
      p1: corners[i],
      p2: corners[nextIndex]
    });
  }
  return edges;
};
