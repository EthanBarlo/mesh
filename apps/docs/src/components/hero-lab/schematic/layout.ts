/**
 * Data + geometry for the wiring-schematic hero.
 *
 * One data model (the six signals Mesh carries, the three renderers), two
 * hand-tuned layouts: `wide` (≈560×520) and `narrow` (phone widths). All
 * coordinates are SVG user units; text sizes are in the same units so the
 * drawing reads 1:1 at its design width.
 */

export type Fw = 'react' | 'vue' | 'svelte';
export type Dir = 'r' | 'l' | 'both';

export type Framework = {
  id: Fw;
  label: string;
  ext: string;
};

export const FRAMEWORKS: Framework[] = [
  { id: 'react', label: 'REACT', ext: 'tsx' },
  { id: 'vue', label: 'VUE', ext: 'vue' },
  { id: 'svelte', label: 'SVELTE', ext: 'svelte' },
];

export type Pin = {
  n: number;
  /** Signal name as printed on the J1 connector. */
  sig: string;
  /** Spoken name for the pin button. */
  name: string;
  dir: Dir;
  /** Livewire-side endpoint (inside U1). */
  lw: string;
  /** Shorter Livewire endpoint for the narrow layout. */
  lwShort: string;
  /** Island-side endpoint (inside the chip). Identical for every renderer. */
  isl: string;
  /** Pin-table function column. */
  fn: string;
  /** Readout shown in the notes area while the pin is active (wide only). */
  note: string[];
  /** Accessible description for the pin button. */
  a11y: string;
};

export const PINS: Pin[] = [
  {
    n: 1,
    sig: 'PROPS',
    name: 'Props',
    dir: 'r',
    lw: 'props()',
    lwShort: 'props()',
    isl: 'props',
    fn: 'server props, sent at mount',
    note: ['props() is serialized into the', 'mount payload and sent again', 'on every Livewire re-render.'],
    a11y: 'Props flow from the server to the island: props() is serialized at mount and updated on re-render.',
  },
  {
    n: 2,
    sig: 'ENTANGLE',
    name: 'Entangle',
    dir: 'both',
    lw: '$count',
    lwShort: '$count',
    isl: 'useEntangle',
    fn: 'syncs useEntangle + $count',
    note: ['Two-way binding: the island’s', 'useEntangle(\'count\') and the', 'public $count stay in sync.'],
    a11y: 'Entangle is two-way: useEntangle in the island and the public $count property stay in sync.',
  },
  {
    n: 3,
    sig: '$CALL',
    name: 'Call',
    dir: 'l',
    lw: 'increment()',
    lwShort: 'increment()',
    isl: '$call',
    fn: 'run a PHP method, await it',
    note: ['$wire.$call(\'increment\') runs', 'the PHP method and resolves', 'with its return value.'],
    a11y: 'Call flows from the island to the server: $call runs a Livewire method and resolves with its result.',
  },
  {
    n: 4,
    sig: '$DISPATCH',
    name: 'Dispatch',
    dir: 'l',
    lw: "#[On('saved')]",
    lwShort: '#[On]',
    isl: '$dispatch',
    fn: 'fire a Livewire event',
    note: ['$wire.$dispatch(\'saved\') fires', 'a Livewire event; #[On] listeners', 'anywhere on the page react.'],
    a11y: 'Dispatch flows from the island to Livewire: $dispatch fires an event that #[On] listeners receive.',
  },
  {
    n: 5,
    sig: 'SLOTS',
    name: 'Slots',
    dir: 'r',
    lw: 'Blade slots',
    lwShort: 'slots',
    isl: 'slots',
    fn: 'Blade markup, kept live',
    note: ['Markup between the <mesh:…>', 'tags arrives as children/slots', 'and updates on re-render.'],
    a11y: 'Slots flow from Blade to the island: markup between the tags arrives as children or slots.',
  },
  {
    n: 6,
    sig: 'LIFECYCLE',
    name: 'Lifecycle',
    dir: 'r',
    lw: 'render()',
    lwShort: 'render()',
    isl: 'mount',
    fn: 'mount, update, unmount',
    note: ['Mounts on first render, updates', 'in place on re-render, survives', 'morphs, unmounts on removal.'],
    a11y: 'Lifecycle is driven by Livewire: the island mounts, updates in place, survives morphs and unmounts on removal.',
  },
];

/** Group bands inside U1: [label, first pin index, last pin index]. */
export const GROUPS: [string, number, number][] = [
  ['STATE', 0, 1],
  ['ACTIONS', 2, 3],
  ['VIEW', 4, 5],
];

type Box = { x: number; y: number; w: number; h: number };

export type Layout = {
  kind: 'wide' | 'narrow';
  W: number;
  H: number;
  /** Text sizes (must match hero-figure.css). */
  fs: { k: number; sm: number; xs: number };
  frame: { inset: number; cols: number; rows: number };
  pins: number[];
  /** Vertical offset of a group separator below the last pin of a group. */
  sepDy: number;
  u1: Box & { nameX: number; headY: number; groupX: number; regX: number; holes: boolean; long: boolean };
  stubX: number;
  j1: Box & { cap: number; numX: number; nameX: number; arrowX: number; arrowLen: number };
  /** `top`: refdes + tag above the socket; `split`: refdes above, tag below. */
  sock: Box & { recX: number; label: 'top' | 'split' };
  chip: Box & { nameX: number; mark: { cx: number; cy: number; s: number; labelY: number; inline: boolean } };
  /** SW1: three throws on an arc left of the pivot, `spread` apart vertically. */
  sw: {
    px: number;
    py: number;
    r: number;
    spread: number;
    labelGap: number;
    ref: { x: number; y: number; anchor: 'start' | 'middle' };
  };
  lazy: { x: number; y0: number; y1: number; noteX: number; noteY: number; anchor: 'start' | 'end'; leaderY?: number };
  boundary: { x: number; y0: number; y1: number; labelY: number };
  /** General notes; `readout` swaps them for the active pin's note. */
  notes: { x: number; y: number; lines: string[]; readout: boolean };
  legend: { x: number; y: number; w: number; row: number; cols: number[] };
  tblock: Box & { strip: boolean };
};

