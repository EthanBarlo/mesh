'use client';

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactNode,
} from 'react';
import { cn } from '@/lib/cn';
import s from './figures.module.css';
import {
  Arrow,
  BorderLabel,
  LineLabel,
  endAngle,
  pathD,
  type Point,
} from './primitives';

/* --------------------------------------------------------------------------
   Diagram data. Coordinates are viewBox units; every edge is an orthogonal
   polyline routed by hand for each layout.
   -------------------------------------------------------------------------- */

type NodeId =
  | 'blade'
  | 'compile'
  | 'livewire'
  | 'init'
  | 'registry'
  | 'chunk'
  | 'renderer';
type EdgeId =
  | 'compile'
  | 'resolve'
  | 'render'
  | 'init'
  | 'lookup'
  | 'load'
  | 'module'
  | 'mount'
  | 'morph';
type RowId = 'id' | 'props' | 'contents';
type PartId = 'slots' | 'root';
type Box = readonly [x: number, y: number, w: number, h: number];

const NODES: Record<
  NodeId,
  { tag: string; title: string; mono?: boolean; sub: string }
> = {
  blade: {
    tag: 'BLADE VIEW',
    title: '<mesh:counter />',
    mono: true,
    sub: 'in any Blade view',
  },
  compile: {
    tag: 'PRECOMPILER',
    title: 'MeshTagPrecompiler',
    sub: 'livewire:mesh::counter',
  },
  livewire: {
    tag: 'LIVEWIRE',
    title: 'App\\Mesh\\Counter',
    sub: 'mount() · props()',
  },
  init: {
    tag: 'LIVEWIRE JS',
    title: 'component.init',
    mono: true,
    sub: 'hook, per component',
  },
  registry: {
    tag: 'REGISTRY',
    title: "registry['Counter']",
    mono: true,
    sub: '{ renderer, load }',
  },
  chunk: {
    tag: 'LAZY CHUNK',
    title: 'Counter/index.tsx',
    mono: true,
    sub: 'import(), then cached',
  },
  renderer: {
    tag: 'RENDERER',
    title: '@mesh/react',
    mono: true,
    sub: 'mount, update, cleanup',
  },
};

const ROWS: Record<RowId, string> = {
  id: 'data-mesh-component="Counter"',
  props: 'data-mesh-props="{…}"',
  contents: 'style="display: contents"',
};

const EDGE_LABELS: Partial<Record<EdgeId, string>> = {
  compile: 'COMPILE',
  resolve: 'RESOLVE',
  render: 'RENDER',
  init: 'INIT',
  mount: 'MOUNT',
  morph: 'morph.updated',
};

type Layout = {
  w: number;
  h: number;
  nodes: Record<NodeId, Box>;
  edges: Record<EdgeId, readonly Point[]>;
  labels: Partial<Record<EdgeId, { x: number; y: number; v?: boolean }>>;
  lanes: { text: string; x: number; y: number }[];
  dividers: string;
  wrapper: {
    box: Box;
    rows: readonly [number, number, number];
    rowH: number;
    slots: Box;
    root: Box;
  };
};

const WIDE: Layout = {
  w: 712,
  h: 356,
  nodes: {
    blade: [12, 34, 168, 56],
    compile: [12, 130, 168, 56],
    livewire: [12, 226, 168, 56],
    init: [524, 34, 168, 56],
    registry: [524, 114, 168, 56],
    chunk: [524, 194, 168, 56],
    renderer: [524, 274, 168, 56],
  },
  edges: {
    compile: [
      [96, 90],
      [96, 130],
    ],
    resolve: [
      [96, 186],
      [96, 226],
    ],
    render: [
      [180, 254],
      [244, 254],
    ],
    init: [
      [460, 60],
      [524, 60],
    ],
    lookup: [
      [608, 90],
      [608, 114],
    ],
    load: [
      [608, 170],
      [608, 194],
    ],
    module: [
      [608, 250],
      [608, 274],
    ],
    mount: [
      [524, 302],
      [446, 302],
    ],
    morph: [
      [692, 62],
      [704, 62],
      [704, 302],
      [692, 302],
    ],
  },
  labels: {
    compile: { x: 96, y: 110 },
    resolve: { x: 96, y: 206 },
    render: { x: 208, y: 254 },
    init: { x: 492, y: 60 },
    mount: { x: 492, y: 302 },
    morph: { x: 704, y: 182, v: true },
  },
  lanes: [
    { text: 'SERVER · PHP', x: 12, y: 16 },
    { text: 'DOM · HTML', x: 244, y: 16 },
    { text: 'BROWSER · JS', x: 524, y: 16 },
  ],
  dividers: 'M212 6V352M492 6V352',
  wrapper: {
    box: [244, 34, 216, 314],
    rows: [64, 84, 104],
    rowH: 18,
    slots: [258, 118, 188, 54],
    root: [258, 186, 188, 148],
  },
};

