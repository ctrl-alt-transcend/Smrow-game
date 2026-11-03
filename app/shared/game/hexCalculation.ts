import {
  type Edge,
  type Vertex,
  HEX_SIZE
} from "./gameboard.types";

/** @description axial coordinates (col & row) to pixels (pointy-topped) */
export const axialToPixel = (q: number, r: number, size: number) => ({
  x: size * (Math.sqrt(3) * q + (Math.sqrt(3) / 2) * r),
  y: size * (3 / 2 * r),
});

/* ================================================================== *
 * GÉOMÉTRIE DE BASE
 * ================================================================== */

/** @description les 6 directions axiales, index 0..5 (sens horaire) */
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
 * CLÉS CANONIQUES
 * ------------------------------------------------------------------
 * Un sommet physique est partagé par 3 tuiles, une arête par 2 tuiles.
 * On le nomme d'après la tuile MINIMALE (q puis r) qui le contient :
 * l'id ne dépend donc plus de la tuile qui l'a généré.
 * ================================================================== */

interface VertexKey {
  q: number;
  r: number;
  corner: number;
}

/**
 * @description clé canonique du sommet situé au coin `i` de la tuile (q, r).
 * Les 3 tuiles candidates sont (q,r), (q,r)+d_i et (q,r)+d_(i+5) ;
 * on garde la plus petite lexicographiquement.
 */
export const canonicalVertexKey = (q: number, r: number, i: number): VertexKey => {
  const c = mod(i, 6);
  const next = DIRECTIONS[c];
  const prev = DIRECTIONS[mod(c + 5, 6)];

  const candidates: VertexKey[] = [
    { q, r, corner: c },
    { q: q + next.q, r: r + next.r, corner: mod(c + 4, 6) },
    { q: q + prev.q, r: r + prev.r, corner: mod(c + 2, 6) },
  ];

  return candidates.reduce((best, cand) => (isSmaller(cand, best) ? cand : best));
};

/** @description id canonique d'un sommet : "{q}:{r}:{corner}" */
export const vertexId = (key: VertexKey): string => `${key.q}:${key.r}:${key.corner}`;

/* ================================================================== *
 * SOMMETS
 * ================================================================== */

/** @description generates hextile's vertices (6 corners per hex) */
export const getHexCorners = (q: number, r: number, size: number): Vertex[] => {
  const center = axialToPixel(q, r, size);
  const corners: Vertex[] = [];

  for (let i = 0; i < 6; i++) {
    const angle_deg = 60 * i - 30; // pointy-topped
    const angle_rad = (Math.PI / 180) * angle_deg;

    // les coordonnées restent celles du coin de CETTE tuile :
    // c'est le même point physique, seul l'id est mutualisé
    corners.push({
      id: vertexId(canonicalVertexKey(q, r, i)),
      x: center.x + size * Math.cos(angle_rad),
      y: center.y + size * Math.sin(angle_rad),
    });
  }

  return corners;
};

/* ================================================================== *
 * ARÊTES
 * ================================================================== */

/**
 * @description generates all the edges of a hexagon (between consecutive vertices).
 *
 * L'id est dérivé de la PAIRE de sommets canoniques triée : une arête étant
 * déterminée par ses deux extrémités, deux tuiles voisines produisent
 * forcément le même id. Séparateur "|" et non "-" car les coordonnées
 * peuvent être négatives ("-1:0:2").
 */
export const getHexEdges = (q: number, r: number, size: number): Edge[] => {
  const corners = getHexCorners(q, r, size);
  const edges: Edge[] = [];

  for (let i = 0; i < 6; i++) {
    const a = corners[i];
    const b = corners[mod(i + 1, 6)];

    // tri par id : id stable quel que soit le sens de parcours
    const [p1, p2] = a.id < b.id ? [a, b] : [b, a];

    edges.push({ id: `${p1.id}|${p2.id}`, p1, p2 });
  }

  return edges;
};

/* ================================================================== *
 * OUTILS DE VÉRIFICATION
 * ================================================================== */

/** @description génère un plateau hexagonal plein de rayon `radius` */
export const makeHexagon = (radius: number): { q: number; r: number }[] => {
  const tiles: { q: number; r: number }[] = [];
  for (let q = -radius; q <= radius; q++) {
    const rMin = Math.max(-radius, -q - radius);
    const rMax = Math.min(radius, -q + radius);
    for (let r = rMin; r <= rMax; r++) tiles.push({ q, r });
  }
  return tiles;
};

export interface TopologyAudit {
  tiles: number;
  vertices: number;
  edges: number;
  expectedVertices: number;
  expectedEdges: number;
  ok: boolean;
  maxEdgesPerVertex: number;
  problems: string[];
}

/**
 * @description vérifie la topologie d'un plateau.
 * Attendus (relation d'Euler, F = tuiles + 1 face extérieure) :
 *   V = 6 (N + 1)²      E = V + T - 1
 * Rayon 0 → 6 / 6 · rayon 1 → 24 / 30 · rayon 2 → 54 / 72
 */
export const auditTopology = (
  tiles: { q: number; r: number }[],
  size: number = HEX_SIZE,
): TopologyAudit => {
  const vertices = new Map<string, Vertex>();
  const edges = new Map<string, Edge>();
  const edgesPerVertex = new Map<string, number>();
  const problems: string[] = [];

  for (const tile of tiles) {
    for (const v of getHexCorners(tile.q, tile.r, size)) vertices.set(v.id, v);
    for (const e of getHexEdges(tile.q, tile.r, size)) edges.set(e.id, e);
  }

  for (const e of edges.values()) {
    for (const id of [e.p1.id, e.p2.id]) {
      if (!vertices.has(id)) problems.push(`arête ${e.id} → sommet inconnu ${id}`);
      edgesPerVertex.set(id, (edgesPerVertex.get(id) ?? 0) + 1);
    }
  }

  // un sommet de grille hexagonale touche au maximum 3 arêtes
  for (const [id, count] of edgesPerVertex) {
    if (count > 3) problems.push(`sommet ${id} touché par ${count} arêtes (> 3)`);
  }

  // rayon déduit du nombre de tuiles : T = 3N² + 3N + 1
  const T = tiles.length;
  const N = Math.round((-3 + Math.sqrt(9 - 12 * (1 - T))) / 6);
  const expectedVertices = 6 * (N + 1) ** 2;
  const expectedEdges = expectedVertices + T - 1;

  if (vertices.size !== expectedVertices) {
    problems.push(
      `sommets uniques = ${vertices.size}, attendu ${expectedVertices} ` +
        `(ids non canoniques ?)`,
    );
  }
  if (edges.size !== expectedEdges) {
    problems.push(
      `arêtes uniques = ${edges.size}, attendu ${expectedEdges} ` +
        `(ids non canoniques ?)`,
    );
  }

  return {
    tiles: T,
    vertices: vertices.size,
    edges: edges.size,
    expectedVertices,
    expectedEdges,
    ok: problems.length === 0,
    maxEdgesPerVertex: Math.max(...edgesPerVertex.values()),
    problems,
  };
};