function pinYs(first: number, pitch: number, gap: number): number[] {
  const ys: number[] = [];
  let y = first;
  for (let i = 0; i < 6; i++) {
    ys.push(y);
    y += i % 2 === 0 ? pitch : gap;
  }
  return ys;
}

const wp = pinYs(180, 24, 40);

export const WIDE: Layout = {
  kind: 'wide',
  W: 560,
  H: 520,
  fs: { k: 9.5, sm: 8.5, xs: 7.5 },
  frame: { inset: 14, cols: 4, rows: 4 },
  pins: wp,
  sepDy: 16,
  u1: {
    x: 26,
    y: 112,
    w: 140,
    h: wp[5] + 24 - 112,
    nameX: 158,
    headY: 132,
    groupX: 34,
    regX: 96,
    holes: true,
    long: true,
  },
  stubX: 180,
  j1: { x: 220, y: 156, w: 116, h: wp[5] + 24 - 156, cap: 10, numX: 229, nameX: 243, arrowX: 314, arrowLen: 14 },
  sock: { x: 366, y: 148, w: 168, h: wp[5] + 32 - 148, recX: 374, label: 'top' },
  chip: {
    x: 386,
    y: 156,
    w: 142,
    h: wp[5] + 24 - 156,
    nameX: 393,
    mark: { cx: 497, cy: 250, s: 1, labelY: 292, inline: false },
  },
  sw: { px: 516, py: 68, r: 42, spread: 24, labelGap: 8, ref: { x: 522, y: 59, anchor: 'start' } },
  lazy: { x: 516, y0: 72, y1: 148, noteX: 508, noteY: 112, anchor: 'end' },
  boundary: { x: 278, y0: 24, y1: 368, labelY: 32 },
  notes: { x: 26, y: 42, lines: ['Livewire owns the state.', 'Mesh carries it across.', 'Any island fits the socket.'], readout: true },
  legend: { x: 26, y: 378, w: 330, row: 17, cols: [26, 50, 122, 144] },
  tblock: { x: 372, y: 418, w: 174, h: 88, strip: false },
};

/** Narrow: everything below the SW1 band sits `o` lower. */
const o = 6;
const np = pinYs(210 + o, 22, 36);
const nChipBottom = np[5] + 48;
const nH = 626 + o;

export const NARROW: Layout = {
  kind: 'narrow',
  W: 340,
  H: nH,
  fs: { k: 10, sm: 9, xs: 8 },
  frame: { inset: 10, cols: 3, rows: 5 },
  pins: np,
  sepDy: 14,
  u1: {
    x: 16,
    y: 146 + o,
    w: 86,
    h: np[5] + 22 - 146 - o,
    nameX: 96,
    headY: 163 + o,
    groupX: 22,
    regX: 34,
    holes: false,
    long: false,
  },
  stubX: 112,
  j1: { x: 116, y: 186 + o, w: 90, h: np[5] + 22 - 186 - o, cap: 8, numX: 0, nameX: 122, arrowX: 191, arrowLen: 11 },
  sock: { x: 218, y: 146 + o, w: 106, h: nChipBottom + 8 - 146 - o, recX: 224, label: 'split' },
  chip: {
    x: 234,
    y: 154 + o,
    w: 86,
    h: nChipBottom - 154 - o,
    nameX: 240,
    mark: { cx: 252, cy: np[5] + 31, s: 0.5, labelY: np[5] + 35, inline: true },
  },
  sw: { px: 310, py: 68, r: 42, spread: 24, labelGap: 8, ref: { x: 310, y: 54, anchor: 'middle' } },
  lazy: { x: 310, y0: 71, y1: 146 + o, noteX: 302, noteY: 112, anchor: 'end' },
  boundary: { x: 161, y0: 22, y1: np[5] + 22 + 14, labelY: 30 },
  notes: { x: 18, y: 52, lines: ['Livewire owns state', 'Mesh carries it', 'Any island fits'], readout: false },
  legend: { x: 16, y: nChipBottom + 8 + 30, w: 308, row: 18, cols: [16, 36, 108, 128] },
  tblock: { x: 10, y: nH - 10 - 40, w: 320, h: 40, strip: true },
};

/** SW1 throw contacts: position + blade angle (deg) for each renderer. */
export function throwPositions(L: Layout): { f: Framework; x: number; y: number; deg: number }[] {
  const { sw } = L;
  return FRAMEWORKS.map((f, k) => {
    const a = Math.asin(sw.spread / sw.r) * (1 - k);
    return { f, x: sw.px - sw.r * Math.cos(a), y: sw.py - sw.r * Math.sin(a), deg: (a * 180) / Math.PI };
  });
}