const NARROW: Layout = {
  w: 340,
  h: 884,
  nodes: {
    blade: [24, 28, 292, 52],
    compile: [24, 104, 292, 52],
    livewire: [24, 180, 292, 52],
    init: [24, 588, 292, 52],
    registry: [24, 664, 292, 52],
    chunk: [24, 740, 292, 52],
    renderer: [24, 816, 292, 52],
  },
  edges: {
    compile: [
      [170, 80],
      [170, 104],
    ],
    resolve: [
      [170, 156],
      [170, 180],
    ],
    render: [
      [250, 232],
      [250, 278],
    ],
    init: [
      [170, 536],
      [170, 588],
    ],
    lookup: [
      [170, 640],
      [170, 664],
    ],
    load: [
      [170, 716],
      [170, 740],
    ],
    module: [
      [170, 792],
      [170, 816],
    ],
    mount: [
      [24, 842],
      [12, 842],
      [12, 467],
      [38, 467],
    ],
    morph: [
      [316, 614],
      [328, 614],
      [328, 842],
      [316, 842],
    ],
  },
  labels: {
    render: { x: 250, y: 258 },
    init: { x: 170, y: 562 },
    mount: { x: 12, y: 660, v: true },
    morph: { x: 328, y: 728, v: true },
  },
  lanes: [
    { text: 'SERVER · PHP', x: 24, y: 16 },
    { text: 'DOM · HTML', x: 24, y: 262 },
    { text: 'BROWSER · JS', x: 24, y: 574 },
  ],
  dividers: 'M8 246H332M8 556H332',
  wrapper: {
    box: [24, 278, 292, 258],
    rows: [304, 322, 340],
    rowH: 16,
    slots: [38, 354, 264, 46],
    root: [38, 412, 264, 110],
  },
};

/* --------------------------------------------------------------------------
   Steps
   -------------------------------------------------------------------------- */

type Packet = { e: EdgeId; kind?: 'dot' | 'doc' | 'deny' };

type Step = {
  short: string;
  title: string;
  body: ReactNode;
  nodes: NodeId[];
  edges: EdgeId[];
  wrapper: 'on' | 'dim' | 'removed';
  rows?: RowId[];
  parts?: PartId[];
  island?: { value: string; updated?: boolean };
  deny?: NodeId[];
  subs?: Partial<Record<NodeId, string>>;
  labels?: Partial<Record<EdgeId, string>>;
  waves: Packet[][];
};

function C({ children }: { children: ReactNode }) {
  return <code>{children}</code>;
}

