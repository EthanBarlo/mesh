import { cn } from '@/lib/cn';
import s from './figures.module.css';
import { Balloon, BorderLabel, monoWidth } from './primitives';

const LABEL =
  'A mesh tag inside a two-column grid. In the DOM, div.board contains ' +
  'the Livewire wrapper div[data-mesh-component] (display: contents, no ' +
  'box), which contains the hidden slot holder div[data-mesh-slots] and ' +
  'div.mesh-root (display: contents, no box), which contains the ' +
  "component's root, section.card. div.note is a sibling of the wrapper. " +
  'In layout, the wrapper and .mesh-root generate no boxes, so the grid ' +
  'sees two items side by side: section.card (1) and div.note (2).';

type Mark = 'box' | 'none' | 'accent';

type Row = {
  depth: number;
  label: string;
  display: string;
  mark: Mark;
  balloon?: number;
};

const ROWS: Row[] = [
  { depth: 0, label: 'div.board', display: 'grid', mark: 'box' },
  {
    depth: 1,
    label: 'div[data-mesh-component]',
    display: 'contents',
    mark: 'none',
  },
  {
    depth: 2,
    label: 'div[data-mesh-slots]',
    display: 'none',
    mark: 'none',
  },
  { depth: 2, label: 'div.mesh-root', display: 'contents', mark: 'none' },
  {
    depth: 3,
    label: 'section.card',
    display: 'block',
    mark: 'accent',
    balloon: 1,
  },
  {
    depth: 1,
    label: 'div.note',
    display: 'block',
    mark: 'box',
    balloon: 2,
  },
];

/* ---------- Tree geometry ---------- */
const TREE_W = 340;
const ROW0 = 44;
const ROW_H = 28;
const INDENT = 18;
const CODE = 11;

const baseline = (i: number) => ROW0 + ROW_H * i;
const centre = (i: number) => baseline(i) - 3.5;
const markX = (depth: number) => 4 + depth * INDENT;
const guideX = (depth: number) => markX(depth) + 4;

/** Vertical guide from a parent row down to its last child, with ticks. */
function Guide({ parent, rows }: { parent: number; rows: number[] }) {
  const { depth } = ROWS[parent];
  const x = guideX(depth);
  const last = rows[rows.length - 1];
  const tickEnd = markX(depth + 1);
  const d =
    `M${x} ${centre(parent) + 4}V${centre(last)}` +
    rows.map((c) => `M${x} ${centre(c)}H${tickEnd}`).join('');
  return <path className="ln ln--fine" d={d} />;
}

function Marker({ x, y, mark }: { x: number; y: number; mark: Mark }) {
  const cls =
    mark === 'accent' ? s.accentMark : mark === 'box' ? s.solidMark : s.ghost;
  return <rect className={cls} x={x} y={y} width={8} height={8} />;
}

function Tree() {
  return (
    <svg
      className={cn(s.svg, s.islandTree)}
      viewBox={`0 0 ${TREE_W} 224`}
      data-draw
      aria-hidden="true"
      focusable="false"
    >
      <text className={s.k} x={0} y={12}>
        DOM
      </text>
      <text className={s.k} x={TREE_W} y={12} textAnchor="end">
        DISPLAY
      </text>
      <path className="ln ln--fine" d={`M0 20H${TREE_W}`} />

      <Guide parent={0} rows={[1, 5]} />
      <Guide parent={1} rows={[2, 3]} />
      <Guide parent={3} rows={[4]} />

      {ROWS.map((row, i) => {
        const mx = markX(row.depth);
        const lx = mx + 14;
        const labelEnd = lx + monoWidth(row.label, CODE);
        const noteW = monoWidth(row.display, 9.5, 0.1);
        const leaderStart = row.balloon ? labelEnd + 26 : labelEnd + 8;
        const leaderEnd = TREE_W - noteW - 8;
        const dimRow = row.mark === 'none';
        return (
          <g key={row.label}>
            <Marker x={mx} y={centre(i) - 4} mark={row.mark} />
            <text
              className={cn(s.code, dimRow && s.codeDim)}
              x={lx}
              y={baseline(i)}
            >
              {row.label}
            </text>
            {row.balloon ? (
              <Balloon cx={labelEnd + 13} cy={centre(i)} n={row.balloon} />
            ) : null}
            {leaderEnd > leaderStart ? (
              <path
                className={s.ghost}
                d={`M${leaderStart} ${centre(i)}H${leaderEnd}`}
              />
            ) : null}
            <text
              className={cn(s.k, !dimRow && s.kInk)}
              x={TREE_W}
              y={baseline(i) - 0.5}
              textAnchor="end"
            >
              {row.display}
            </text>
          </g>
        );
      })}

      <path className="ln ln--fine" d={`M0 198H${TREE_W}`} />
      <rect className={s.solidMark} x={0} y={209} width={8} height={8} />
      <text className={s.k} x={14} y={216}>
        BOX
      </text>
      <rect className={s.ghost} x={52} y={209} width={8} height={8} />
      <text className={s.k} x={66} y={216}>
        NO BOX
      </text>
      <rect className={s.accentMark} x={126} y={209} width={8} height={8} />
      <text className={s.k} x={140} y={216}>
        YOUR COMPONENT
      </text>
    </svg>
  );
}

