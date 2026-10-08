import s from './figures.module.css';

/** IBM Plex Mono advance width, in em. */
export const MONO = 0.6;

/** Width of a run of mono text, including CSS letter-spacing (in em). */
export function monoWidth(text: string, size: number, tracking = 0): number {
  return text.length * size * (MONO + tracking);
}

/**
 * A label sitting on a box's top border, knocked out of the line with a
 * paper ground (the drafting "container label").
 */
export function BorderLabel({
  x,
  y,
  text,
}: {
  x: number;
  y: number;
  text: string;
}) {
  const w = monoWidth(text, 9.5, 0.1) + 10;
  return (
    <g>
      <rect className={s.bg} x={x} y={y - 6} width={w} height={12} />
      <text className={s.k} x={x + 5} y={y + 3.4}>
        {text}
      </text>
    </g>
  );
}

/** A label centred on a line, knocked out with a paper ground. */
export function LineLabel({
  x,
  y,
  text,
  className,
}: {
  x: number;
  y: number;
  text: string;
  className?: string;
}) {
  const w = monoWidth(text, 9.5, 0.08) + 10;
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect className={s.bg} x={-w / 2} y={-7} width={w} height={14} />
      <text className={className ?? s.k} textAnchor="middle" y={3.4}>
        {text}
      </text>
    </g>
  );
}

/** A round item balloon with its number, centred on (cx, cy). */
export function Balloon({
  cx,
  cy,
  n,
}: {
  cx: number;
  cy: number;
  n: number;
}) {
  return (
    <g>
      <circle className={s.balloon} cx={cx} cy={cy} r={7} />
      <text className={s.num} x={cx} y={cy + 3.1} textAnchor="middle">
        {n}
      </text>
    </g>
  );
}

/** A filled arrowhead whose tip sits at (x, y), pointing along `angle`. */
export function Arrowhead({
  x,
  y,
  angle = 0,
  className,
}: {
  x: number;
  y: number;
  angle?: number;
  className?: string;
}) {
  return (
    <path
      className={className ?? s.arrow}
      d="M0 0L-7 -3L-7 3Z"
      transform={`translate(${x} ${y}) rotate(${angle})`}
    />
  );
}