const STEPS: Step[] = [
  {
    short: 'Compile',
    title: 'Compile the tag',
    body: (
      <>
        Blade compiles the view once and caches it.{' '}
        <C>MeshTagPrecompiler</C> rewrites <C>{'<mesh:counter />'}</C> to{' '}
        <C>{'<livewire:mesh::counter />'}</C> and hands it to Livewire&apos;s
        own tag compiler, so attributes, <C>wire:model</C> and{' '}
        <C>wire:key</C> work as they do on any Livewire tag.
      </>
    ),
    nodes: ['blade', 'compile'],
    edges: ['compile'],
    wrapper: 'dim',
    waves: [[{ e: 'compile' }]],
  },
  {
    short: 'Resolve',
    title: 'Resolve the class',
    body: (
      <>
        On each request Livewire resolves <C>mesh::counter</C> through the{' '}
        <C>mesh</C> namespace Mesh registers for <C>App\Mesh</C>, fills
        public properties from the tag&apos;s attributes and runs{' '}
        <C>mount()</C>. From here on it is an ordinary Livewire component.
      </>
    ),
    nodes: ['compile', 'livewire'],
    edges: ['resolve'],
    wrapper: 'dim',
    waves: [[{ e: 'resolve' }]],
  },
  {
    short: 'Render',
    title: 'Render the wrapper',
    body: (
      <>
        <C>render()</C> always returns the <C>mesh::component</C> view. It
        writes the id from <C>component()</C> and the JSON from{' '}
        <C>props()</C> onto one element, puts slot content in hidden holders
        and leaves an empty <C>.mesh-root</C> marked <C>wire:ignore</C>. Both
        use <C>display: contents</C>, so your layout never sees them.
      </>
    ),
    nodes: ['livewire'],
    edges: ['render'],
    wrapper: 'on',
    rows: ['id', 'props'],
    parts: ['root'],
    waves: [[{ e: 'render', kind: 'doc' }]],
  },
  {
    short: 'Init',
    title: 'Initialize in the browser',
    body: (
      <>
        Livewire boots the component and fires its <C>component.init</C>{' '}
        hook. Mesh reads <C>data-mesh-component</C> and ignores elements
        without it. It registers its cleanup straight away, before any async
        work, so a component removed mid-load is still handled.
      </>
    ),
    nodes: ['init'],
    edges: ['init'],
    wrapper: 'on',
    rows: ['id'],
    waves: [[{ e: 'init' }]],
  },
  {
    short: 'Load',
    title: 'Look up and load the chunk',
    body: (
      <>
        The id is a key into the registry <C>initMesh()</C> built from{' '}
        <C>import.meta.glob</C>: <C>{"{ renderer: 'react', load }"}</C>.{' '}
        <C>load()</C> imports the component&apos;s own chunk the first time a{' '}
        <C>Counter</C> renders; later instances reuse the cached promise. An
        unknown id logs an error listing every registered id.
      </>
    ),
    nodes: ['init', 'registry', 'chunk'],
    edges: ['lookup', 'load'],
    wrapper: 'dim',
    subs: { registry: "'Counter' → react" },
    waves: [[{ e: 'lookup' }], [{ e: 'load' }]],
  },
  {
    short: 'Mount',
    title: 'Mount into .mesh-root',
    body: (
      <>
        The renderer chosen by the file extension mounts the default export
        into <C>.mesh-root</C> with the parsed props and slots: a React root,
        a Vue app or a Svelte <C>mount()</C>. It also provides the Livewire
        component to the tree, which is how <C>useWire</C> and{' '}
        <C>useEntangle</C> reach <C>$wire</C>.
      </>
    ),
    nodes: ['chunk', 'renderer'],
    edges: ['module', 'mount'],
    wrapper: 'on',
    parts: ['root'],
    island: { value: '0' },
    subs: { renderer: 'mount()' },
    waves: [[{ e: 'module' }], [{ e: 'mount' }]],
  },
  {
    short: 'Update',
    title: 'Update in place',
    body: (
      <>
        After a Livewire request the server re-renders and Livewire morphs
        the wrapper, but never the inside of <C>.mesh-root</C>. On{' '}
        <C>morph.updated</C> Mesh re-reads <C>data-mesh-props</C> and compares
        it with the props it last rendered; only a real change calls the
        renderer&apos;s <C>update()</C>. Nothing remounts, so local state
        survives. A MutationObserver does the same for slot content.
      </>
    ),
    nodes: ['livewire', 'init', 'renderer'],
    edges: ['render', 'init', 'morph', 'mount'],
    wrapper: 'on',
    rows: ['props'],
    parts: ['slots', 'root'],
    island: { value: '1', updated: true },
    subs: {
      livewire: 're-render · props()',
      init: 'morph.updated',
      renderer: 'update()',
    },
    labels: { init: 'MORPH', mount: 'UPDATE' },
    waves: [
      [{ e: 'render', kind: 'doc' }],
      [{ e: 'init' }],
      [{ e: 'morph' }],
      [{ e: 'mount' }],
    ],
  },
  {
    short: 'Teardown',
    title: 'Tear down',
    body: (
      <>
        When Livewire removes the component, the cleanup Mesh registered at
        init unmounts the island and disconnects the slot observer. If that
        happens while the chunk is still loading, a <C>disposed</C> flag
        means the island is never mounted at all.
      </>
    ),
    nodes: ['init', 'renderer'],
    edges: ['morph', 'mount'],
    wrapper: 'removed',
    deny: ['renderer'],
    subs: { init: 'cleanup callback', renderer: 'cleanup() · unmount' },
    labels: { morph: 'cleanup', mount: 'UNMOUNT' },
    waves: [[{ e: 'morph' }], [{ e: 'mount', kind: 'deny' }]],
  },
];

