'use client';

import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from 'react';
import {
  BORE,
  CAV,
  CHAMBER,
  COMP,
  CUT,
  DIM_Y,
  GLYPH_X,
  GLYPH_Y,
  H,
  HEAD_Y,
  ISLAND,
  LOOP_DOWN,
  LOOP_UP,
  PAGE,
  ROOT,
  SEC,
  T,
  W,
  WIRE,
  WRAP,
  along,
  arrowHead,
  hatch,
  sweepDelay,
  type Pt,
} from './geometry';
import './hero-figure.css';

/**
 * Fig. 1 — "Section A–A": a server-rendered Blade page drawn in plan, cut
 * through its island, and shown in section below. The island is a cavity in
 * the hatched, server-rendered page; the framework component sits in it,
 * lined by the Mesh bridge, on top of the Livewire component that owns the
 * state, on top of Laravel. A calm signal loops up (props) and back down
 * ($call / useEntangle).
 */

type Phase = 'pre' | 'armed' | 'run' | 'live' | 'static';
type PartId = 'tag' | 'chunk' | 'bridge' | 'props' | 'entangle' | 'call';

type Callout = {
  id: PartId;
  n: number;
  side: 'l' | 'r' | 't';
  b: Pt;
  lines: string[];
  leader: Pt[];
  term: 'arrow' | 'dot';
  hit: { x: number; y: number; w: number; h: number };
  label: string;
};

const CALLOUTS: Callout[] = [
  {
    id: 'tag',
    n: 1,
    side: 't',
    b: [452, 30],
    lines: ['<mesh:counter />', 'BLADE TAG · ISLAND SLOT'],
    leader: [
      [446.15, 35.46],
      [ISLAND.x1 + 1, 100],
    ],
    term: 'arrow',
    hit: { x: 306, y: 16, w: 158, h: 30 },
    label: '<mesh:counter />: the Blade tag that reserves the island slot in the page',
  },
  {
    id: 'chunk',
    n: 2,
    side: 'l',
    b: [108, 258],
    lines: ['LAZY CHUNK', 'loaded on demand'],
    leader: [
      [116, 258],
      [124, 258],
      [257, 284],
    ],
    term: 'dot',
    hit: { x: 4, y: 246, w: 114, h: 30 },
    label: 'Lazy chunk: the component is code-split and loaded on its own',
  },
  {
    id: 'bridge',
    n: 3,
    side: 'r',
    b: [452, 250],
    lines: ['MESH BRIDGE', 'display: contents', '→ .mesh-root'],
    leader: [
      [444, 250],
      [436, 250],
      [ROOT.x1 + 1, 272],
    ],
    term: 'arrow',
    hit: { x: 442, y: 238, w: 116, h: 42 },
    label: 'Mesh bridge: a display: contents wrapper around .mesh-root, where the component mounts',
  },
  {
    id: 'props',
    n: 4,
    side: 'l',
    b: [108, 318],
    lines: ['props', 'state → island'],
    leader: [
      [116, 318],
      [124, 318],
      [BORE.l - BORE.half - 0.5, 334],
    ],
    term: 'arrow',
    hit: { x: 4, y: 306, w: 114, h: 30 },
    label: 'props: Livewire state passed up into the island',
  },
  {
    id: 'entangle',
    n: 5,
    side: 'r',
    b: [452, 314],
    lines: ['useEntangle', 'two-way binding'],
    leader: [
      [444, 314],
      [436, 314],
      [BORE.r + BORE.half + 0.5, 324],
    ],
    term: 'arrow',
    hit: { x: 442, y: 302, w: 116, h: 30 },
    label: 'useEntangle: a two-way binding between the island and a Livewire property',
  },
  {
    id: 'call',
    n: 6,
    side: 'r',
    b: [452, 366],
    lines: ['$call', 'runs a PHP method'],
    leader: [
      [444, 366],
      [436, 366],
      [BORE.r + BORE.half + 0.5, 340],
    ],
    term: 'arrow',
    hit: { x: 442, y: 354, w: 116, h: 30 },
    label: '$call: the island calls a method on the Livewire component',
  },
];

const NARROW_VB = { x: 96, w: 368 };
const NARROW_MAX = 440;
const NARROW_BELOW = 470;

/* ---------- small helpers ---------- */
const cssVars = (vars: Record<string, string | number>) => vars as CSSProperties;
const delay = (ms: number) => cssVars({ '--d': `${Math.round(ms)}ms` });
const planDelay = (i: number) => Math.min(i * T.planStagger, T.planCap);
const pts = (list: readonly Pt[]) => list.map((p) => p.join(',')).join(' ');

