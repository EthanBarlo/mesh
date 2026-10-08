import type { ReactNode } from 'react';

/** Round to two decimals so generated path data stays short and stable. */
const r = (n: number) => Math.round(n * 100) / 100;

/**
 * A filled arrowhead whose tip sits on (x2, y2), aligned to the segment
 * from (x1, y1). Returns the path plus the point the shaft should stop at,
 * so the line never pokes through the tip.
 */
export function arrow(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  size = 6,
  half = 2.4,
): { head: string; endX: number; endY: number } {
  const len = Math.hypot(x2 - x1, y2 - y1) || 1;
  const ux = (x2 - x1) / len;
  const uy = (y2 - y1) / len;
  const bx = x2 - ux * size;
  const by = y2 - uy * size;
  const px = -uy * half;
  const py = ux * half;

  return {
    head: `M${r(x2)} ${r(y2)}L${r(bx + px)} ${r(by + py)}L${r(bx - px)} ${r(by - py)}Z`,
    endX: r(bx),
    endY: r(by),
  };
}

/** A shaft plus arrowhead from (x1, y1) to (x2, y2). */
export function Arrow({
  x1,
  y1,
  x2,
  y2,
  tone = 'ink',
  dashed = false,
  both = false,
}: {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  tone?: 'ink' | 'accent' | 'fine';
  dashed?: boolean;
  both?: boolean;
}) {
  const end = arrow(x1, y1, x2, y2);
  const start = both ? arrow(x2, y2, x1, y1) : null;
  const line =
    tone === 'accent' ? 'ln ln--accent' : tone === 'fine' ? 'ln ln--fine' : 'ln';
  const fill = tone === 'accent' ? 'fill-accent' : 'fill-ink';

  return (
    <g>
      <path
        className={dashed ? 'ln ln--dash' : line}
        d={`M${start ? start.endX : x1} ${start ? start.endY : y1}L${end.endX} ${end.endY}`}
      />
      <path className={fill} d={end.head} />
      {start ? <path className={fill} d={start.head} /> : null}
    </g>
  );
}

/** String literals are drawn in non-photo blue, as in the code blocks. */
export function Str({ children }: { children: ReactNode }) {
  return <tspan style={{ fill: 'var(--blueline)' }}>{children}</tspan>;
}

/**
 * The ruled header above one panel of a multi-panel figure: a square item
 * tag, a name, an optional code line, and a right-aligned reading.
 */
export function PanelHead({
  tag,
  title,
  code,
  reading,
}: {
  tag: string;
  title: string;
  code?: string;
  reading: string;
}) {
  return (
    <div className="mb-3 border-b border-ink pb-2">
      <div className="flex items-center justify-between gap-3">
        <p className="m-0 flex items-center gap-2 text-sm font-semibold text-ink">
          <span className="tag">{tag}</span>
          {title}
        </p>
        <p className="k k--caps m-0 text-ink-3">{reading}</p>
      </div>
      {code ? <p className="k m-0 mt-1.5 text-ink-2">{code}</p> : null}
    </div>
  );
}
