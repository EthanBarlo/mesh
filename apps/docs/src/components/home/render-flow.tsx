'use client';

import { type KeyboardEvent, type ReactNode, type RefObject, useCallback, useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/cn';
import { ChevronLeftIcon, ChevronRightIcon, ReplayIcon } from './icons';
import {
  armLines,
  drawableLines,
  easeInOutCubic,
  onceInView,
  playLines,
  prefersReducedMotion,
  settleLines,
} from './motion';
import { pad2 } from './sheets';

/* ==========================================================================
   Spec. Coordinates are viewBox units; every edge is an orthogonal polyline
   routed by hand for each layout, as in the portfolio's diagrams.
   ========================================================================== */

type NodeId = 'blade' | 'lw' | 'html' | 'runtime' | 'chunk' | 'renderer' | 'island';
type EdgeId = 'compile' | 'render' | 'boot' | 'lookup' | 'load' | 'paint' | 'request' | 'morph';
type Box = [x: number, y: number, w: number, h: number];
type Pt = [number, number];

const NODES: Record<NodeId, { tag: string; title: string; mono?: boolean; sub: string }> = {
  blade: { tag: 'BLADE', title: '<mesh:counter />', mono: true, sub: 'In a Livewire view' },
  lw: { tag: 'LIVEWIRE', title: 'App\\Mesh\\Counter', mono: true, sub: 'Owns the state' },
  html: { tag: 'HTML', title: 'Wrapper div', sub: 'id · props · .mesh-root' },
  runtime: { tag: 'RUNTIME', title: 'Registry', sub: 'id → lazy loader' },
  chunk: { tag: 'CHUNK', title: 'Counter', sub: 'index.tsx, lazy' },
  renderer: { tag: 'RENDERER', title: 'mount()', mono: true, sub: 'By extension' },
  island: { tag: 'ISLAND', title: 'Counter', sub: 'In .mesh-root' },
};

const EDGES: Record<EdgeId, { from: NodeId; to: NodeId; loop?: boolean }> = {
  compile: { from: 'blade', to: 'lw' },
  render: { from: 'lw', to: 'html' },
  boot: { from: 'html', to: 'runtime' },
  lookup: { from: 'runtime', to: 'chunk' },
  load: { from: 'chunk', to: 'renderer' },
  paint: { from: 'renderer', to: 'island' },
  request: { from: 'island', to: 'lw', loop: true },
  morph: { from: 'lw', to: 'island', loop: true },
};

type Label = { edges: EdgeId[]; text: string; x: number; y: number };

type Layout = {
  w: number;
  h: number;
  nodes: Record<NodeId, Box>;
  edges: Record<EdgeId, Pt[]>;
  labels: Label[];
  boundary: { d: string; a: { x: number; y: number; text: string; anchor?: 'end' }; b: { x: number; y: number; text: string; anchor?: 'end' } };
};

const WIDE: Layout = {
  w: 1000,
  h: 384,
  nodes: {
    blade: [30, 44, 230, 70],
    lw: [30, 196, 230, 70],
    html: [400, 120, 200, 70],
    runtime: [660, 44, 150, 70],
    chunk: [840, 44, 140, 70],
    renderer: [840, 196, 140, 70],
    island: [660, 196, 150, 70],
  },
  edges: {
    compile: [
      [145, 114],
      [145, 196],
    ],
    render: [
      [260, 220],
      [330, 220],
      [330, 155],
      [400, 155],
    ],
    boot: [
      [600, 155],
      [630, 155],
      [630, 79],
      [660, 79],
    ],
    lookup: [
      [810, 79],
      [840, 79],
    ],
    load: [
      [910, 114],
      [910, 196],
    ],
    paint: [
      [840, 231],
      [810, 231],
    ],
    request: [
      [700, 266],
      [700, 322],
      [100, 322],
      [100, 266],
    ],
    morph: [
      [190, 266],
      [190, 352],
      [770, 352],
      [770, 266],
    ],
  },
  labels: [
    { edges: ['compile'], text: 'PRECOMPILE', x: 145, y: 155 },
    { edges: ['render'], text: 'RENDER', x: 330, y: 187 },
    { edges: ['boot'], text: 'INIT HOOK', x: 630, y: 117 },
    { edges: ['load'], text: 'IMPORT', x: 910, y: 155 },
    { edges: ['request'], text: 'REQUEST · $CALL, ENTANGLE', x: 360, y: 322 },
    { edges: ['morph'], text: 'RESPONSE · MORPH, NEW PROPS', x: 360, y: 352 },
  ],
  boundary: {
    d: 'M500 6V378',
    a: { x: 488, y: 18, text: 'SERVER · PHP', anchor: 'end' },
    b: { x: 512, y: 18, text: 'BROWSER · JS' },
  },
};

const NARROW: Layout = {
  w: 320,
  h: 720,
  nodes: {
    blade: [44, 28, 232, 62],
    lw: [44, 122, 232, 62],
    html: [44, 236, 232, 62],
    runtime: [44, 350, 232, 62],
    chunk: [44, 444, 232, 62],
    renderer: [44, 538, 232, 62],
    island: [44, 632, 232, 62],
  },
  edges: {
    compile: [
      [160, 90],
      [160, 122],
    ],
    render: [
      [160, 184],
      [160, 236],
    ],
    boot: [
      [160, 298],
      [160, 350],
    ],
    lookup: [
      [160, 412],
      [160, 444],
    ],
    load: [
      [160, 506],
      [160, 538],
    ],
    paint: [
      [160, 600],
      [160, 632],
    ],
    request: [
      [44, 663],
      [20, 663],
      [20, 153],
      [44, 153],
    ],
    morph: [
      [276, 153],
      [300, 153],
      [300, 663],
      [276, 663],
    ],
  },
  labels: [],
  boundary: {
    d: 'M4 267H316',
    a: { x: 28, y: 229, text: 'SERVER' },
    b: { x: 28, y: 314, text: 'BROWSER' },
  },
};

type PacketKind = 'dot' | 'doc' | 'chunk' | 'box';
type Wave = Array<{ e: EdgeId; kind?: PacketKind; rev?: boolean; delay?: number }>;

type Step = {
  title: string;
  body: ReactNode;
  nodes: NodeId[];
  edges: EdgeId[];
  waves: Wave[];
};

const STEPS: Step[] = [
  {
    title: 'Blade compiles the tag',
    body: (
      <>
        Mesh&rsquo;s Blade precompiler rewrites <code>&lt;mesh:counter /&gt;</code> to{' '}
        <code>&lt;livewire:mesh::counter /&gt;</code>. Livewire resolves that to <code>App\Mesh\Counter</code>, like
        any other component.
      </>
    ),
    nodes: ['blade', 'lw'],
    edges: ['compile'],
    waves: [[{ e: 'compile' }]],
  },
  {
    title: 'The server renders a wrapper',
    body: (
      <>
        The component renders Mesh&rsquo;s wrapper: the id in <code>data-mesh-component</code>, <code>props()</code>{' '}
        as JSON in <code>data-mesh-props</code>, and an empty <code>.mesh-root</code> that Livewire leaves alone.
      </>
    ),
    nodes: ['lw', 'html'],
    edges: ['render'],
    waves: [[{ e: 'render', kind: 'doc' }]],
  },
  {
    title: 'The runtime loads the chunk',
    body: (
      <>
        In the browser, Livewire&rsquo;s <code>component.init</code> hook hands Mesh the element. Mesh looks the id up
        in the registry it built with <code>import.meta.glob</code> and imports that component&rsquo;s chunk. Only the
        first render fetches it.
      </>
    ),
    nodes: ['html', 'runtime', 'chunk'],
    edges: ['boot', 'lookup'],
    waves: [[{ e: 'boot' }], [{ e: 'lookup', kind: 'chunk' }]],
  },
  {
    title: 'The renderer mounts the island',
    body: (
      <>
        The entry&rsquo;s extension chose the renderer. It mounts the component&rsquo;s default export into{' '}
        <code>.mesh-root</code> with the parsed props and any slot HTML.
      </>
    ),
    nodes: ['chunk', 'renderer', 'island'],
    edges: ['load', 'paint'],
    waves: [[{ e: 'load', kind: 'chunk' }], [{ e: 'paint' }]],
  },
  {
    title: 'Both sides stay in step',
    body: (
      <>
        <code>useEntangle</code> and <code>$call</code> travel with Livewire&rsquo;s requests. When Livewire morphs the
        component, Mesh re-reads <code>data-mesh-props</code> and updates the island in place: no remount, and
        unchanged props are skipped.
      </>
    ),
    nodes: ['island', 'lw'],
    edges: ['request', 'morph'],
    waves: [[{ e: 'request', kind: 'box' }], [{ e: 'morph', kind: 'doc' }]],
  },
];

/* ==========================================================================
   Rendering
   ========================================================================== */

const MONO_CHAR = 0.6;
const tagWidth = (text: string, size: number, tracking: number) =>
  Math.round(text.length * size * (MONO_CHAR + tracking) + 12);
const pathD = (pts: Pt[]) => pts.map((p, i) => `${i ? 'L' : 'M'}${p[0]} ${p[1]}`).join('');

function arrowFor(pts: Pt[]) {
  const a = pts[pts.length - 2];
  const b = pts[pts.length - 1];
  const angle = Math.round((Math.atan2(b[1] - a[1], b[0] - a[0]) * 180) / Math.PI);
  return `translate(${b[0]} ${b[1]}) rotate(${angle})`;
}

function NodeView({ id, box, narrow, on, dim }: { id: NodeId; box: Box; narrow: boolean; on: boolean; dim: boolean }) {
  const n = NODES[id];
  const [x, y, w, h] = box;
  const cy = h / 2;
  const px = narrow ? 12 : 14;
  const grips: Pt[] = [
    [-4, -4],
    [w + 4, -4],
    [-4, h + 4],
    [w + 4, h + 4],
  ];
  return (
    <g className={cn('node', on && 'is-on', dim && 'is-dim')} transform={`translate(${x} ${y})`}>
      <rect className="node__halo" x={-4} y={-4} width={w + 8} height={h + 8} />
      {grips.map(([gx, gy]) => (
        <rect key={`${gx}-${gy}`} className="node__grip" x={gx - 2.5} y={gy - 2.5} width="5" height="5" />
      ))}
      <rect className="node__box" width={w} height={h} />
      <text className="node__tag" x={px} y={cy - 13}>
        {n.tag}
      </text>
      <text className={cn('node__title', n.mono && 'node__title--mono')} x={px} y={cy + 5}>
        {n.title}
      </text>
      <text className="node__sub" x={px} y={cy + 21}>
        {n.sub}
      </text>
    </g>
  );
}

const SVGNS = 'http://www.w3.org/2000/svg';

/** Packet glyphs, created imperatively so moving them never re-renders React. */
const PACKETS: Record<PacketKind, string> = {
  dot: '<circle class="packet__dot" r="4.5"/>',
  box: '<rect class="packet__token" x="-4.5" y="-4.5" width="9" height="9" transform="rotate(45)"/>',
  doc: '<rect class="packet__doc" x="-4" y="-5" width="8" height="10"/>',
  chunk: '<rect class="packet__doc" x="-3" y="-6" width="9" height="9"/><rect class="packet__chunk" x="-6" y="-3" width="9" height="9"/>',
};

type Mode = 'wide' | 'narrow';

function DiagramSvg({
  layout: L,
  narrow,
  step: st,
  svgRef,
  packetsRef,
  onEdge,
}: {
  layout: Layout;
  narrow: boolean;
  step: Step;
  packetsRef: RefObject<SVGGElement | null>;
  svgRef: RefObject<SVGSVGElement | null>;
  onEdge: (id: EdgeId, el: SVGPathElement | null) => void;
}) {
  const edgeOn = (id: EdgeId) => st.edges.includes(id);
  return (
    <svg
      ref={svgRef}
      className={cn('dg__svg', narrow ? 'dg__svg--narrow is-narrow' : 'dg__svg--wide')}
      viewBox={`0 0 ${L.w} ${L.h}`}
      data-draw=""
      aria-hidden="true"
      focusable="false"
    >
      <g className="dg__boundary">
        <path className="ln ln--fine ln--center" d={L.boundary.d} />
        {[L.boundary.a, L.boundary.b].map((t) => (
          <text key={t.text} className="dg__zone" x={t.x} y={t.y} textAnchor={t.anchor ?? 'start'}>
            {t.text}
          </text>
        ))}
      </g>

      {(Object.keys(EDGES) as EdgeId[]).map((id) => {
        const pts = L.edges[id];
        const on = edgeOn(id);
        return (
          <g key={id}>
            <path
              ref={(el) => onEdge(id, el)}
              className={cn('edge', EDGES[id].loop && 'edge--loop', on ? 'is-on' : 'is-dim')}
              d={pathD(pts)}
            />
            <path className={cn('arrow', on ? 'is-on' : 'is-dim')} d="M0 0L-8 -3.5L-8 3.5Z" transform={arrowFor(pts)} />
          </g>
        );
      })}

      {L.labels.map((l) => {
        const w = tagWidth(l.text, 9.5, 0.08) - 2;
        const on = l.edges.some(edgeOn);
        return (
          <g key={l.text} className={cn('elabel', on ? 'is-on' : 'is-dim')} transform={`translate(${l.x} ${l.y})`}>
            <rect x={-w / 2} y={-7} width={w} height={14} />
            <text textAnchor="middle" x="0" y="3.3">
              {l.text}
            </text>
          </g>
        );
      })}

      {(Object.keys(NODES) as NodeId[]).map((id) => (
        <NodeView
          key={id}
          id={id}
          box={L.nodes[id]}
          narrow={narrow}
          on={st.nodes.includes(id)}
          dim={!st.nodes.includes(id)}
        />
      ))}

      <g className="packets" ref={packetsRef} />
    </svg>
  );
}

/**
 * Fig. 4 — a stepped walk through one render, from the Blade tag to a live
 * island and the round trip that keeps it in step.
 */
export function RenderFlow() {
  const stageRef = useRef<HTMLDivElement>(null);
  const wideRef = useRef<SVGSVGElement>(null);
  const narrowRef = useRef<SVGSVGElement>(null);
  const edgeRefs = useRef<Record<Mode, Partial<Record<EdgeId, SVGPathElement | null>>>>({ wide: {}, narrow: {} });
  const listRef = useRef<HTMLOListElement>(null);
  const genRef = useRef(0);
  const drawnRef = useRef(false);

  const [mode, setMode] = useState<Mode>('wide');
  const modeRef = useRef<Mode>('wide');
  const [step, setStep] = useState(0);
  const widePackets = useRef<SVGGElement>(null);
  const narrowPackets = useRef<SVGGElement>(null);
  const [enter, setEnter] = useState(0);
  const st = STEPS[step];

  const registerEdge = useCallback((m: Mode, id: EdgeId, el: SVGPathElement | null) => {
    edgeRefs.current[m][id] = el;
  }, []);

  /* CSS (a container query) picks the layout; JS follows whichever is shown. */
  useEffect(() => {
    const stage = stageRef.current;
    const wide = wideRef.current;
    if (!stage || !wide) return;
    const pick = () => {
      const next: Mode = getComputedStyle(wide).display === 'none' ? 'narrow' : 'wide';
      modeRef.current = next;
      setMode(next);
    };
    pick();
    const ro = new ResizeObserver(pick);
    ro.observe(stage);
    return () => ro.disconnect();
  }, []);

  const sendPacket = useCallback((e: EdgeId, kind: PacketKind, rev: boolean, done: () => void) => {
    const path = edgeRefs.current[modeRef.current][e];
    const layer = modeRef.current === 'wide' ? widePackets.current : narrowPackets.current;
    const gen = genRef.current;
    if (!path || !layer) {
      done();
      return;
    }
    const len = path.getTotalLength();
    const dur = Math.max(460, Math.min(1100, len * 2.2));
    const g = document.createElementNS(SVGNS, 'g');
    g.setAttribute('class', 'packet');
    g.innerHTML = PACKETS[kind];
    g.style.opacity = '0';
    layer.appendChild(g);
    let start: number | null = null;
    const frame = (now: number) => {
      if (gen !== genRef.current) {
        g.remove();
        return;
      }
      if (start === null) start = now;
      const t = Math.min(1, (now - start) / dur);
      const pt = path.getPointAtLength((rev ? 1 - easeInOutCubic(t) : easeInOutCubic(t)) * len);
      g.setAttribute('transform', `translate(${pt.x.toFixed(1)} ${pt.y.toFixed(1)})`);
      g.style.opacity = String(Math.min(1, t / 0.08, (1 - t) / 0.08));
      if (t < 1) requestAnimationFrame(frame);
      else {
        g.remove();
        done();
      }
    };
    requestAnimationFrame(frame);
  }, []);

  const runWaves = useCallback(
    (waves: Wave[]) => {
      const gen = genRef.current;
      let i = 0;
      const next = () => {
        if (gen !== genRef.current || i >= waves.length) return;
        const wave = waves[i++];
        let pending = wave.length;
        wave.forEach((p) => {
          window.setTimeout(() => {
            if (gen !== genRef.current) return;
            sendPacket(p.e, p.kind ?? 'dot', !!p.rev, () => {
              pending -= 1;
              if (pending === 0) window.setTimeout(next, 90);
            });
          }, p.delay ?? 0);
        });
      };
      next();
    },
    [sendPacket],
  );

  const go = useCallback(
    (i: number, animatePanel = true) => {
      const target = Math.max(0, Math.min(STEPS.length - 1, i));
      genRef.current += 1;
      setStep(target);
      if (animatePanel && !prefersReducedMotion()) setEnter((k) => k + 1);
      if (drawnRef.current && !prefersReducedMotion()) {
        // Wait a frame so the new step's highlight paints before packets move.
        requestAnimationFrame(() => runWaves(STEPS[target].waves));
      }
    },
    [runWaves],
  );

  /* draw-in once in view, then play the first step */
  useEffect(() => {
    const svg = mode === 'wide' ? wideRef.current : narrowRef.current;
    if (!svg) return;
    if (prefersReducedMotion() || drawnRef.current) {
      // Already drawn once (e.g. the layout swapped on resize): show it settled.
      svg.classList.add('is-armed', 'is-drawn');
      drawnRef.current = true;
      return;
    }
    const lines = drawableLines(svg);
    armLines(svg, lines);
    svg.classList.add('is-armed');
    const timers: number[] = [];
    const stop = onceInView(svg, () => {
      svg.getBoundingClientRect();
      timers.push(...playLines(lines, { dur: 800, stagger: 16, cap: 420 }));
      svg.classList.add('is-drawn');
      timers.push(
        window.setTimeout(() => {
          drawnRef.current = true;
          go(0, false);
        }, 700),
      );
    });
    return () => {
      stop();
      timers.forEach((t) => clearTimeout(t));
      settleLines(lines);
      genRef.current += 1;
    };
  }, [mode, go]);

  function onKey(e: KeyboardEvent<HTMLDivElement>) {
    let target: number | null = null;
    if (e.key === 'ArrowRight') target = step + 1;
    else if (e.key === 'ArrowLeft') target = step - 1;
    else if (e.key === 'Home') target = 0;
    else if (e.key === 'End') target = STEPS.length - 1;
    if (target === null) return;
    e.preventDefault();
    target = Math.max(0, Math.min(STEPS.length - 1, target));
    if (target !== step) go(target);
    listRef.current?.querySelectorAll<HTMLButtonElement>('button')[target]?.focus();
  }

  return (
    <figure className="dg" aria-labelledby="fig-render-cap">
      <div className="dg__stage" ref={stageRef}>
        <DiagramSvg
          layout={WIDE}
          narrow={false}
          step={st}
          packetsRef={widePackets}
          svgRef={wideRef}
          onEdge={(id, el) => registerEdge('wide', id, el)}
        />
        <DiagramSvg
          layout={NARROW}
          narrow
          step={st}
          packetsRef={narrowPackets}
          svgRef={narrowRef}
          onEdge={(id, el) => registerEdge('narrow', id, el)}
        />
      </div>

      <div className="dg__side">
        <div className="dg__panel" aria-live="polite">
          <div key={enter} className={enter ? 'dg__panel-in is-enter' : 'dg__panel-in'}>
            <p className="dg__panel-k">
              Step {pad2(step + 1)} / {pad2(STEPS.length)}
            </p>
            <p className="dg__panel-title">{st.title}</p>
            <p className="dg__panel-body">{st.body}</p>
          </div>
        </div>
        <div className="stepper" role="group" aria-label="Walk through one render" onKeyDown={onKey}>
          <button
            className="icon-btn"
            type="button"
            aria-label="Previous step"
            aria-disabled={step === 0}
            onClick={() => step > 0 && go(step - 1)}
          >
            <ChevronLeftIcon />
          </button>
          <ol className="stepper__list" ref={listRef}>
            {STEPS.map((s, i) => (
              <li key={s.title}>
                <button
                  className={cn('stepper__step', i < step && 'is-done')}
                  type="button"
                  aria-current={i === step ? 'step' : undefined}
                  aria-label={`Step ${i + 1}: ${s.title}`}
                  onClick={() => go(i)}
                >
                  {pad2(i + 1)}
                </button>
              </li>
            ))}
          </ol>
          <button
            className="icon-btn"
            type="button"
            aria-label="Next step"
            aria-disabled={step === STEPS.length - 1}
            onClick={() => step < STEPS.length - 1 && go(step + 1)}
          >
            <ChevronRightIcon />
          </button>
          <button className="icon-btn icon-btn--replay" type="button" aria-label="Replay this step" onClick={() => go(step, false)}>
            <ReplayIcon />
          </button>
        </div>
      </div>

      <figcaption className="fig-cap k" id="fig-render-cap">
        <span className="fig-cap__n">Fig. 4 ·</span> One render, from tag to island. Use the steps, or the arrow keys
        once a step is focused.
        <span className="vh">
          Diagram description: on the server, a Blade view contains the mesh counter tag, which compiles to the
          Livewire component App\Mesh\Counter. The component renders a wrapper div carrying the component id, its
          props as JSON and an empty mesh root; the wrapper crosses to the browser. There, Livewire&rsquo;s init hook
          hands the element to the Mesh runtime, which looks the id up in its registry and imports the
          component&rsquo;s lazy chunk. The renderer chosen by the file extension mounts the component into the mesh
          root as an island. Afterwards, requests from the island (entangled state and $call) travel to the
          Livewire component, and responses morph the wrapper so Mesh updates the island&rsquo;s props in place.
        </span>
      </figcaption>
    </figure>
  );
}
