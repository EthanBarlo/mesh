import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';
import s from './figures.module.css';

/** IBM Plex Mono advance width, in em. */
export const MONO = 0.6;

/** Width of a run of mono text, including CSS letter-spacing (in em). */
export function monoWidth(text: string, size: number, tracking = 0): number {
  return text.length * size * (MONO + tracking);
}

export type Point = readonly [number, number];

export function pathD(points: readonly Point[]): string {
  return points.map(([x, y], i) => `${i ? 'L' : 'M'}${x} ${y}`).join('');
}

/** A filled arrowhead whose tip sits at (x, y), pointing along `angle`. */
export function Arrow({
  x,
  y,
  angle,
  className,
}: {
  x: number;
  y: number;
  angle: number;
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

/** The angle (degrees) of the last segment of a polyline. */
export function endAngle(points: readonly Point[]): number {
  const [ax, ay] = points[points.length - 2];
  const [bx, by] = points[points.length - 1];
  return Math.round((Math.atan2(by - ay, bx - ax) * 180) / Math.PI);
}

/** The angle (degrees) of the first segment, pointing back out of the line. */
export function startAngle(points: readonly Point[]): number {
  const [ax, ay] = points[1];
  const [bx, by] = points[0];
  return Math.round((Math.atan2(by - ay, bx - ax) * 180) / Math.PI);
}

/**
 * A label that sits on a box's top border, knocked out of the line with a
 * paper ground (the drafting "container label").
 */
export function BorderLabel({
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
  const w = monoWidth(text, 9.5, 0.1) + 10;
  return (
    <g className={className}>
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
  vertical = false,
  className,
  textClassName,
}: {
  x: number;
  y: number;
  text: string;
  vertical?: boolean;
  className?: string;
  textClassName?: string;
}) {
  const w = monoWidth(text, 9.5, 0.08) + 10;
  return (
    <g
      className={className}
      transform={`translate(${x} ${y})${vertical ? ' rotate(-90)' : ''}`}
    >
      <rect className={s.bg} x={-w / 2} y={-7} width={w} height={14} />
      <text className={cn(s.k, textClassName)} textAnchor="middle" y={3.4}>
        {text}
      </text>
    </g>
  );
}

/**
 * A wide + narrow pair of drawings. A container query shows the one that
 * fits; the hidden one is `display: none`, so it is also out of the
 * accessibility tree.
 */
export function Responsive({
  wide,
  narrow,
}: {
  wide: ReactNode;
  narrow: ReactNode;
}) {
  return (
    <div className={s.fluid}>
      <div className={s.wide}>{wide}</div>
      <div className={s.narrow}>{narrow}</div>
    </div>
  );
}
