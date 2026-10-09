'use client';

import { type CSSProperties, type ReactNode, useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { cn } from '@/lib/cn';
import {
  armLines,
  drawableLines,
  easeInOutCubic,
  hasFinePointer,
  onceInView,
  playLines,
  prefersReducedMotion,
  settleLines,
} from './motion';

/* ==========================================================================
   Geometry. One isometric (2:1) slab per layer. Each slab's top face is also
   a 100 × 100 "plane" — details drawn in plane units sit flat on the face.
   ========================================================================== */

type LayerId = 'island' | 'mesh' | 'livewire' | 'laravel' | 'alpine';

type Slab = { cx: number; cy: number; w: number; h: number; t: number };

const VB = { w: 404, h: 528 };

const S: Record<LayerId, Slab> = {
  island: { cx: 240, cy: 70, w: 108, h: 54, t: 14 },
  mesh: { cx: 240, cy: 182, w: 108, h: 54, t: 10 },
  alpine: { cx: 92, cy: 182, w: 30, h: 15, t: 8 },
  livewire: { cx: 210, cy: 302, w: 150, h: 75, t: 14 },
  laravel: { cx: 210, cy: 422, w: 150, h: 75, t: 14 },
};

/** Leader y as a share of the figure height, for the HTML labels. */
const pct = (y: number) => `${((y / VB.h) * 100).toFixed(2)}%`;

function plane(s: Slab) {
  return `matrix(${s.w / 100} ${s.h / 100} ${-s.w / 100} ${s.h / 100} ${s.cx} ${s.cy - s.h})`;
}

/** Plane point → screen point. */
function onPlane(s: Slab, u: number, v: number): [number, number] {
  return [s.cx + (s.w / 100) * (u - v), s.cy - s.h + (s.h / 100) * (u + v)];
}

function SlabBody({ s }: { s: Slab }) {
  const { cx, cy, w, h, t } = s;
  return (
    <>
      <path className="slab__side" d={`M${cx - w} ${cy}L${cx} ${cy + h}V${cy + h + t}L${cx - w} ${cy + t}Z`} />
      <path className="slab__side slab__side--r" d={`M${cx} ${cy + h}L${cx + w} ${cy}V${cy + t}L${cx} ${cy + h + t}Z`} />
      <path className="slab__top" d={`M${cx} ${cy - h}L${cx + w} ${cy}L${cx} ${cy + h}L${cx - w} ${cy}Z`} />
      <path
        className="ln slab__edge"
        d={`M${cx} ${cy - h}L${cx + w} ${cy}L${cx} ${cy + h}L${cx - w} ${cy}Z M${cx - w} ${cy}V${cy + t}L${cx} ${cy + h + t}L${cx + w} ${cy + t}V${cy} M${cx} ${cy + h}V${cy + h + t}`}
      />
    </>
  );
}

/* ---------- Face details, in plane units ---------- */

/** A glyph drawn upright (local units), laid flat on the face at (u, v). */
function Flat({ u, v, children }: { u: number; v: number; children: ReactNode }) {
  return <g transform={`translate(${u} ${v}) rotate(-45)`}>{children}</g>;
}

function ReactMark() {
  return (
    <g>
      <ellipse className="ln ln--mark" rx="15" ry="5.6" />
      <ellipse className="ln ln--mark" rx="15" ry="5.6" transform="rotate(60)" />
      <ellipse className="ln ln--mark" rx="15" ry="5.6" transform="rotate(-60)" />
      <circle className="mark-dot" r="2" />
    </g>
  );
}

function VueMark() {
  return (
    <g transform="translate(0 -1)">
      <path className="ln ln--mark" d="M-16 -11 0 15 16 -11H9.5L0 4.5-9.5 -11Z" />
      <path className="ln ln--mark" d="M-9.5 -11 0 4.5 9.5 -11H4.6L0 -3.4-4.6 -11Z" />
    </g>
  );
}

function SvelteMark() {
  // The Svelte mark's two outlines (98 × 118 units), scaled to sit with the others.
  return (
    <g transform="scale(0.25) translate(-49 -59)">
      <path
        className="ln ln--mark"
        d="M91.8 15.6C80.9-.1 59.2-4.7 43.6 5.2L16.1 22.8C8.6 27.5 3.4 35.2 1.9 43.9c-1.3 7.3-.2 14.8 3.3 21.3-2.4 3.6-4 7.6-4.7 11.8-1.6 8.9.5 18.1 5.7 25.4 11 15.7 32.6 20.3 48.2 10.4l27.5-17.5c7.5-4.7 12.7-12.4 14.2-21.1 1.3-7.3.2-14.8-3.3-21.3 2.4-3.6 4-7.6 4.7-11.8 1.7-9-.4-18.2-5.7-25.5Z"
      />
      <path
        className="ln ln--mark"
        d="M40.9 103.9c-8.9 2.3-18.2-1.2-23.4-8.7-3.2-4.4-4.4-9.9-3.5-15.3.2-.9.4-1.7.6-2.6l.5-1.6 1.4 1c3.3 2.4 6.9 4.2 10.8 5.4l1 .3-.1 1c-.1 1.4.3 2.9 1.1 4.1 1.6 2.3 4.4 3.4 7.1 2.7.6-.2 1.2-.4 1.7-.7L65.5 72c1.4-.9 2.3-2.2 2.6-3.8.3-1.6-.1-3.3-1-4.6-1.6-2.3-4.4-3.3-7.1-2.6-.6.2-1.2.4-1.7.7l-10.5 6.7c-1.7 1.1-3.6 1.9-5.6 2.4-8.9 2.3-18.2-1.2-23.4-8.7-3.1-4.4-4.4-9.9-3.4-15.3.9-5.2 4.1-9.9 8.6-12.7l27.5-17.5c1.7-1.1 3.6-1.9 5.6-2.5 8.9-2.3 18.2 1.2 23.4 8.7 3.2 4.4 4.4 9.9 3.5 15.3-.2.9-.4 1.7-.7 2.6l-.5 1.6-1.4-1c-3.3-2.4-6.9-4.2-10.8-5.4l-1-.3.1-1c.1-1.4-.3-2.9-1.1-4.1-1.6-2.3-4.4-3.3-7.1-2.6-.6.2-1.2.4-1.7.7L32.4 46.1c-1.4.9-2.3 2.2-2.6 3.8s.1 3.3 1 4.6c1.6 2.3 4.4 3.3 7.1 2.6.6-.2 1.2-.4 1.7-.7l10.5-6.7c1.7-1.1 3.6-1.9 5.6-2.5 8.9-2.3 18.2 1.2 23.4 8.7 3.2 4.4 4.4 9.9 3.5 15.3-.9 5.2-4.1 9.9-8.6 12.7l-27.5 17.5c-1.7 1.1-3.6 1.9-5.6 2.5Z"
      />
    </g>
  );
}

function AlpineMark() {
  return (
    <g>
      <path className="ln ln--mark" d="M-15 6 -6.5 -6 2 6Z" />
      <path className="ln ln--mark" d="M-1 6 7.5 -6 16 6Z" />
    </g>
  );
}

function IslandFace() {
  return (
    <g transform={plane(S.island)}>
      <path className="ln ln--fine" d="M9 9H91V91H9Z" />
      <Flat u={20.37} v={79.63}>
        <ReactMark />
      </Flat>
      <Flat u={50} v={50}>
        <VueMark />
      </Flat>
      <Flat u={79.63} v={20.37}>
        <SvelteMark />
      </Flat>
    </g>
  );
}

function MeshFace() {
  const pads: Array<[number, number]> = [];
  for (const p of [30, 50, 70]) {
    pads.push([p, 15], [p, 85], [15, p], [85, p]);
  }
  return (
    <g transform={plane(S.mesh)}>
      <path className="ln ln--fine" d="M9 9H91V91H9Z" />
      {/* traces: one per channel, from the port to a pad on the front edges */}
      <path className="ln ln--fine" d="M61 50H85M50 61V85" />
      <path className="ln ln--accent mesh__trace" d="M58 58 70 70H85" />
      {pads.map(([u, v]) => (
        <rect key={`${u}-${v}`} className="mesh__pad" x={u - 2.6} y={v - 2.6} width="5.2" height="5.2" />
      ))}
      <rect className="mesh__pad mesh__pad--on" x={85 - 2.6} y={70 - 2.6} width="5.2" height="5.2" />
      <circle className="ln mesh__port" cx="50" cy="50" r="11" />
      <circle className="ln ln--fine" cx="50" cy="50" r="5.5" />
    </g>
  );
}

function LivewireFace() {
  const cells: Array<[number, number]> = [
    [42, 40],
    [78, 40],
    [42, 58],
    [60, 58],
    [78, 58],
  ];
  return (
    <g transform={plane(S.livewire)}>
      <path className="ln ln--fine" d="M8 8H92V92H8Z" />
      {cells.map(([u, v]) => (
        <path key={`${u}-${v}`} className="ln lw__cell" d={`M${u - 5} ${v - 5}h10v10h-10Z`} />
      ))}
      <path className="lw__cell--on" d="M54.5 34.5h11v11h-11Z" />
      {/* Alpine's landing pad, near the left corner */}
      <path className="ln lw__pad" d="M6.7 83.3h10v10h-10Z" />
    </g>
  );
}

function LaravelFace() {
  // A base plate: bolted at the corners, ruled through the middle.
  const bolts: Array<[number, number]> = [
    [18, 18],
    [82, 18],
    [18, 82],
    [82, 82],
  ];
  return (
    <g transform={plane(S.laravel)}>
      <path className="ln ln--fine" d="M8 8H92V92H8Z" />
      <path className="ln ln--fine" d="M30 40H70M30 50H70M30 60H70" />
      {bolts.map(([u, v]) => (
        <g key={`${u}-${v}`}>
          <circle className="ln ln--fine" cx={u} cy={v} r="4.2" />
          <circle className="mark-dot" cx={u} cy={v} r="1.3" />
        </g>
      ))}
    </g>
  );
}

/* ---------- Layers, labels ---------- */

type LabelSpec = {
  id: Exclude<LayerId, 'alpine'>;
  n: number;
  name: string;
  value: string;
  href: string;
  y: number;
  x: number;
};

const LABELS: LabelSpec[] = [
  {
    id: 'island',
    n: 1,
    name: 'Island',
    value: 'Your React, Vue or Svelte component.',
    href: '/docs/guides/components',
    y: S.island.cy,
    x: S.island.cx + S.island.w,
  },
  {
    id: 'mesh',
    n: 2,
    name: 'Mesh',
    value: 'The bridge: props, entangle, $wire, lifecycle, lazy chunks.',
    href: '/docs/how-it-works',
    y: S.mesh.cy,
    x: S.mesh.cx + S.mesh.w,
  },
  {
    id: 'livewire',
    n: 3,
    name: 'Livewire 4',
    value: 'Owns the state: properties, actions, validation.',
    href: '/docs/reference/component',
    y: S.livewire.cy,
    x: S.livewire.cx + S.livewire.w,
  },
  {
    id: 'laravel',
    n: 4,
    name: 'Laravel',
    value: 'Routes, models, auth. Unchanged.',
    href: '/docs/installation',
    y: S.laravel.cy,
    x: S.laravel.cx + S.laravel.w,
  },
];

/** Assembled → exploded: each slab starts nudged toward the middle. */
const DY: Record<LayerId, number> = {
  island: 64,
  mesh: 24,
  alpine: 24,
  livewire: -24,
  laravel: -64,
};

function Layer({
  id,
  hot,
  onHot,
  children,
}: {
  id: LayerId;
  hot: LayerId | null;
  onHot: (id: LayerId | null) => void;
  children: ReactNode;
}) {
  return (
    <g
      className={cn('slab', hot === id && 'is-hot', hot && hot !== id && 'is-dim')}
      data-layer={id}
      style={{ '--dy': `${DY[id]}px` } as CSSProperties}
      onPointerEnter={() => onHot(id)}
      onPointerLeave={() => onHot(null)}
    >
      {children}
    </g>
  );
}

/* Wire endpoints (screen units). */
const WIRE_UP = { x: S.island.cx, top: S.island.cy + S.island.h + S.island.t, bottom: S.mesh.cy };
const [CELL_X, CELL_Y] = onPlane(S.livewire, 60, 40);
const WIRE_DOWN = { x: S.mesh.cx, top: S.mesh.cy + S.mesh.h + S.mesh.t, bottom: CELL_Y };
const [PAD_X, PAD_Y] = onPlane(S.livewire, 11.7, 88.3);
const ALPINE_WIRE = { x: S.alpine.cx, top: S.alpine.cy + S.alpine.h + S.alpine.t, bottom: PAD_Y };

/**
 * Fig. 1 — exploded isometric view of the Mesh stack: the island on top, Mesh
 * as the bridge plate, the Livewire component that owns state, and Laravel.
 * Alpine sits beside Mesh and still talks to Livewire directly.
 */
export function HeroFigure() {
  const svgRef = useRef<SVGSVGElement>(null);
  const [hot, setHot] = useState<LayerId | null>(null);
  const upRef = useRef<SVGGElement>(null);
  const downRef = useRef<SVGGElement>(null);
  const runRef = useRef(0);
  const busyRef = useRef(false);
  const drawnRef = useRef(false);

  /** One round trip: props up the wire, then a write back down. */
  const sendPackets = useCallback(() => {
    if (prefersReducedMotion() || busyRef.current) return;
    busyRef.current = true;
    const run = ++runRef.current;

    type Leg = { seg: 'up' | 'down'; from: number; to: number; kind: 'dot' | 'box'; dur: number; gap: number };
    const legs: Leg[] = [
      { seg: 'down', from: WIRE_DOWN.bottom, to: WIRE_DOWN.top - 6, kind: 'dot', dur: 620, gap: 0 },
      { seg: 'up', from: WIRE_UP.bottom, to: WIRE_UP.top - 6, kind: 'dot', dur: 560, gap: 40 },
      { seg: 'up', from: WIRE_UP.top - 6, to: WIRE_UP.bottom, kind: 'box', dur: 560, gap: 520 },
      { seg: 'down', from: WIRE_DOWN.top - 6, to: WIRE_DOWN.bottom, kind: 'box', dur: 620, gap: 40 },
    ];

    let i = 0;
    const nextLeg = () => {
      if (run !== runRef.current) return;
      const leg = legs[i++];
      if (!leg) {
        busyRef.current = false;
        return;
      }
      // Packets move by attribute, not state, so the drawing never re-renders.
      const el = leg.seg === 'up' ? upRef.current : downRef.current;
      const x = leg.seg === 'up' ? WIRE_UP.x : WIRE_DOWN.x;
      if (!el) {
        busyRef.current = false;
        return;
      }
      window.setTimeout(() => {
        let start: number | null = null;
        el.dataset.kind = leg.kind;
        const frame = (now: number) => {
          if (run !== runRef.current) {
            el.style.opacity = '0';
            return;
          }
          if (start === null) start = now;
          const t = Math.min(1, (now - start) / leg.dur);
          const y = leg.from + (leg.to - leg.from) * easeInOutCubic(t);
          el.setAttribute('transform', `translate(${x} ${y.toFixed(1)})`);
          el.style.opacity = String(Math.min(1, t / 0.12, (1 - t) / 0.12));
          if (t < 1) requestAnimationFrame(frame);
          else {
            el.style.opacity = '0';
            nextLeg();
          }
        };
        requestAnimationFrame(frame);
      }, leg.gap);
    };
    nextLeg();
  }, []);

  const onHot = useCallback(
    (id: LayerId | null) => {
      if (!hasFinePointer()) return;
      setHot(id);
      // Hovering the bridge replays one round trip along the wire.
      if (id === 'mesh' && drawnRef.current) sendPackets();
    },
    [sendPackets],
  );

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;
    if (prefersReducedMotion()) {
      svg.classList.add('is-armed', 'is-drawn');
      return;
    }
    const lines = drawableLines(svg);
    armLines(svg, lines);
    svg.classList.add('is-armed');
    const timers: number[] = [];
    const stop = onceInView(
      svg,
      () => {
        svg.getBoundingClientRect();
        timers.push(...playLines(lines, { dur: 1000, stagger: 22, cap: 480, delay: 120 }));
        svg.classList.add('is-drawn');
        timers.push(
          window.setTimeout(() => {
            drawnRef.current = true;
            sendPackets();
          }, 1500),
        );
      },
      '0px',
    );
    const runs = runRef;
    const busy = busyRef;
    return () => {
      stop();
      timers.forEach((t) => clearTimeout(t));
      runs.current += 1;
      busy.current = false;
      settleLines(lines);
      svg.classList.remove('is-armed', 'is-drawn');
    };
  }, [sendPackets]);

  const packetEl = (seg: 'up' | 'down') => (
    <g ref={seg === 'up' ? upRef : downRef} className="packet" data-kind="dot" style={{ opacity: 0 }}>
      <circle className="packet__dot" r="4" />
      <rect className="packet__box" x="-3.6" y="-3.6" width="7.2" height="7.2" transform="rotate(45)" />
    </g>
  );

  const hotLabel = hot && hot !== 'alpine' ? hot : null;

  return (
    <figure className="stack" aria-labelledby="fig-stack-cap">
      <div className="stack__fig">
        <svg
          ref={svgRef}
          className="stack__svg"
          viewBox={`0 0 ${VB.w} ${VB.h}`}
          data-draw=""
          aria-hidden="true"
          focusable="false"
        >
          {/* the browser / server boundary runs through the bridge layer */}
          <g className="stack__boundary">
            <path className="ln ln--fine ln--center" d={`M0 ${S.mesh.cy}H${S.mesh.cx - S.mesh.w}`} />
            <text className="svg-k svg-k--dim" x="2" y={S.mesh.cy - 7}>
              BROWSER
            </text>
            <text className="svg-k svg-k--dim" x="2" y={S.mesh.cy + 15}>
              SERVER
            </text>
          </g>

          <Layer id="laravel" hot={hot} onHot={onHot}>
            <SlabBody s={S.laravel} />
            <LaravelFace />
          </Layer>

          {/* exploded-view alignment lines between same-size slabs */}
          <path
            className="ln ln--dash stack__align"
            d={`M${S.livewire.cx - S.livewire.w} ${S.livewire.cy + S.livewire.t}V${S.laravel.cy} M${S.livewire.cx + S.livewire.w} ${S.livewire.cy + S.livewire.t}V${S.laravel.cy}`}
          />

          <Layer id="livewire" hot={hot} onHot={onHot}>
            <SlabBody s={S.livewire} />
            <LivewireFace />
          </Layer>

          {/* Alpine → Livewire, direct */}
          <g className={cn('wire wire--alpine', (hot === 'alpine' || hot === 'livewire') && 'is-hot')}>
            <path className="ln" d={`M${ALPINE_WIRE.x} ${ALPINE_WIRE.top}V${ALPINE_WIRE.bottom}`} />
            <circle className="wire__end" cx={PAD_X} cy={PAD_Y} r="2.2" />
          </g>

          {/* Mesh → Livewire */}
          <g className={cn('wire', hot === 'mesh' && 'is-hot')}>
            <path className="ln ln--accent wire__line" d={`M${WIRE_DOWN.x} ${WIRE_DOWN.top}V${WIRE_DOWN.bottom}`} />
            <circle className="wire__end wire__end--accent" cx={CELL_X} cy={CELL_Y} r="2.4" />
          </g>
          {packetEl('down')}

          <Layer id="alpine" hot={hot} onHot={onHot}>
            <SlabBody s={S.alpine} />
            <g transform={plane(S.alpine)}>
              <Flat u={50} v={50}>
                <g transform="scale(1.7)">
                  <AlpineMark />
                </g>
              </Flat>
            </g>
          </Layer>

          <Layer id="mesh" hot={hot} onHot={onHot}>
            <SlabBody s={S.mesh} />
            <MeshFace />
          </Layer>

          <path
            className="ln ln--dash stack__align"
            d={`M${S.island.cx - S.island.w} ${S.island.cy + S.island.t}V${S.mesh.cy} M${S.island.cx + S.island.w} ${S.island.cy + S.island.t}V${S.mesh.cy}`}
          />

          {/* Island → Mesh */}
          <g className={cn('wire', hot === 'mesh' && 'is-hot')}>
            <path className="ln ln--accent wire__line" d={`M${WIRE_UP.x} ${WIRE_UP.top}V${WIRE_UP.bottom}`} />
          </g>
          {packetEl('up')}

          <Layer id="island" hot={hot} onHot={onHot}>
            <SlabBody s={S.island} />
            <IslandFace />
          </Layer>

          {/* Alpine callout (it has no row in the label column) */}
          <g className={cn('stack__callout', hot === 'alpine' && 'is-hot')}>
            <path className="ln stack__leader" d={`M${S.alpine.cx} ${S.alpine.cy - S.alpine.h}V${S.alpine.cy - S.alpine.h - 30}`} />
            <circle className="stack__node" cx={S.alpine.cx} cy={S.alpine.cy - S.alpine.h} r="2.2" />
            <g className="stack__callout-wide">
              <text className="svg-k stack__callout-k" x="2" y={S.alpine.cy - S.alpine.h - 52}>
                ALPINE
              </text>
              <text className="svg-k svg-k--dim" x="2" y={S.alpine.cy - S.alpine.h - 39}>
                DIRECT TO LIVEWIRE
              </text>
            </g>
            {/* phones: the whole figure scales down, so the callout is set larger, on three lines */}
            <g className="stack__callout-narrow">
              <text className="svg-k stack__callout-k" x="2" y={S.alpine.cy - S.alpine.h - 77}>
                ALPINE
              </text>
              <text className="svg-k svg-k--dim" x="2" y={S.alpine.cy - S.alpine.h - 56}>
                DIRECT TO
              </text>
              <text className="svg-k svg-k--dim" x="2" y={S.alpine.cy - S.alpine.h - 39}>
                LIVEWIRE
              </text>
            </g>
          </g>

          {/* leaders */}
          <g className="stack__leaders">
            {LABELS.map((l) => (
              <g key={l.id} className={cn(hotLabel === l.id && 'is-hot')}>
                <path className="ln stack__leader" d={`M${l.x} ${l.y}H${VB.w}`} />
                <circle className="stack__node" cx={l.x} cy={l.y} r="2.4" />
              </g>
            ))}
          </g>
          {/* balloons replace the HTML leaders on narrow screens */}
          <g className="stack__balloons">
            {LABELS.map((l) => (
              <g key={l.id}>
                <circle cx={VB.w - 13} cy={l.y} r="11" />
                <text x={VB.w - 13} y={l.y + 4} textAnchor="middle">
                  {l.n}
                </text>
              </g>
            ))}
          </g>
        </svg>

        <ol className="stack__labels">
          {LABELS.map((l) => (
            <li
              key={l.id}
              style={{ '--y': pct(l.y) } as CSSProperties}
              className={cn(hotLabel === l.id && 'is-hot')}
              onPointerEnter={() => onHot(l.id)}
              onPointerLeave={() => onHot(null)}
            >
              <Link
                href={l.href}
                className="stack__lbl"
                onFocus={() => setHot(l.id)}
                onBlur={() => setHot(null)}
              >
                <span className="stack__k">
                  <span className="balloon">{l.n}</span>
                  {l.name}
                </span>
                <span className="stack__v">{l.value}</span>
              </Link>
            </li>
          ))}
        </ol>
      </div>
      <figcaption className="fig-cap k" id="fig-stack-cap">
        <span className="fig-cap__n">Fig. 1 ·</span> Exploded view of the stack. Mesh is the bridge plate
        between your island and the Livewire component; Alpine still talks to Livewire directly.
        <span className="vh">
          Diagram description: four layers, exploded vertically. At the top, the island: your React,
          Vue or Svelte component. Below it, Mesh, the bridge, which carries props, two-way entangled
          state and $wire calls across the browser and server boundary. Below that, the Livewire 4
          component, which owns the state. At the bottom, Laravel. An accent wire runs from the island
          through Mesh to one property on the Livewire component. Beside Mesh, a smaller Alpine block
          connects straight down to the Livewire component without going through Mesh.
        </span>
      </figcaption>
    </figure>
  );
}