/** A horizontal section edge that is "cut" left→right as the sweep passes. */
function SweepH({ x1, x2, y, className = '' }: { x1: number; x2: number; y: number; className?: string }) {
  const a = sweepDelay(x1);
  const b = sweepDelay(x2);
  return (
    <line
      x1={x1}
      y1={y}
      x2={x2}
      y2={y}
      className={`ln hl-section-edge hl-section-sh ${className}`}
      style={cssVars({ '--d': `${a}ms`, '--dur': `${Math.max(60, b - a)}ms` })}
    />
  );
}

/** A vertical section edge: appears as the sweep reaches its x. */
function SweepV({ x, y1, y2, className = '' }: { x: number; y1: number; y2: number; className?: string }) {
  return (
    <line
      x1={x}
      y1={y1}
      x2={x}
      y2={y2}
      className={`ln hl-section-edge hl-section-sx ${className}`}
      style={delay(sweepDelay(x))}
    />
  );
}

function Hatch({
  rect,
  step,
  dir,
  className,
}: {
  rect: [number, number, number, number];
  step: number;
  dir: 1 | -1;
  className: string;
}) {
  return (
    <>
      {hatch(rect[0], rect[1], rect[2], rect[3], step, dir).map((s, i) => (
        <line
          key={i}
          x1={s.x1}
          y1={s.y1}
          x2={s.x2}
          y2={s.y2}
          className={`hl-section-hatch hl-section-sx ${className}`}
          style={delay(sweepDelay(Math.max(s.x1, s.x2)) + 90)}
        />
      ))}
    </>
  );
}

/** A paper knockout behind a label inside hatching. */
function Knock({ x, y, w, h, at }: { x: number; y: number; w: number; h: number; at: number }) {
  return <rect x={x} y={y} width={w} height={h} className="hl-section-knock hl-section-sx" style={delay(at)} />;
}

function ReactGlyph({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <ellipse rx="7.4" ry="2.75" className="hl-section-glyph" />
      <ellipse rx="7.4" ry="2.75" className="hl-section-glyph" transform="rotate(60)" />
      <ellipse rx="7.4" ry="2.75" className="hl-section-glyph" transform="rotate(-60)" />
      <circle r="1.25" className="hl-section-glyph-dot" />
    </g>
  );
}

function VueGlyph({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <path d="M-8.2,-6.2 L-4.9,-6.2 L0,2.3 L4.9,-6.2 L8.2,-6.2 L0,7.8 Z" className="hl-section-glyph" />
      <path d="M-4.9,-6.2 L-2.3,-6.2 L0,-2.2 L2.3,-6.2 L4.9,-6.2" className="hl-section-glyph" />
    </g>
  );
}

function SvelteGlyph({ x, y }: { x: number; y: number }) {
  // Drawn as a ribbon: a wide ink stroke with a narrower paper stroke on top.
  const d =
    'M4.3,-5.7 C2.3,-7.9 -2.6,-7.7 -4.3,-4.8 C-5.6,-2.5 -3.8,-0.7 0,0 C3.8,0.7 5.6,2.5 4.3,4.8 C2.6,7.7 -2.3,7.9 -4.3,5.7';
  return (
    <g transform={`translate(${x} ${y}) rotate(-12)`}>
      <path d={d} className="hl-section-ribbon" />
      <path d={d} className="hl-section-ribbon-in" />
    </g>
  );
}

/* ====================================================================== */

