import { Arrow, PanelHead } from './parts';

/**
 * The two kanban demos side by side. A: one island renders the whole board
 * inside a single React root, so dnd-kit's context spans every card.
 * B: a plain Livewire component owns the board and Blade composes thirteen
 * small islands, each its own root; a drop travels up as a Livewire event
 * and the new order comes back down as reactive props.
 */

const W = 320;
const H = 300;
/** Top of the browser half (below the PHP band). */
const TOP = 96;
/** Cards per column in each demo's seed data. */
const BOARD_CARDS = [4, 4, 4];
const KANBAN_CARDS = [4, 3, 3];
const STUBS = [34, 22, 40, 28];
/** Arrow lanes under the two member chips. */
const LANE_1 = 186;
const LANE_2 = 270;

/** A filled square on a box's corner marks a framework root. */
function Root({ x, y }: { x: number; y: number }) {
  return (
    <rect className="fill-ink" x={x - 2.5} y={y - 2.5} width={5} height={5} />
  );
}

/** The PHP half: the Livewire class and the two members the figure uses. */
function Shell({ phpClass }: { phpClass: string }) {
  return (
    <g>
      <rect className="ln" x={8} y={8} width={W - 16} height={H - 16} />
      <path className="ln ln--fine" d={`M8 78H${W - 8}`} />
      <text className="svg-k svg-k--dim" x={18} y={24}>
        LIVEWIRE · PHP
      </text>
      <text className="svg-k" x={18} y={39}>
        {phpClass}
      </text>
      {[
        { x: 168, w: 60, label: '$columns' },
        { x: 234, w: 72, label: 'moveCard()' },
      ].map((chip) => (
        <g key={chip.label}>
          <rect
            className="ln fill-paper"
            x={chip.x}
            y={50}
            width={chip.w}
            height={20}
          />
          <text
            className="svg-k"
            x={chip.x + chip.w / 2}
            y={63.5}
            textAnchor="middle"
          >
            {chip.label}
          </text>
        </g>
      ))}
    </g>
  );
}

/** A card: a box with a stub line standing in for its title. */
function Card({
  x,
  y,
  w,
  stub,
  accent = false,
}: {
  x: number;
  y: number;
  w: number;
  stub: number;
  accent?: boolean;
}) {
  return (
    <g>
      <rect
        className={accent ? 'ln ln--accent fill-paper' : 'ln fill-paper'}
        x={x}
        y={y}
        width={w}
        height={14}
      />
      <path
        className="ln ln--fine"
        d={`M${x + 6} ${y + 7}H${x + 6 + stub}`}
      />
    </g>
  );
}

function OneIsland() {
  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="block h-auto w-full overflow-visible"
      data-draw
      role="img"
      aria-label="One island: the Mesh component App\Mesh\Board\Kanban holds $columns and moveCard(). A single React root renders the whole board inside one dnd-kit DndContext with three columns of cards. The root is two-way bound to $columns with useEntangle and confirms moves with $call('moveCard')."
    >
      <Shell phpClass="App\Mesh\Board\Kanban" />

      <Arrow x1={LANE_1} y1={72} x2={LANE_1} y2={TOP - 2} both />
      <text
        className="svg-k svg-k--dim"
        x={LANE_1 - 8}
        y={90}
        textAnchor="end"
      >
        useEntangle
      </text>
      <Arrow x1={LANE_2} y1={TOP - 2} x2={LANE_2} y2={72} />
      <text
        className="svg-k svg-k--dim"
        x={LANE_2 - 8}
        y={90}
        textAnchor="end"
      >
        $call
      </text>

      <rect
        className="ln fill-paper"
        x={20}
        y={TOP}
        width={280}
        height={188}
      />
      <Root x={20} y={TOP} />
      <text className="svg-k" x={30} y={TOP + 16}>
        REACT ROOT
      </text>

      <rect
        className="ln ln--dash"
        x={30}
        y={TOP + 24}
        width={260}
        height={154}
      />
      <text className="svg-k svg-k--dim" x={38} y={TOP + 38}>
        DndContext
      </text>

      {BOARD_CARDS.map((count, c) => {
        const x = 38 + c * 84;
        const top = TOP + 46;
        return (
          <g key={c}>
            <rect
              className="ln ln--fine"
              x={x}
              y={top}
              width={76}
              height={124}
            />
            <path className="ln" d={`M${x + 8} ${top + 12}H${x + 40}`} />
            {Array.from({ length: count }, (_, j) => (
              <Card
                key={j}
                x={x + 6}
                y={top + 20 + j * 20}
                w={64}
                stub={STUBS[(c + j) % 4]}
              />
            ))}
          </g>
        );
      })}
    </svg>
  );
}

