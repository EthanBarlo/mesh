'use client';

import { useId, useRef, useState, type KeyboardEvent } from 'react';
import { cn } from '@/lib/cn';
import s from './figures.module.css';
import { Arrowhead, LineLabel } from './primitives';

const LABEL =
  'The renderer contract. The Mesh core, the same for every framework, ' +
  'loads the component chunk, reads props and slot HTML from the page, ' +
  'splits slots into default and named, checks reserved prop names, ' +
  'dirty-checks props, watches the slot holders and listens for Livewire ' +
  'teardown. A renderer declares its type, which the core matches to the ' +
  'entry file extension, and optionally nativeSlots, which turns off the ' +
  'reserved-prop check. It implements renderSlot, which turns one slot ' +
  'of HTML into a framework node; mount, called once; update, called when ' +
  'props or slots change; and cleanup, called when the component is ' +
  'removed.';

type CoreId = 'load' | 'read' | 'prepare' | 'guard' | 'props' | 'slots' | 'end';
type RendererId =
  | 'type'
  | 'native'
  | 'renderSlot'
  | 'mount'
  | 'update'
  | 'cleanup';
type WireId = 'pick' | 'perSlot' | 'mount' | 'props' | 'slots' | 'end';
type PhaseId = 'mount' | 'props' | 'slots' | 'teardown';

type Node<T> = {
  id: T;
  main: string;
  sub: string;
  y: number;
  /** A property of the renderer object rather than a function. */
  prop?: boolean;
};

const CORE: Node<CoreId>[] = [
  {
    id: 'load',
    main: 'loadComponent(id)',
    sub: 'import the lazy chunk · default export',
    y: 52,
  },
  {
    id: 'read',
    main: 'getProps() · getSlots()',
    sub: 'data-mesh-props · [data-mesh-slots]',
    y: 98,
  },
  {
    id: 'prepare',
    main: 'prepareSlots(slots, renderSlot)',
    sub: 'default → children · the rest → named',
    y: 144,
  },
  {
    id: 'guard',
    main: 'assertNoReservedProps()',
    sub: 'children · slots, unless nativeSlots',
    y: 190,
  },
  {
    id: 'props',
    main: 'updateProps(props)',
    sub: 'after each morph · JSON dirty-check',
    y: 236,
  },
  {
    id: 'slots',
    main: 'updateSlots(slots)',
    sub: 'MutationObserver on slot holders',
    y: 282,
  },
  {
    id: 'end',
    main: 'Livewire cleanup',
    sub: 'component removed, even mid-load',
    y: 328,
  },
];

const RENDERER: Node<RendererId>[] = [
  {
    id: 'type',
    main: "type: 'react' | 'vue' | 'svelte'",
    sub: 'matched to the entry file extension',
    y: 52,
    prop: true,
  },
  {
    id: 'native',
    main: 'nativeSlots?: boolean',
    sub: 'true → skip the reserved-prop check',
    y: 98,
    prop: true,
  },
  {
    id: 'renderSlot',
    main: 'renderSlot(html, name)',
    sub: 'pure · once per slot → TNode',
    y: 144,
  },
  {
    id: 'mount',
    main: 'mount({ el, Component, ctx })',
    sub: 'once · returns update + cleanup',
    y: 190,
  },
  {
    id: 'update',
    main: 'update(ctx)',
    sub: 'new props and slots · no remount',
    y: 259,
  },
  {
    id: 'cleanup',
    main: 'cleanup()',
    sub: 'unmount the root or app',
    y: 328,
  },
];

const CORE_X = 0;
const CORE_W = 300;
const R_X = 436;
const R_W = 244;
const NODE_H = 34;
const CONTRACT_X = 396;
const VIEW_W = R_X + R_W;
const VIEW_H = 384;

type Wire = {
  id: WireId;
  d: string;
  tip: [number, number];
  angle?: number;
  label: string;
};

const mid = (y: number) => y + NODE_H / 2;

const WIRES: Wire[] = [
  {
    id: 'pick',
    d: `M${R_X} ${mid(52)}H${CORE_W}`,
    tip: [CORE_W, mid(52)],
    angle: 180,
    label: 'by type',
  },
  {
    id: 'perSlot',
    d: `M${CORE_W} ${mid(144)}H${R_X}`,
    tip: [R_X, mid(144)],
    label: 'per slot',
  },
  {
    id: 'mount',
    d: `M${CORE_W} ${mid(190)}H${R_X}`,
    tip: [R_X, mid(190)],
    label: 'once',
  },
  {
    id: 'props',
    d: `M${CORE_W} ${mid(236)}H374V${mid(259) - 8}H${R_X}`,
    tip: [R_X, mid(259) - 8],
    label: 'props',
  },
  {
    id: 'slots',
    d: `M${CORE_W} ${mid(282)}H374V${mid(259) + 8}H${R_X}`,
    tip: [R_X, mid(259) + 8],
    label: 'slots',
  },
  {
    id: 'end',
    d: `M${CORE_W} ${mid(328)}H${R_X}`,
    tip: [R_X, mid(328)],
    label: 'teardown',
  },
];