const DESCRIPTION =
  'Diagram description: three lanes, server, DOM and browser. On the ' +
  'server, a Blade view containing <mesh:counter /> is compiled by ' +
  'MeshTagPrecompiler and resolved by Livewire to App\\Mesh\\Counter. The ' +
  'component renders a wrapper element in the DOM carrying ' +
  'data-mesh-component, data-mesh-props, hidden slot holders and an empty ' +
  '.mesh-root marked wire:ignore. In the browser, Livewire’s ' +
  'component.init hook lets Mesh look the id up in its registry, load the ' +
  'component’s lazy chunk, and have the renderer mount it into ' +
  '.mesh-root. On morph.updated the renderer updates in place; on ' +
  'cleanup it unmounts. Steps: ' +
  STEPS.map((step, i) => `${i + 1}, ${step.title}.`).join(' ');

/* --------------------------------------------------------------------------
   Drawing
   -------------------------------------------------------------------------- */

function NodeShape({
  id,
  box,
  on,
  deny,
  sub,
}: {
  id: NodeId;
  box: Box;
  on: boolean;
  deny: boolean;
  sub: string;
}) {
  const [x, y, w, h] = box;
  const node = NODES[id];
  const cy = h / 2;
  const grips: Point[] = [
    [-4, -4],
    [w + 4, -4],
    [-4, h + 4],
    [w + 4, h + 4],
  ];

  return (
    <g
      className={cn(s.node, on ? s.on : s.dim, deny && s.deny)}
      transform={`translate(${x} ${y})`}
    >
      <rect className={s.halo} x={-4} y={-4} width={w + 8} height={h + 8} />
      {grips.map(([gx, gy]) => (
        <rect
          key={`${gx}-${gy}`}
          className={s.grip}
          x={gx - 2.5}
          y={gy - 2.5}
          width={5}
          height={5}
        />
      ))}
      <rect className={s.nodeBox} width={w} height={h} />
      <text className={s.k} x={12} y={cy - 12}>
        {node.tag}
      </text>
      <text className={node.mono ? s.titleMono : s.title} x={12} y={cy + 4}>
        {node.title}
      </text>
      <text className={s.sub} x={12} y={cy + 18}>
        {sub}
      </text>
      <path className={s.denyMark} d={`M${w - 20} 8l9 9m0 -9l-9 9`} />
    </g>
  );
}