function ManyIslands() {
  const cellTop = TOP + 24;
  const cellH = 122;
  const bus = cellTop + cellH + 14;
  // The highlighted card: third column, second card.
  const hotY = cellTop + 32 + 20 + 7;

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="block h-auto w-full overflow-visible"
      data-draw
      role="img"
      aria-label="Many islands: the plain Livewire component App\Livewire\Kanban\Board holds $columns and moveCard(). A Blade @foreach renders three column cells; each holds a column island and its card islands, thirteen roots in all. A dropped card dispatches a Livewire event that reaches moveCard() through #[On]; the new order flows back down to every island as #[Reactive] props. A window event shares the drag state between islands in the browser."
    >
      <Shell phpClass="App\Livewire\Kanban\Board" />

      <Arrow x1={LANE_1} y1={72} x2={LANE_1} y2={TOP - 2} />
      <text
        className="svg-k svg-k--dim"
        x={LANE_1 - 8}
        y={90}
        textAnchor="end"
      >
        #[Reactive] props
      </text>

      <rect
        className="ln ln--dash"
        x={20}
        y={TOP}
        width={280}
        height={188}
      />
      <text className="svg-k svg-k--dim" x={30} y={TOP + 16}>
        BLADE · @foreach
      </text>

      {KANBAN_CARDS.map((count, c) => {
        const x = 30 + c * 90;
        return (
          <g key={c}>
            <rect
              className="ln ln--fine"
              x={x}
              y={cellTop}
              width={80}
              height={cellH}
            />
            <rect
              className="ln fill-paper"
              x={x + 6}
              y={cellTop + 8}
              width={68}
              height={16}
            />
            <path
              className="ln"
              d={`M${x + 12} ${cellTop + 16}H${x + 44}`}
            />
            <Root x={x + 6} y={cellTop + 8} />
            {Array.from({ length: count }, (_, j) => {
              const y = cellTop + 32 + j * 20;
              return (
                <g key={j}>
                  <Card
                    x={x + 6}
                    y={y}
                    w={68}
                    stub={STUBS[(c + j) % 4]}
                    accent={c === 2 && j === 1}
                  />
                  <Root x={x + 6} y={y} />
                </g>
              );
            })}
          </g>
        );
      })}

      {/* A drop: $dispatch up to the Board's #[On] listener. */}
      <path
        className="ln ln--accent"
        d={`M284 ${hotY}H294V82H${LANE_2}V77`}
      />
      <path
        className="fill-accent"
        d={`M${LANE_2} 70L${LANE_2 - 2.4} 77H${LANE_2 + 2.4}Z`}
      />
      <text
        className="svg-k svg-k--accent"
        x={LANE_2 - 8}
        y={90}
        textAnchor="end"
      >
        $dispatch
      </text>

      {/* Drag state shared in the browser only. */}
      <path className="ln ln--dash" d={`M40 ${bus}H280`} />
      {[70, 160, 250].map((x) => (
        <g key={x}>
          <path
            className="ln ln--fine"
            d={`M${x} ${cellTop + cellH}V${bus}`}
          />
          <circle className="fill-ink" cx={x} cy={bus} r={1.8} />
        </g>
      ))}
      <text
        className="svg-k svg-k--dim"
        x={160}
        y={bus + 16}
        textAnchor="middle"
      >
        window event · drag state
      </text>
    </svg>
  );
}

export function IslandComposition() {
  return (
    <div className="grid gap-x-8 gap-y-10 sm:grid-cols-2">
      <div>
        <PanelHead
          tag="A"
          title="One island"
          code="<mesh:board.kanban />"
          reading="1 root"
        />
        <OneIsland />
      </div>
      <div>
        <PanelHead
          tag="B"
          title="Many islands"
          code="<livewire:kanban.board />"
          reading="13 roots"
        />
        <ManyIslands />
      </div>
    </div>
  );
}