const WIRE_LABEL_Y: Record<WireId, number> = {
  pick: mid(52),
  perSlot: mid(144),
  mount: mid(190),
  props: mid(236),
  slots: mid(282),
  end: mid(328),
};

type Phase = {
  id: PhaseId;
  name: string;
  core: CoreId[];
  renderer: RendererId[];
  wires: WireId[];
  body: string;
};

const PHASES: Phase[] = [
  {
    id: 'mount',
    name: 'Mount',
    core: ['load', 'read', 'prepare', 'guard'],
    renderer: ['type', 'native', 'renderSlot', 'mount'],
    wires: ['pick', 'perSlot', 'mount'],
    body:
      'Livewire initialises the component. The core loads its lazy chunk, ' +
      'picks the renderer whose type matches the file extension, reads ' +
      'the props and slot HTML from the wrapper, renders each slot ' +
      'through renderSlot, checks reserved prop names, then calls mount() ' +
      'once with the .mesh-root element.',
  },
  {
    id: 'props',
    name: 'Props',
    core: ['props', 'guard'],
    renderer: ['native', 'update'],
    wires: ['props'],
    body:
      'After a Livewire morph the core re-reads data-mesh-props. Unchanged ' +
      'JSON is a no-op. Otherwise it runs the reserved-prop check and calls ' +
      'update() with the new props and the slot nodes it already had, so ' +
      'unchanged slots keep their identity.',
  },
  {
    id: 'slots',
    name: 'Slots',
    core: ['slots', 'prepare', 'guard'],
    renderer: ['native', 'renderSlot', 'update'],
    wires: ['perSlot', 'slots'],
    body:
      'When the server sends new slot HTML, a MutationObserver on the hidden ' +
      'slot holders fires. The core renders every slot again through ' +
      'renderSlot, runs the check, and calls update() with the current props.',
  },
  {
    id: 'teardown',
    name: 'Teardown',
    core: ['end'],
    renderer: ['cleanup'],
    wires: ['end'],
    body:
      'When Livewire removes the component, the core calls cleanup(). If ' +
      'that happens while the chunk is still loading, mount() is never ' +
      'called at all.',
  },
];

const OVERVIEW =
  'The core owns everything that is the same for every framework. A ' +
  'renderer declares a type, supplies renderSlot and mount, and mount ' +
  'returns update and cleanup. Pick a phase to see which parts take part.';

function state(active: boolean | null) {
  if (active === null) return null;
  return active ? s.on : s.off;
}

function NodeBox<T extends string>({
  node,
  x,
  w,
  active,
  renderer = false,
}: {
  node: Node<T>;
  x: number;
  w: number;
  active: boolean | null;
  renderer?: boolean;
}) {
  return (
    <g
      className={cn(
        s.part,
        renderer && !node.prop && s.renderer,
        state(active),
      )}
    >
      <rect
        className={s.nodeBox}
        x={x}
        y={node.y}
        width={w}
        height={NODE_H}
      />
      <text className={s.nodeMain} x={x + 12} y={node.y + 15}>
        {node.main}
      </text>
      <text className={s.nodeSub} x={x + 12} y={node.y + 27.5}>
        {node.sub}
      </text>
    </g>
  );
}