function Wrapper({
  layout,
  step,
  replay,
}: {
  layout: Layout;
  step: Step;
  replay: number;
}) {
  const { box, rows, rowH, slots, root } = layout.wrapper;
  const [x, y, w, h] = box;
  const rowIds = Object.keys(ROWS) as RowId[];
  const partOn = (id: PartId) => step.parts?.includes(id) ?? false;

  const cx = root[0] + root[2] / 2;
  const iy = root[1] + (root[3] - 30) / 2 + 8;

  return (
    <g
      className={cn(
        s.wrapper,
        step.wrapper === 'on' && s.on,
        step.wrapper === 'dim' && s.dim,
        step.wrapper === 'removed' && s.removed,
      )}
    >
      <rect className={s.wrapperBox} x={x} y={y} width={w} height={h} />
      <BorderLabel
        x={x + 8}
        y={y}
        text="WRAPPER · mesh::component"
        className={s.wrapperLabel}
      />

      {rowIds.map((id, i) => (
        <g
          key={id}
          className={cn(s.row, step.rows?.includes(id) && s.on)}
        >
          <rect
            x={x + 6}
            y={rows[i] - rowH + 4}
            width={w - 12}
            height={rowH}
          />
          <text x={x + 14} y={rows[i]}>
            {ROWS[id]}
          </text>
        </g>
      ))}

      <g className={cn(s.part, partOn('slots') && s.on)}>
        <rect
          className={cn(s.partBox, s.partDashed)}
          x={slots[0]}
          y={slots[1]}
          width={slots[2]}
          height={slots[3]}
        />
        <text className={s.partLabel} x={slots[0] + 10} y={slots[1] + 19}>
          [data-mesh-slots] hidden
        </text>
        <text className={s.k} x={slots[0] + 10} y={slots[1] + 34}>
          slot holders · if any
        </text>
      </g>

      <g className={cn(s.part, partOn('root') && s.on)}>
        <rect
          className={s.partBox}
          x={root[0]}
          y={root[1]}
          width={root[2]}
          height={root[3]}
        />
        <text className={s.partLabel} x={root[0] + 10} y={root[1] + 19}>
          .mesh-root wire:ignore
        </text>
        <text className={s.k} x={root[0] + 10} y={root[1] + 34}>
          owned by the renderer
        </text>

        <g
          key={`island-${replay}`}
          className={cn(
            s.island,
            step.island && s.shown,
            step.island?.updated && s.updated,
          )}
        >
          <rect
            className={s.islandBox}
            x={cx - 64}
            y={iy}
            width={32}
            height={30}
          />
          <rect
            className={s.islandValue}
            x={cx - 26}
            y={iy}
            width={52}
            height={30}
          />
          <rect
            className={s.islandBox}
            x={cx + 32}
            y={iy}
            width={32}
            height={30}
          />
          <text
            className={s.islandText}
            x={cx - 48}
            y={iy + 20}
            textAnchor="middle"
          >
            −
          </text>
          <text
            className={s.islandText}
            x={cx}
            y={iy + 20}
            textAnchor="middle"
          >
            {step.island?.value ?? '0'}
          </text>
          <text
            className={s.islandText}
            x={cx + 48}
            y={iy + 20}
            textAnchor="middle"
          >
            +
          </text>
          <text
            className={s.k}
            x={cx}
            y={root[1] + root[3] - 14}
            textAnchor="middle"
          >
            REACT ROOT
          </text>
        </g>
      </g>
    </g>
  );
}

function Drawing({
  layout,
  step,
  replay,
  mode,
}: {
  layout: Layout;
  step: Step;
  replay: number;
  mode: 'wide' | 'narrow';
}) {
  const edgeIds = Object.keys(layout.edges) as EdgeId[];
  const nodeIds = Object.keys(layout.nodes) as NodeId[];

  return (
    <svg
      className={cn(s.svg, mode === 'wide' ? s.svgWide : s.svgNarrow)}
      style={mode === 'wide' ? { maxWidth: 760 } : undefined}
      viewBox={`0 0 ${layout.w} ${layout.h}`}
      aria-hidden="true"
      focusable="false"
      data-draw=""
      data-lifecycle=""
    >
      {layout.lanes.map((lane) => (
        <text key={lane.text} className={s.laneK} x={lane.x} y={lane.y}>
          {lane.text}
        </text>
      ))}
      <path className="ln ln--fine ln--center" d={layout.dividers} />

      {edgeIds.map((id) => {
        const points = layout.edges[id];
        const on = step.edges.includes(id);
        const [tx, ty] = points[points.length - 1];
        return (
          <g key={id}>
            <path
              className={cn(s.edge, on ? s.on : s.dim)}
              d={pathD(points)}
              data-edge={id}
            />
            <Arrow
              x={tx}
              y={ty}
              angle={endAngle(points)}
              className={cn(s.arrowhead, on ? s.on : s.dim)}
            />
          </g>
        );
      })}

      <Wrapper layout={layout} step={step} replay={replay} />

      {nodeIds.map((id) => (
        <NodeShape
          key={id}
          id={id}
          box={layout.nodes[id]}
          on={step.nodes.includes(id)}
          deny={step.deny?.includes(id) ?? false}
          sub={step.subs?.[id] ?? NODES[id].sub}
        />
      ))}

      {edgeIds.map((id) => {
        const at = layout.labels[id];
        const text = step.labels?.[id] ?? EDGE_LABELS[id];
        if (!at || !text) return null;
        const on = step.edges.includes(id);
        return (
          <LineLabel
            key={id}
            x={at.x}
            y={at.y}
            vertical={at.v}
            text={text}
            className={cn(s.elabel, on ? s.on : s.dim)}
          />
        );
      })}

      <g data-packets="" />
    </svg>
  );
}