export function HeroFigure() {
  const rootRef = useRef<HTMLElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const dotRef = useRef<SVGGElement>(null);
  const islandValRef = useRef<SVGTextElement>(null);
  const stateValRef = useRef<SVGTSpanElement>(null);
  const plusRef = useRef<SVGRectElement>(null);
  const pulseTopRef = useRef<SVGCircleElement>(null);
  const pulseBotRef = useRef<SVGCircleElement>(null);

  const [phase, setPhase] = useState<Phase>('pre');
  const [active, setActive] = useState<PartId | null>(null);
  const [narrow, setNarrow] = useState(false);

  /* Narrow stages crop to the drawing and move the callout labels into a list. */
  useEffect(() => {
    const stage = stageRef.current;
    if (!stage || typeof ResizeObserver === 'undefined') return;
    const ro = new ResizeObserver(([entry]) => setNarrow(entry.contentRect.width < NARROW_BELOW));
    ro.observe(stage);
    return () => ro.disconnect();
  }, []);

  /* Arm the draw-in (or settle straight into the static drawing). */
  useLayoutEffect(() => {
    const svg = svgRef.current;
    const stage = stageRef.current;
    if (!svg || !stage) return;
    const width = stage.clientWidth;
    const isNarrow = width > 0 && width < NARROW_BELOW;
    setNarrow(isNarrow);
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) {
      setPhase('static');
      return;
    }
    // Strokes are non-scaling, so some engines dash in screen space: arm with
    // the larger of the user-space and on-screen lengths (for the final layout).
    const scale = isNarrow ? Math.min(width, NARROW_MAX) / NARROW_VB.w : (width || W) / W;
    svg.querySelectorAll<SVGGeometryElement>('[data-dl]').forEach((el) => {
      let len = 0;
      try {
        len = el.getTotalLength();
      } catch {
        len = 0;
      }
      if (!len) return;
      const d = Math.ceil(Math.max(len, len * scale)) + 4;
      el.style.strokeDasharray = `${d} ${d}`;
      el.style.strokeDashoffset = String(d);
    });
    setPhase('armed');
  }, []);

  /* Play: plan lines draw, the cut sweeps, the chunk drops in, callouts land. */
  useEffect(() => {
    if (phase !== 'armed') return;
    const svg = svgRef.current;
    if (!svg) return;
    let raf2 = 0;
    const raf1 = requestAnimationFrame(() => {
      raf2 = requestAnimationFrame(() => {
        svg.querySelectorAll<SVGGeometryElement>('[data-dl]').forEach((el) => {
          const d = Number(el.dataset.d || 0);
          const dur = Number(el.dataset.dur || T.planDur);
          el.style.transition = `stroke-dashoffset ${dur}ms cubic-bezier(0.23, 1, 0.32, 1) ${d}ms`;
          el.style.strokeDashoffset = '0';
        });
        setPhase('run');
      });
    });
    return () => {
      cancelAnimationFrame(raf1);
      cancelAnimationFrame(raf2);
    };
  }, [phase]);

  useEffect(() => {
    if (phase !== 'run') return;
    const svg = svgRef.current;
    const t = window.setTimeout(() => {
      svg?.querySelectorAll<SVGGeometryElement>('[data-dl]').forEach((el) => {
        el.style.transition = '';
        el.style.strokeDasharray = '';
        el.style.strokeDashoffset = '';
      });
      setPhase('live');
    }, T.liveAt);
    return () => window.clearTimeout(t);
  }, [phase]);

  /* The living loop: props up, $call down, the count ticks over. */
  useEffect(() => {
    if (phase !== 'live') return;
    const root = rootRef.current;
    const dot = dotRef.current;
    if (!root || !dot) return;
    // Head first, then the two trailing ghosts.
    const heads = Array.from(dot.querySelectorAll<SVGCircleElement>('circle')).reverse();

    const UP = 1250;
    const HOLD_TOP = 1650;
    const DOWN = 1250;
    const HOLD_BOT = 750;
    const CYCLE = UP + HOLD_TOP + DOWN + HOLD_BOT;
    const ease = (p: number) => 0.5 - Math.cos(Math.PI * p) / 2;

    let value = 3;
    let start = performance.now();
    let last = start;
    let raf = 0;
    let running = false;
    const fired = { top: -1, press: -1, bot: -1 };

    const kick = (el: Element | null, cls: string) => {
      if (!el) return;
      el.classList.remove(cls);
      void el.getBoundingClientRect();
      el.classList.add(cls);
    };

    const place = (path: Pt[], p: number) => {
      const fade = Math.min(1, p / 0.1, (1 - p) / 0.1);
      heads.forEach((c, i) => {
        const q = Math.max(0, p - i * 0.045);
        const [x, y] = along(path, ease(q));
        c.setAttribute('cx', x.toFixed(2));
        c.setAttribute('cy', y.toFixed(2));
        c.style.opacity = String(Math.max(0, fade) * (i === 0 ? 1 : i === 1 ? 0.45 : 0.2));
      });
    };
    const hide = () => {
      heads.forEach((c) => (c.style.opacity = '0'));
    };

    const tick = (now: number) => {
      if (now - last > 250) start += now - last - 16;
      last = now;
      const t = now - start;
      const c = Math.floor(t / CYCLE);
      const u = t - c * CYCLE;
      if (u < UP) {
        place(LOOP_UP, u / UP);
      } else if (u < UP + HOLD_TOP) {
        hide();
        if (fired.top !== c) {
          fired.top = c;
          if (islandValRef.current) islandValRef.current.textContent = String(value);
          kick(islandValRef.current, 'is-new');
          kick(pulseTopRef.current, 'is-on');
        }
        if (u > UP + HOLD_TOP - 420 && fired.press !== c) {
          fired.press = c;
          kick(plusRef.current, 'is-press');
        }
      } else if (u < UP + HOLD_TOP + DOWN) {
        place(LOOP_DOWN, (u - UP - HOLD_TOP) / DOWN);
      } else {
        hide();
        if (fired.bot !== c) {
          fired.bot = c;
          value += 1;
          if (stateValRef.current) stateValRef.current.textContent = String(value);
          kick(stateValRef.current?.parentElement ?? null, 'is-new');
          kick(pulseBotRef.current, 'is-on');
        }
      }
      raf = requestAnimationFrame(tick);
    };

    const run = () => {
      if (running) return;
      running = true;
      last = performance.now();
      raf = requestAnimationFrame(tick);
    };
    const stop = () => {
      running = false;
      cancelAnimationFrame(raf);
    };

    let io: IntersectionObserver | null = null;
    if (typeof IntersectionObserver !== 'undefined') {
      io = new IntersectionObserver(([entry]) => (entry.isIntersecting ? run() : stop()));
      io.observe(root);
    } else {
      run();
    }
    return () => {
      stop();
      io?.disconnect();
      hide();
    };
  }, [phase]);

  const vb = narrow ? `${NARROW_VB.x} 0 ${NARROW_VB.w} ${H}` : `0 0 ${W} ${H}`;
  const vx = narrow ? NARROW_VB.x : 0;
  const vw = narrow ? NARROW_VB.w : W;

  const hot = (...ids: PartId[]) => ids.map((id) => `hl-section-p-${id}`).join(' ');

  /* ---------- A–A cutting plane: thick ends, chain between ---------- */
  const chain: { x1: number; x2: number }[] = [];
  for (let x = CUT.x0 + 14; x < CUT.x1 - 14; x += 24) {
    chain.push({ x1: x + 1.5, x2: Math.min(x + 15, CUT.x1 - 14) });
    if (x + 21 < CUT.x1 - 14) chain.push({ x1: x + 18, x2: x + 21 });
  }

  /* Plan lines draw in order; i is the stagger slot. */
  const dl = (i: number, dur?: number) => ({
    'data-dl': '',
    'data-d': planDelay(i),
    ...(dur ? { 'data-dur': dur } : {}),
  });

  const textLines: [number, number, number][] = [
    [144, 222, 86],
    [144, 216, 93],
    [144, 219, 100],
    [144, 222, 146],
    [144, 211, 153],
    [144, 190, 160],
  ];

  return (
    <figure
      ref={rootRef}
      className={`hl-section${narrow ? ' is-narrow' : ''}`}
      data-phase={phase}
      data-active={active ?? undefined}
    >
      <div ref={stageRef} className="hl-section-stage">
        <svg
          ref={svgRef}
          className="hl-section-svg"
          viewBox={vb}
          data-draw=""
          aria-hidden="true"
          focusable="false"
        >
          {/* ---------- crop marks ---------- */}
          <g className="hl-section-crop">
            <path d={`M${vx + 2},${12} V2 H${vx + 12}`} className="ln ln--fine" />
            <path d={`M${vx + vw - 12},2 H${vx + vw - 2} V12`} className="ln ln--fine" />
            <path d={`M${vx + 2},${H - 12} V${H - 2} H${vx + 12}`} className="ln ln--fine" />
            <path d={`M${vx + vw - 12},${H - 2} H${vx + vw - 2} V${H - 12}`} className="ln ln--fine" />
          </g>

          {/* ================= PLAN ================= */}
          <text x={PAGE.x0} y={30} className="svg-k svg-k--dim hl-section-k8 hl-section-fade hl-section-wide">
            PLAN · RENDERED PAGE
          </text>

          <g className="hl-section-plan">
            <rect
              x={PAGE.x0}
              y={PAGE.y0}
              width={PAGE.x1 - PAGE.x0}
              height={PAGE.y1 - PAGE.y0}
              className="ln fill-paper"
              {...dl(0, 1000)}
            />
            <line x1={PAGE.x0} y1={HEAD_Y} x2={PAGE.x1} y2={HEAD_Y} className="ln" {...dl(2)} />
            <rect x={140} y={48} width={8} height={8} className="ln" {...dl(3)} />
            <text x={154} y={55} className="svg-k svg-k--dim hl-section-k7 hl-section-fade">
              /dashboard
            </text>
            {[
              [318, 330],
              [336, 348],
              [354, 366],
            ].map(([a, b], i) => (
              <line key={i} x1={a} y1={52} x2={b} y2={52} className="ln ln--fine" {...dl(4 + i)} />
            ))}

            {/* Blade content around the island */}
            <line x1={144} y1={74} x2={204} y2={74} className="hl-section-bar" {...dl(7)} />
            {textLines.map(([a, b, y], i) => (
              <line key={y} x1={a} y1={y} x2={b} y2={y} className="ln ln--fine" {...dl(8 + i)} />
            ))}
            <rect x={144} y={122} width={40} height={13} className="ln" {...dl(10)} />
            <line x1={152} y1={128.5} x2={176} y2={128.5} className="ln ln--fine" {...dl(11)} />
            <line x1={PAGE.x0} y1={168} x2={PAGE.x1} y2={168} className="ln ln--fine" {...dl(12)} />
            <line x1={144} y1={173} x2={196} y2={173} className="ln ln--fine" {...dl(13)} />
            <line x1={392} y1={173} x2={418} y2={173} className="ln ln--fine" {...dl(13)} />

            {/* The island slot (server-rendered placeholder) */}
            <rect
              x={ISLAND.x0}
              y={ISLAND.y0}
              width={ISLAND.x1 - ISLAND.x0}
              height={ISLAND.y1 - ISLAND.y0}
              className={`ln fill-paper-2 hl-section-hl ${hot('tag')}`}
              {...dl(5, 1000)}
            />

            {/* Its hydrated content (appears when the chunk lands) */}
            <g className="hl-section-hyd">
              <text x={ISLAND.x0 + 10} y={ISLAND.y0 + 13} className="svg-k svg-k--dim hl-section-k7">
                COUNTER
              </text>
              <line
                x1={ISLAND.x0 + 10}
                y1={ISLAND.y0 + 19}
                x2={ISLAND.x1 - 10}
                y2={ISLAND.y0 + 19}
                className="ln ln--fine"
              />
              <rect x={270} y={124} width={16} height={16} className="ln fill-paper" />
              <line x1={274.5} y1={132} x2={281.5} y2={132} className="ln" />
              <text ref={islandValRef} x={306} y={137.5} textAnchor="middle" className="hl-section-val">
                3
              </text>
              <rect ref={plusRef} x={326} y={124} width={16} height={16} className="ln fill-paper hl-section-plus" />
              <line x1={330.5} y1={132} x2={337.5} y2={132} className="ln hl-section-plus-mark" />
              <line x1={334} y1={128.5} x2={334} y2={135.5} className="ln hl-section-plus-mark" />
            </g>
          </g>

          {/* Cutting plane A–A */}
          <g className="hl-section-cut">
            {chain.map((s, i) => (
              <line
                key={i}
                x1={s.x1}
                y1={CUT.y}
                x2={s.x2}
                y2={CUT.y}
                className="ln hl-section-sx"
                style={delay(sweepDelay(s.x1))}
              />
            ))}
            {[
              [CUT.x0, CUT.x0 + 14, CUT.x0 + 4],
              [CUT.x1 - 14, CUT.x1, CUT.x1 - 4],
            ].map(([a, b, ax], i) => (
              <g key={i} className="hl-section-sx" style={delay(sweepDelay(i ? CUT.x1 : CUT.x0))}>
                <line x1={a} y1={CUT.y} x2={b} y2={CUT.y} className="ln hl-section-cut-end" />
                <line x1={ax} y1={CUT.y} x2={ax} y2={CUT.y - 11} className="ln hl-section-cut-end" />
                <polygon points={arrowHead([ax, CUT.y], [ax, CUT.y - 19], 8, 3.2)} className="fill-ink" />
                <text x={ax} y={CUT.y - 23} textAnchor="middle" className="hl-section-letter">
                  A
                </text>
              </g>
            ))}
          </g>

          {/* ================= BETWEEN THE VIEWS ================= */}
          <g className="hl-section-proj">
            {[
              [PAGE.x0, PAGE.y1 + 3],
              [ISLAND.x0, ISLAND.y1 + 3],
              [ISLAND.x1, ISLAND.y1 + 3],
              [PAGE.x1, PAGE.y1 + 3],
            ].map(([x, y]) => (
              <line key={x} x1={x} y1={y} x2={x} y2={SEC.top - 4} className="ln ln--blue hl-section-projline" />
            ))}
          </g>

          <g className="hl-section-late hl-section-dim">
            <line x1={PAGE.x0} y1={DIM_Y} x2={PAGE.x1} y2={DIM_Y} className="ln hl-section-dimline" />
            {[PAGE.x0, ISLAND.x0, ISLAND.x1, PAGE.x1].map((x) => (
              <line key={x} x1={x - 3} y1={DIM_Y + 3} x2={x + 3} y2={DIM_Y - 3} className="ln" />
            ))}
            <g className="hl-section-wide-text">
              <text x={(PAGE.x0 + ISLAND.x0) / 2} y={DIM_Y - 5} textAnchor="middle" className="svg-k hl-section-k8">
                BLADE
              </text>
              <text
                x={(ISLAND.x0 + ISLAND.x1) / 2}
                y={DIM_Y - 5}
                textAnchor="middle"
                className={`svg-k hl-section-k8 hl-section-hl-t ${hot('tag')}`}
              >
                ISLAND
              </text>
              <text x={(ISLAND.x1 + PAGE.x1) / 2} y={DIM_Y - 5} textAnchor="middle" className="svg-k hl-section-k8">
                BLADE
              </text>
            </g>
          </g>

          {/* ================= SECTION A–A ================= */}
          <g className="hl-section-sec">
            {/* Blade HTML: solid server-rendered material, 45° hatch */}
            <Hatch rect={[PAGE.x0, SEC.top, CAV.x0, SEC.lw]} step={6} dir={1} className="hl-section-hatch--html" />
            <Hatch rect={[CAV.x1, SEC.top, PAGE.x1, SEC.lw]} step={6} dir={1} className="hl-section-hatch--html" />
            {/* Livewire component: the adjacent part, hatched the other way */}
            <Hatch rect={[PAGE.x0, SEC.lw, PAGE.x1, SEC.lv]} step={6} dir={-1} className="hl-section-hatch--lw" />
            {/* Laravel: cross-hatched foundation */}
            <Hatch rect={[PAGE.x0, SEC.lv, PAGE.x1, SEC.bot]} step={7} dir={1} className="hl-section-hatch--lv" />
            <Hatch rect={[PAGE.x0, SEC.lv, PAGE.x1, SEC.bot]} step={7} dir={-1} className="hl-section-hatch--lv" />

            {/* Voids cut into Livewire: the two channels and the state chamber */}
            {[BORE.l, BORE.r].map((x) => (
              <rect
                key={x}
                x={x - BORE.half}
                y={SEC.lw}
                width={BORE.half * 2}
                height={BORE.y1 - SEC.lw}
                className="hl-section-knock hl-section-sx"
                style={delay(sweepDelay(x - BORE.half))}
              />
            ))}
            <rect
              x={CHAMBER.x0}
              y={CHAMBER.y0}
              width={CHAMBER.x1 - CHAMBER.x0}
              height={CHAMBER.y1 - CHAMBER.y0}
              className="hl-section-knock hl-section-sx"
              style={delay(sweepDelay(CHAMBER.x0))}
            />

            {/* Label knockouts (hatching stops short of lettering) */}
            <Knock x={135} y={SEC.lw - 15} w={63} h={11} at={T.lateAt} />
            <Knock x={135} y={SEC.lv - 15} w={101} h={11} at={T.lateAt} />
            <Knock x={135} y={SEC.bot - 15} w={43} h={11} at={T.lateAt} />

            {/* Outline: top surface, walls, interfaces, bottom with break */}
            <SweepH x1={PAGE.x0} x2={CAV.x0} y={SEC.top} />
            <SweepH x1={CAV.x1} x2={PAGE.x1} y={SEC.top} />
            <SweepV x={PAGE.x0} y1={SEC.top} y2={SEC.bot} />
            <SweepV x={PAGE.x1} y1={SEC.top} y2={SEC.bot} />
            <SweepV x={CAV.x0} y1={SEC.top} y2={SEC.lw} className={`hl-section-hl ${hot('tag')}`} />
            <SweepV x={CAV.x1} y1={SEC.top} y2={SEC.lw} className={`hl-section-hl ${hot('tag')}`} />
            <SweepH x1={PAGE.x0} x2={CAV.x0} y={SEC.lw} />
            <SweepH x1={CAV.x0} x2={CAV.x1} y={SEC.lw} className={`hl-section-hl ${hot('tag')}`} />
            <SweepH x1={CAV.x1} x2={PAGE.x1} y={SEC.lw} />
            <SweepH x1={PAGE.x0} x2={PAGE.x1} y={SEC.lv} />
            <SweepH x1={PAGE.x0} x2={296} y={SEC.bot} />
            <path
              d={`M296,${SEC.bot} L299.5,${SEC.bot - 5} L304.5,${SEC.bot + 5} L308,${SEC.bot} H${PAGE.x1}`}
              className="ln hl-section-edge hl-section-sx"
              style={delay(sweepDelay(300))}
            />

            {/* Channels + chamber */}
            {[BORE.l, BORE.r].map((x) =>
              [x - BORE.half, x + BORE.half].map((bx) => (
                <SweepV
                  key={bx}
                  x={bx}
                  y1={BORE.y0}
                  y2={BORE.y1}
                  className={`hl-section-bore hl-section-hl ${x === BORE.l ? hot('props', 'entangle') : hot('call', 'entangle')}`}
                />
              )),
            )}
            <path
              d={`M${BORE.l - BORE.half},${CHAMBER.y0} H${CHAMBER.x0} V${CHAMBER.y1} H${CHAMBER.x1} V${CHAMBER.y0} H${BORE.r + BORE.half} M${BORE.r - BORE.half},${CHAMBER.y0} H${BORE.l + BORE.half}`}
              className="ln hl-section-edge hl-section-sx"
              style={delay(sweepDelay(CHAMBER.x0))}
            />

            {/* Mesh bridge: display: contents (phantom: it has no box) → .mesh-root (thin solid liner) */}
            <rect
              x={WRAP.x0}
              y={WRAP.y0}
              width={WRAP.x1 - WRAP.x0}
              height={WRAP.y1 - WRAP.y0}
              className={`ln hl-section-phantom hl-section-sx hl-section-hl ${hot('bridge')}`}
              style={delay(sweepDelay(WRAP.x0) + 60)}
            />
            <path
              d={`M${BORE.l - BORE.half},${ROOT.y1} H${ROOT.x0} V${ROOT.y0} H${ROOT.x1} V${ROOT.y1} H${BORE.r + BORE.half} M${BORE.r - BORE.half},${ROOT.y1} H${BORE.l + BORE.half}`}
              className={`ln hl-section-liner hl-section-sx hl-section-hl ${hot('bridge')}`}
              style={delay(sweepDelay(ROOT.x0) + 60)}
            />

            {/* Section labels */}
            <g className="hl-section-late">
              <text x={138} y={SEC.lw - 6.5} className="svg-k hl-section-k8">
                BLADE HTML
              </text>
              <text x={138} y={SEC.lv - 6.5} className="svg-k hl-section-k8">
                LIVEWIRE COMPONENT
              </text>
              <text x={138} y={SEC.bot - 6.5} className="svg-k hl-section-k8">
                LARAVEL
              </text>
              <text x={WIRE.mid} y={CHAMBER.y1 - 4} textAnchor="middle" className="svg-k hl-section-k8 hl-section-state">
                $count = <tspan ref={stateValRef}>3</tspan>
              </text>
            </g>

            {/* The framework component: the lazy chunk, dropped into the cavity */}
            <g className="hl-section-drop">
              <rect
                x={COMP.x0}
                y={COMP.y0}
                width={COMP.x1 - COMP.x0}
                height={COMP.y1 - COMP.y0}
                className={`ln fill-paper-2 hl-section-hl ${hot('chunk')}`}
              />
              <g className={`hl-section-glyphs ${hot('chunk')}`}>
                <ReactGlyph x={GLYPH_X[0]} y={GLYPH_Y} />
                <VueGlyph x={GLYPH_X[1]} y={GLYPH_Y} />
                <SvelteGlyph x={GLYPH_X[2]} y={GLYPH_Y} />
              </g>
            </g>

            {/* The one accent wire: props flow up the left channel, $call / entangle flow back down the right */}
            <g className="hl-section-wire hl-section-late">
              <line x1={WIRE.l} y1={BORE.y1 - 2} x2={WIRE.l} y2={BORE.y0 + 8} className="ln ln--accent" />
              <polygon
                points={arrowHead([WIRE.l, BORE.y1], [WIRE.l, BORE.y0 + 1], 6, 2.2)}
                className="fill-accent"
              />
              <line x1={WIRE.r} y1={BORE.y0 + 2} x2={WIRE.r} y2={BORE.y1 - 8} className="ln ln--accent" />
              <polygon
                points={arrowHead([WIRE.r, BORE.y0], [WIRE.r, BORE.y1 - 1], 6, 2.2)}
                className="fill-accent"
              />
              <circle ref={pulseTopRef} cx={GLYPH_X[1]} cy={GLYPH_Y} r={4} className="hl-section-pulse" />
              <circle ref={pulseBotRef} cx={WIRE.mid} cy={CHAMBER.y1 - 7} r={4} className="hl-section-pulse" />
            </g>
            <g ref={dotRef} className="hl-section-signal">
              <circle r={1.3} cx={WIRE.l} cy={WIRE.bot} className="hl-section-dot hl-section-dot--trail" />
              <circle r={1.8} cx={WIRE.l} cy={WIRE.bot} className="hl-section-dot hl-section-dot--trail" />
              <circle r={2.7} cx={WIRE.l} cy={WIRE.bot} className="hl-section-dot" />
            </g>
          </g>

          {/* Sweep head: the construction line that makes the cut */}
          <line
            x1={CUT.x0}
            y1={CUT.y - 6}
            x2={CUT.x0}
            y2={SEC.bot + 6}
            className="ln ln--blue hl-section-scan"
          />

          {/* ---------- title + material key ---------- */}
          <g className="hl-section-late">
            <text x={280} y={432} textAnchor="middle" className="hl-section-title">
              SECTION A–A
            </text>
            <line x1={236} y1={437.5} x2={324} y2={437.5} className="ln" />
            <text x={280} y={449} textAnchor="middle" className="svg-k svg-k--dim hl-section-k7">
              SCALE: NTS
            </text>
            <g className="hl-section-key">
              <rect x={PAGE.x0} y={424} width={14} height={9} className="ln ln--fine" />
              {hatch(PAGE.x0, 424, PAGE.x0 + 14, 433, 4, 1).map((s, i) => (
                <line key={i} x1={s.x1} y1={s.y1} x2={s.x2} y2={s.y2} className="hl-section-hatch" />
              ))}
              <text x={PAGE.x0 + 19} y={431.5} className="svg-k svg-k--dim hl-section-k7">
                SERVER-RENDERED
              </text>
              <rect x={PAGE.x1 - 14} y={424} width={14} height={9} className="ln fill-paper-2" />
              <text x={PAGE.x1 - 19} y={431.5} textAnchor="end" className="svg-k svg-k--dim hl-section-k7">
                CLIENT ISLAND
              </text>
            </g>
          </g>

          {/* ================= CALLOUTS ================= */}
          {CALLOUTS.map((c, i) => {
            const [bx, by] = c.b;
            const tip = c.leader[c.leader.length - 1];
            const prev = c.leader[c.leader.length - 2];
            const tx = c.side === 'r' ? bx + 13 : bx - (c.side === 't' ? 14 : 13);
            const anchor = c.side === 'r' ? 'start' : 'end';
            const at = T.calloutAt + i * 90;
            return (
              <g
                key={c.id}
                className={`hl-section-co${active === c.id ? ' is-active' : ''}`}
                data-co={c.id}
              >
                <polyline points={pts(c.leader)} className="ln hl-section-leader" {...{ 'data-dl': '', 'data-d': at, 'data-dur': 620 }} />
                <g className="hl-section-co-pop" style={delay(at + 380)}>
                  {c.term === 'arrow' ? (
                    <polygon points={arrowHead(prev, tip)} className="hl-section-term" />
                  ) : (
                    <circle cx={tip[0]} cy={tip[1]} r={1.9} className="hl-section-term" />
                  )}
                </g>
                <g className="hl-section-co-pop hl-section-balloon" style={delay(at)}>
                  <circle cx={bx} cy={by} r={8} className="hl-section-balloon-c" />
                  <text x={bx} y={by + 3.3} textAnchor="middle" className="hl-section-balloon-n">
                    {c.n}
                  </text>
                </g>
                <g className="hl-section-co-pop hl-section-co-text" style={delay(at + 160)}>
                  {c.lines.map((line, li) => (
                    <text
                      key={li}
                      x={tx}
                      y={by + (c.side === 't' ? -3 : 3.3) + li * 11}
                      textAnchor={anchor}
                      className={li === 0 ? 'svg-k hl-section-co-k' : 'svg-k svg-k--dim hl-section-k8'}
                    >
                      {line}
                    </text>
                  ))}
                </g>
              </g>
            );
          })}
        </svg>

        {/* Real controls over each callout (wide layout) */}
        {!narrow &&
          CALLOUTS.map((c) => (
            <button
              key={c.id}
              type="button"
              className="hl-section-hit"
              style={{
                left: `${((c.hit.x - vx) / vw) * 100}%`,
                top: `${(c.hit.y / H) * 100}%`,
                width: `${(c.hit.w / vw) * 100}%`,
                height: `${(c.hit.h / H) * 100}%`,
              }}
              aria-label={`Highlight part ${c.n}. ${c.label}`}
              onPointerEnter={() => setActive(c.id)}
              onPointerLeave={() => setActive(null)}
              onFocus={() => setActive(c.id)}
              onBlur={() => setActive(null)}
              onClick={() => setActive(c.id)}
            />
          ))}
      </div>

      {/* Narrow layout: the callout labels become a parts list */}
      {narrow ? (
        <ol className="hl-section-legend">
          {CALLOUTS.map((c) => (
            <li key={c.id}>
              <button
                type="button"
                className={`hl-section-legend-btn${active === c.id ? ' is-active' : ''}`}
                aria-label={`Highlight part ${c.n}. ${c.label}`}
                onPointerEnter={() => setActive(c.id)}
                onPointerLeave={() => setActive(null)}
                onFocus={() => setActive(c.id)}
                onBlur={() => setActive(null)}
                onClick={() => setActive(c.id)}
              >
                <span className="balloon" aria-hidden="true">
                  {c.n}
                </span>
                <span className="hl-section-legend-k">{c.lines[0]}</span>
                <span className="hl-section-legend-v">{c.lines.slice(1).join(' ')}</span>
              </button>
            </li>
          ))}
        </ol>
      ) : null}

      <p className="hl-section-vh">
        Technical drawing of a Mesh page. Top: the plan of a server-rendered Blade page with a counter island,
        reserved by the &lt;mesh:counter /&gt; tag, and a section line A–A cut through it. Below: section A–A. The
        page is solid, hatched server-rendered HTML. The island is a cavity in it that holds a React, Vue or Svelte
        component, loaded as its own lazy chunk and wrapped by the Mesh bridge: a display: contents wrapper around
        .mesh-root. The island sits on the Livewire component, which owns the state ($count), and Laravel is
        beneath. Props travel up from Livewire into the island; useEntangle and $call travel back down.
      </p>
      <figcaption className="fig-cap k">
        Fig. 1 · Section A–A through a live page: Blade all round, one island, Livewire underneath.
      </figcaption>
    </figure>
  );
}