function Drawing({ phase }: { phase: Phase | null }) {
  const has = <T extends string>(list: T[] | undefined, id: T) =>
    phase ? (list ?? []).includes(id) : null;

  return (
    <svg
      className={cn(s.svg, s.contractSvg)}
      viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
      data-draw
      aria-hidden="true"
      focusable="false"
    >
      {/* Lane headers */}
      <text className={s.laneK} x={CORE_X} y={12}>
        MESH CORE
      </text>
      <text className={s.laneTitle} x={CORE_X} y={30}>
        same for every framework
      </text>
      <text className={s.laneK} x={R_X} y={12}>
        RENDERER
      </text>
      <text className={s.laneTitle} x={R_X} y={30}>
        MeshRenderer&lt;TNode&gt;
      </text>

      {/* The contract line between the two lanes */}
      <path
        className="ln ln--fine ln--center"
        d={`M${CONTRACT_X} 4V${VIEW_H - 18}`}
      />
      <LineLabel x={CONTRACT_X} y={VIEW_H - 10} text="CONTRACT" />

      {WIRES.map((wire) => (
        <g key={wire.id} className={cn(s.part, state(has(phase?.wires, wire.id)))}>
          <path className={s.wire} d={wire.d} />
          <Arrowhead
            x={wire.tip[0]}
            y={wire.tip[1]}
            angle={wire.angle}
            className={s.wireHead}
          />
          <LineLabel
            x={337}
            y={WIRE_LABEL_Y[wire.id]}
            text={wire.label}
            className={s.wireLabel}
          />
        </g>
      ))}

      {CORE.map((node) => (
        <NodeBox
          key={node.id}
          node={node}
          x={CORE_X}
          w={CORE_W}
          active={has(phase?.core, node.id)}
        />
      ))}

      {RENDERER.map((node) => (
        <NodeBox
          key={node.id}
          node={node}
          x={R_X}
          w={R_W}
          active={has(phase?.renderer, node.id)}
          renderer
        />
      ))}
    </svg>
  );
}

function Lists({ phase }: { phase: Phase | null }) {
  const cls = (list: string[] | undefined, id: string) =>
    phase ? ((list ?? []).includes(id) ? s.on : s.off) : null;

  return (
    <div className={s.lists}>
      <div>
        <p className={cn('k k--caps', s.listK)}>Mesh core</p>
        <ul className={s.list}>
          {CORE.map((node) => (
            <li key={node.id} className={cn(s.item, cls(phase?.core, node.id))}>
              <span className={s.itemMain}>{node.main}</span>
              <span className={s.itemSub}>{node.sub}</span>
            </li>
          ))}
        </ul>
      </div>
      <div>
        <p className={cn('k k--caps', s.listK)}>Renderer</p>
        <ul className={cn(s.list, s.listRenderer)}>
          {RENDERER.map((node) => (
            <li
              key={node.id}
              className={cn(
                s.item,
                node.prop && s.itemProp,
                cls(phase?.renderer, node.id),
              )}
            >
              <span className={s.itemMain}>{node.main}</span>
              <span className={s.itemSub}>{node.sub}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

const OPTIONS: Array<{ id: PhaseId | null; name: string }> = [
  { id: null, name: 'All' },
  ...PHASES.map((p) => ({ id: p.id, name: p.name })),
];

/**
 * Fig · The renderer contract: what the Mesh core owns versus the four
 * operations a renderer implements. Pick a phase to highlight the parts
 * involved in it.
 */
export function RendererContract() {
  const [active, setActive] = useState<PhaseId | null>(null);
  const buttons = useRef<Array<HTMLButtonElement | null>>([]);
  const panelId = useId();
  const phase = PHASES.find((p) => p.id === active) ?? null;

  const onKeyDown = (event: KeyboardEvent<HTMLButtonElement>, i: number) => {
    const step =
      event.key === 'ArrowRight' ? 1 : event.key === 'ArrowLeft' ? -1 : 0;
    if (!step) return;
    event.preventDefault();
    const next = (i + step + OPTIONS.length) % OPTIONS.length;
    setActive(OPTIONS[next].id);
    buttons.current[next]?.focus();
  };

  const index = PHASES.findIndex((p) => p.id === active);

  return (
    <div className={s.contract}>
      <p className="sr-only">{LABEL}</p>
      <div className={s.controls}>
        <p className="k k--caps text-ink-3">Lifecycle phase</p>
        <div
          className={s.seg}
          role="group"
          aria-label="Highlight a lifecycle phase"
        >
          {OPTIONS.map((option, i) => (
            <button
              key={option.name}
              ref={(el) => {
                buttons.current[i] = el;
              }}
              type="button"
              className={s.segBtn}
              aria-pressed={active === option.id}
              aria-controls={panelId}
              onClick={() => setActive(option.id)}
              onKeyDown={(event) => onKeyDown(event, i)}
            >
              {i > 0 ? <span className={s.segNo}>{i}</span> : null}
              {option.name}
            </button>
          ))}
        </div>
      </div>

      <div className={s.contractWide}>
        <Drawing phase={phase} />
      </div>
      <div className={s.contractNarrow}>
        <Lists phase={phase} />
      </div>

      <div className={s.panel} id={panelId} aria-live="polite">
        <p className={cn('k k--caps', s.panelK)}>
          {phase
            ? `Phase ${index + 1} of ${PHASES.length} · ${phase.name}`
            : 'Overview'}
        </p>
        <p className={s.panelBody}>{phase ? phase.body : OVERVIEW}</p>
      </div>
    </div>
  );
}