/* --------------------------------------------------------------------------
   Packets: small marks that travel the active edges. Imperative on purpose:
   they are decoration on top of the state the diagram already shows.
   -------------------------------------------------------------------------- */

const SVGNS = 'http://www.w3.org/2000/svg';

function packetShape(kind: Packet['kind']): SVGElement {
  if (kind === 'doc') {
    const el = document.createElementNS(SVGNS, 'rect');
    el.setAttribute('class', s.packetDoc);
    el.setAttribute('x', '-4');
    el.setAttribute('y', '-5');
    el.setAttribute('width', '8');
    el.setAttribute('height', '10');
    return el;
  }
  if (kind === 'deny') {
    const el = document.createElementNS(SVGNS, 'path');
    el.setAttribute('class', s.packetDeny);
    el.setAttribute('d', 'M-4 -4L4 4M4 -4L-4 4');
    return el;
  }
  const el = document.createElementNS(SVGNS, 'circle');
  el.setAttribute('class', s.packetDot);
  el.setAttribute('r', '4.5');
  return el;
}

function easeInOutCubic(t: number) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

function sendPacket(
  svg: SVGSVGElement,
  packet: Packet,
  alive: () => boolean,
  done: () => void,
) {
  const path = svg.querySelector<SVGPathElement>(
    `[data-edge="${packet.e}"]`,
  );
  const layer = svg.querySelector('[data-packets]');
  if (!path || !layer) {
    done();
    return;
  }

  const len = path.getTotalLength();
  const g = document.createElementNS(SVGNS, 'g');
  g.setAttribute('class', s.packet);
  g.appendChild(packetShape(packet.kind));
  g.style.opacity = '0';
  layer.appendChild(g);

  const duration = Math.max(420, Math.min(1000, len * 3));
  let start: number | null = null;

  const frame = (now: number) => {
    if (!alive()) {
      g.remove();
      return;
    }
    if (start === null) start = now;
    const t = Math.min(1, (now - start) / duration);
    const pt = path.getPointAtLength(easeInOutCubic(t) * len);
    g.setAttribute(
      'transform',
      `translate(${pt.x.toFixed(1)} ${pt.y.toFixed(1)})`,
    );
    g.style.opacity = String(Math.min(1, t / 0.08, (1 - t) / 0.08));
    if (t < 1) {
      requestAnimationFrame(frame);
    } else {
      g.remove();
      done();
    }
  };
  requestAnimationFrame(frame);
}

function runWaves(svg: SVGSVGElement, waves: Packet[][], alive: () => boolean) {
  let i = 0;
  const next = () => {
    if (!alive() || i >= waves.length) return;
    const wave = waves[i++];
    let pending = wave.length;
    for (const packet of wave) {
      sendPacket(svg, packet, alive, () => {
        pending -= 1;
        if (pending === 0) window.setTimeout(next, 90);
      });
    }
  };
  next();
}

function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/* --------------------------------------------------------------------------
   Figure
   -------------------------------------------------------------------------- */

function Chevron({ dir }: { dir: 'left' | 'right' }) {
  return (
    <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true">
      <path
        d={dir === 'left' ? 'M10 3.5 5.5 8l4.5 4.5' : 'M6 3.5 10.5 8 6 12.5'}
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
      />
    </svg>
  );
}

/**
 * Fig · The render lifecycle, from a Blade tag to a mounted island and back
 * out again. Step through with the buttons or the arrow keys.
 */
