/**
 * Geometry for the "Section A–A" hero drawing. Every number is in viewBox
 * units (1 unit = 1 CSS px at the 560px desktop size). The plan (top) and the
 * section (below) share x coordinates: they are two orthographic views of the
 * same page, tied together by projection lines.
 */

export const W = 560;
export const H = 470;

/* ---------- Plan: the rendered page ---------- */
export const PAGE = { x0: 130, x1: 430, y0: 44, y1: 178 };
export const HEAD_Y = 60;
/** The island slot the `<mesh:counter />` tag reserves. */
export const ISLAND = { x0: 236, x1: 376, y0: 68, y1: 160 };
/** Cutting plane A–A. */
export const CUT = { y: 112, x0: 110, x1: 450 };

/* ---------- Section A–A ---------- */
/** y of: top surface, HTML/Livewire interface, Livewire/Laravel interface, bottom. */
export const SEC = { top: 248, lw: 312, lv: 380, bot: 402 };
/** The cavity in the HTML layer: exactly the island's width, projected down. */
export const CAV = { x0: ISLAND.x0, x1: ISLAND.x1, y0: SEC.top, y1: SEC.lw };
/** `display: contents` wrapper: no box, so it is drawn as a phantom line. */
export const WRAP = { x0: CAV.x0 + 4.5, x1: CAV.x1 - 4.5, y0: CAV.y0 + 4, y1: CAV.y1 - 4 };
/** `.mesh-root`: the mount node, a thin solid liner. */
export const ROOT = { x0: CAV.x0 + 9.5, x1: CAV.x1 - 9.5, y0: CAV.y0 + 9, y1: CAV.y1 - 9 };
/** The framework component itself (the lazy chunk). */
export const COMP = { x0: CAV.x0 + 15, x1: CAV.x1 - 15, y0: CAV.y0 + 15, y1: CAV.y1 - 15 };
export const GLYPH_Y = Math.round((COMP.y0 + COMP.y1) / 2) - 1;
export const GLYPH_X = [278, 306, 334] as const;

/** Channels drilled from the Livewire state up into the island. */
export const BORE = { l: 276, r: 336, half: 4, y0: ROOT.y1, y1: 350 };
/** Livewire state chamber. */
export const CHAMBER = { x0: 262, x1: 350, y0: BORE.y1, y1: 374 };
/** The signal: up the props channel, back down the return channel. */
export const WIRE = { top: COMP.y1 - 7, bot: CHAMBER.y0 + 6, l: BORE.l, r: BORE.r, mid: 306 };

/* ---------- Between the views ---------- */
export const DIM_Y = 224;

/* ---------- Motion (ms) ---------- */
export const T = {
  planStagger: 34,
  planCap: 520,
  planDur: 820,
  projAt: 520,
  sweepAt: 820,
  sweepDur: 1250,
  lateAt: 1950,
  dropAt: 2050,
  dropDur: 680,
  calloutAt: 2380,
  liveAt: 3250,
};

/** When the sweep (left→right, linear) reaches x. */
export function sweepDelay(x: number): number {
  const p = (x - CUT.x0) / (CUT.x1 - CUT.x0);
  return Math.round(T.sweepAt + Math.min(1, Math.max(0, p)) * T.sweepDur);
}

/* ---------- Hatching ---------- */
export type Seg = { x1: number; y1: number; x2: number; y2: number };

const r2 = (n: number) => Math.round(n * 100) / 100;

/**
 * 45° hatch lines clipped to a rectangle. `dir = 1` is "/" (x + y = c),
 * `dir = -1` is "\" (y − x = c). Lines are phased to a global grid so a
 * material interrupted by a hole stays continuous on both sides of it.
 */
export function hatch(
  x0: number,
  y0: number,
  x1: number,
  y1: number,
  step: number,
  dir: 1 | -1,
): Seg[] {
  const out: Seg[] = [];
  if (dir === 1) {
    const cMin = x0 + y0;
    const cMax = x1 + y1;
    for (let c = Math.ceil(cMin / step) * step; c <= cMax; c += step) {
      const xa = Math.max(x0, c - y1);
      const xb = Math.min(x1, c - y0);
      if (xb - xa < 0.6) continue;
      out.push({ x1: r2(xa), y1: r2(c - xa), x2: r2(xb), y2: r2(c - xb) });
    }
  } else {
    const cMin = y0 - x1;
    const cMax = y1 - x0;
    for (let c = Math.ceil(cMin / step) * step; c <= cMax; c += step) {
      const xa = Math.max(x0, y0 - c);
      const xb = Math.min(x1, y1 - c);
      if (xb - xa < 0.6) continue;
      out.push({ x1: r2(xa), y1: r2(xa + c), x2: r2(xb), y2: r2(xb + c) });
    }
  }
  return out;
}

/* ---------- Leaders ---------- */
export type Pt = readonly [number, number];

/** A filled arrowhead whose tip sits on `tip`, pointing away from `from`. */
export function arrowHead(from: Pt, tip: Pt, len = 6.5, half = 2.1): string {
  const dx = tip[0] - from[0];
  const dy = tip[1] - from[1];
  const d = Math.hypot(dx, dy) || 1;
  const ux = dx / d;
  const uy = dy / d;
  const bx = tip[0] - ux * len;
  const by = tip[1] - uy * len;
  return [
    `${r2(tip[0])},${r2(tip[1])}`,
    `${r2(bx - uy * half)},${r2(by + ux * half)}`,
    `${r2(bx + uy * half)},${r2(by - ux * half)}`,
  ].join(' ');
}

/* ---------- Signal loop ---------- */
/** Up the props channel, from the state chamber into the island. */
export const LOOP_UP: Pt[] = [
  [WIRE.l, WIRE.bot],
  [WIRE.l, WIRE.top],
];
/** Back down the return channel, from the island into the state chamber. */
export const LOOP_DOWN: Pt[] = [
  [WIRE.r, WIRE.top],
  [WIRE.r, WIRE.bot],
];

/** Point at fraction `t` (0–1) along a polyline. */
export function along(pts: Pt[], t: number): Pt {
  const lens: number[] = [];
  let total = 0;
  for (let i = 1; i < pts.length; i++) {
    const l = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
    lens.push(l);
    total += l;
  }
  let d = Math.min(1, Math.max(0, t)) * total;
  for (let i = 0; i < lens.length; i++) {
    if (d <= lens[i] || i === lens.length - 1) {
      const k = lens[i] ? Math.min(1, d / lens[i]) : 0;
      return [
        pts[i][0] + (pts[i + 1][0] - pts[i][0]) * k,
        pts[i][1] + (pts[i + 1][1] - pts[i][1]) * k,
      ];
    }
    d -= lens[i];
  }
  return pts[pts.length - 1];
}