/* ---------- Layout geometry ---------- */
const LAYOUT_W = 300;
const COL1 = [20, 144] as const;
const COL2 = [156, 280] as const;
const ITEM_Y = 56;
const ITEM_H = 120;

function Tick({ x, y }: { x: number; y: number }) {
  return <path className={s.dim} d={`M${x - 3} ${y + 3}L${x + 3} ${y - 3}`} />;
}

function Layout() {
  const constructionXs = [...COL1, ...COL2];
  return (
    <svg
      className={cn(s.svg, s.islandLayout)}
      viewBox={`0 0 ${LAYOUT_W} 224`}
      data-draw
      aria-hidden="true"
      focusable="false"
    >
      <text className={s.k} x={0} y={12}>
        LAYOUT
      </text>
      <text className={s.k} x={LAYOUT_W} y={12} textAnchor="end">
        GRID ITEMS
      </text>
      <path className="ln ln--fine" d={`M0 20H${LAYOUT_W}`} />

      {constructionXs.map((x) => (
        <path key={x} className={s.construct} d={`M${x} 30V204`} />
      ))}

      <rect className={s.box} x={8} y={40} width={284} height={150} />
      <BorderLabel x={16} y={40} text="div.board" />

      {/* Item 1: the component's root element. */}
      <rect
        className={cn(s.box, s.boxAccent)}
        x={COL1[0]}
        y={ITEM_Y}
        width={COL1[1] - COL1[0]}
        height={ITEM_H}
      />
      <text className={s.code} x={COL1[0] + 10} y={ITEM_Y + 22}>
        section.card
      </text>
      <path
        className="ln ln--fine"
        d={
          `M${COL1[0] + 10} ${ITEM_Y + 36}H${COL1[1] - 20}` +
          `M${COL1[0] + 10} ${ITEM_Y + 46}H${COL1[1] - 34}` +
          `M${COL1[0] + 10} ${ITEM_Y + 56}H${COL1[1] - 26}`
        }
      />
      <rect
        className="ln ln--fine"
        x={COL1[0] + 10}
        y={ITEM_Y + 96}
        width={40}
        height={14}
      />
      <Balloon cx={COL1[0]} cy={ITEM_Y} n={1} />

      {/* Item 2: a plain sibling element. */}
      <rect
        className={s.box}
        x={COL2[0]}
        y={ITEM_Y}
        width={COL2[1] - COL2[0]}
        height={ITEM_H}
      />
      <text className={s.code} x={COL2[0] + 10} y={ITEM_Y + 22}>
        div.note
      </text>
      <path
        className="ln ln--fine"
        d={
          `M${COL2[0] + 10} ${ITEM_Y + 36}H${COL2[1] - 20}` +
          `M${COL2[0] + 10} ${ITEM_Y + 46}H${COL2[1] - 40}` +
          `M${COL2[0] + 10} ${ITEM_Y + 56}H${COL2[1] - 28}` +
          `M${COL2[0] + 10} ${ITEM_Y + 66}H${COL2[1] - 50}`
        }
      />
      <Balloon cx={COL2[0]} cy={ITEM_Y} n={2} />

      {/* Column dimensions */}
      <path
        className={s.dim}
        d={`M${COL1[0]} 200H${COL1[1]}M${COL2[0]} 200H${COL2[1]}`}
      />
      {constructionXs.map((x) => (
        <Tick key={x} x={x} y={200} />
      ))}
      <text
        className={s.dimText}
        x={(COL1[0] + COL1[1]) / 2}
        y={215}
        textAnchor="middle"
      >
        1fr
      </text>
      <text
        className={s.dimText}
        x={(COL2[0] + COL2[1]) / 2}
        y={215}
        textAnchor="middle"
      >
        1fr
      </text>
    </svg>
  );
}

/**
 * Fig · How an island sits in layout. The wrapper elements Mesh renders
 * use `display: contents`, so the component's root is laid out as a direct
 * child of whatever contains the tag.
 */
export function IslandDom() {
  return (
    <div className={s.islandDom} role="img" aria-label={LABEL}>
      <div className={s.islandGrid}>
        <Tree />
        <Layout />
      </div>
    </div>
  );
}
