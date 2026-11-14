import { type Edge, type Vertex, HEX_SIZE } from "./game.types.js";

/** @description axial coordinates (col & row) to pixels (pointy-topped) */
export const axialToPixel = (q: number, r: number, size: number) => ({
  x: size * (Math.sqrt(3) * q + (Math.sqrt(3) / 2) * r),
  y: size * ((3 / 2) * r),
});


/** @description the 6 axial directions, index 0..5 (clockwise) */
export const DIRECTIONS = [
  { q: 1, r: 0 }, // 0
  { q: 0, r: 1 }, // 1
  { q: -1, r: 1 }, // 2
  { q: -1, r: 0 }, // 3
  { q: 0, r: -1 }, // 4
  { q: 1, r: -1 }, // 5
] as const;

const mod = (n: number, m: number): number => ((n % m) + m) % m;

const isSmaller = (
  a: { q: number; r: number },
  b: { q: number; r: number },
): boolean => a.q < b.q || (a.q === b.q && a.r < b.r);

/* ================================================================== *
* CANONICAL KEYS
* ------------------------------------------------------------------
* A physical vertex is shared by 3 tiles; an edge is shared by 2 tiles.
* It is named according to the MINIMAL tile (by q, then r) that contains it:
* the ID therefore no longer depends on the specific tile that generated it.
* ================================================================== */

interface VertexKey {
  q: number;
  r: number;
  corner: number;
}

/**
* @description canonical key of the vertex located at corner `i` of the tile (q, r).
* The 3 candidate tiles are (q,r), (q,r)+d_i and (q,r)+d_(i+5);
* we keep the smallest lexicographically.
*/
export const canonicalVertexKey = (
  q: number,
  r: number,
  i: number,
): VertexKey => {
  const c = mod(i, 6);
  const next = DIRECTIONS[c];
  const prev = DIRECTIONS[mod(c + 5, 6)];

  const candidates: VertexKey[] = [
    { q, r, corner: c },
    { q: q + next.q, r: r + next.r, corner: mod(c + 4, 6) },
    { q: q + prev.q, r: r + prev.r, corner: mod(c + 2, 6) },
  ];

  return candidates.reduce((best, cand) =>
    isSmaller(cand, best) ? cand : best,
  );
};

/** @description canonical id of a vertex: "{q}:{r}:{corner}" */
export const vertexId = (key: VertexKey): string =>
  `${key.q}:${key.r}:${key.corner}`;

/** @description generates hextile's vertices (6 corners per hex) */
export const getHexCorners = (q: number, r: number, size: number): Vertex[] => {
  const center = axialToPixel(q, r, size);
  const corners: Vertex[] = [];

  for (let i = 0; i < 6; i++) {
    const angle_deg = 60 * i - 30;
    const angle_rad = (Math.PI / 180) * angle_deg;
    corners.push({
      id: vertexId(canonicalVertexKey(q, r, i)),
      x: center.x + size * Math.cos(angle_rad),
      y: center.y + size * Math.sin(angle_rad),
    });
  }

  return corners;
};

/**
 * @description generates all the edges of a hexagon (between consecutive vertices).
 *
 * The ID is derived from the sorted PAIR of canonical vertices: since an edge
 * is defined by its two endpoints, two adjacent tiles will necessarily
 * produce the same ID. The separator used is "|" rather than "-" because
 * the coordinates can be negative ("-1:0:2").
 */
export const getHexEdges = (q: number, r: number, size: number): Edge[] => {
  const corners = getHexCorners(q, r, size);
  const edges: Edge[] = [];

  for (let i = 0; i < 6; i++) {
    const a = corners[i];
    const b = corners[mod(i + 1, 6)];
    const [p1, p2] = a.id < b.id ? [a, b] : [b, a];

    edges.push({ id: `${p1.id}|${p2.id}`, p1, p2 });
  }

  return edges;
};