export function RenderLifecycle() {
  const [step, setStep] = useState(0);
  const [replay, setReplay] = useState(0);
  const [touched, setTouched] = useState(false);

  const rootRef = useRef<HTMLDivElement>(null);
  const stepRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const genRef = useRef(0);
  const inViewRef = useRef(false);
  const stepRef = useRef(0);

  const play = useCallback((index: number) => {
    const root = rootRef.current;
    genRef.current += 1;
    const gen = genRef.current;
    if (!root) return;

    root.querySelectorAll('[data-packets] > *').forEach((n) => n.remove());
    if (!inViewRef.current || prefersReducedMotion()) return;

    const svg = Array.from(
      root.querySelectorAll<SVGSVGElement>('svg[data-lifecycle]'),
    ).find((el) => el.getBoundingClientRect().width > 0);
    if (!svg) return;

    runWaves(svg, STEPS[index].waves, () => gen === genRef.current);
  }, []);

  const go = useCallback(
    (index: number) => {
      const next = Math.max(0, Math.min(STEPS.length - 1, index));
      stepRef.current = next;
      setStep(next);
      setTouched(true);
      play(next);
    },
    [play],
  );

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    if (typeof IntersectionObserver === 'undefined') {
      inViewRef.current = true;
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        inViewRef.current = true;
        io.disconnect();
        play(stepRef.current);
      },
      { threshold: 0.35 },
    );
    io.observe(root);

    return () => {
      io.disconnect();
      genRef.current += 1;
    };
  }, [play]);

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    let target: number | null = null;
    if (event.key === 'ArrowRight') target = step + 1;
    else if (event.key === 'ArrowLeft') target = step - 1;
    else if (event.key === 'Home') target = 0;
    else if (event.key === 'End') target = STEPS.length - 1;
    if (target === null) return;

    event.preventDefault();
    target = Math.max(0, Math.min(STEPS.length - 1, target));
    if (target !== step) go(target);

    const onStepButton = stepRefs.current.includes(
      event.target as HTMLButtonElement,
    );
    if (onStepButton) stepRefs.current[target]?.focus();
  };

  const current = STEPS[step];
  const first = step === 0;
  const last = step === STEPS.length - 1;

  return (
    <div className={s.lifecycle} ref={rootRef}>
      <div className={s.stage}>
        <div className={s.wide}>
          <Drawing layout={WIDE} step={current} replay={replay} mode="wide" />
        </div>
        <div className={s.narrow}>
          <Drawing
            layout={NARROW}
            step={current}
            replay={replay}
            mode="narrow"
          />
        </div>
      </div>

      <p className="sr-only">{DESCRIPTION}</p>

      <div className={s.side}>
        <div aria-live="polite">
          <div
            key={`${step}-${replay}`}
            className={touched ? s.enter : undefined}
          >
            <p className={s.panelK}>
              Step {String(step + 1).padStart(2, '0')} /{' '}
              {String(STEPS.length).padStart(2, '0')}
            </p>
            <p className={s.panelTitle}>{current.title}</p>
            <p className={s.panelBody}>{current.body}</p>
          </div>
        </div>

        <div
          className={s.stepper}
          role="group"
          aria-label="Walk through the render lifecycle"
          onKeyDown={onKeyDown}
        >
          <button
            type="button"
            className={s.iconBtn}
            aria-label="Previous step"
            aria-disabled={first}
            onClick={() => {
              if (!first) go(step - 1);
            }}
          >
            <Chevron dir="left" />
          </button>
          <ol className={s.list}>
            {STEPS.map((item, i) => (
              <li key={item.short}>
                <button
                  ref={(el) => {
                    stepRefs.current[i] = el;
                  }}
                  type="button"
                  className={cn(s.step, i < step && s.done)}
                  aria-current={i === step ? 'step' : undefined}
                  aria-label={`Step ${i + 1}: ${item.title}`}
                  title={item.short}
                  onClick={() => go(i)}
                >
                  {String(i + 1).padStart(2, '0')}
                </button>
              </li>
            ))}
          </ol>
          <button
            type="button"
            className={s.iconBtn}
            aria-label="Next step"
            aria-disabled={last}
            onClick={() => {
              if (!last) go(step + 1);
            }}
          >
            <Chevron dir="right" />
          </button>
          <button
            type="button"
            className={cn(s.iconBtn, s.replay)}
            aria-label="Replay this step"
            onClick={() => {
              setReplay((n) => n + 1);
              play(step);
            }}
          >
            <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true">
              <path
                d="M3 8a5 5 0 1 0 1.6-3.7M3 2.5v2.8h2.8"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
