import { Arrow, PanelHead, Str } from './parts';

/**
 * Deferred vs live entangle, drawn as two sequence diagrams on the same
 * clock: four keystrokes ("mesh") and one save. Deferred holds the value in
 * the browser and sends it with the save; live sends one request per
 * keystroke and the server's copy follows the typing.
 */

type Mode = 'deferred' | 'live';

const W = 320;
const H = 330;
/** Browser and server lifelines. */
const BX = 86;
const SX = 244;
/** Server-side annotation column. */
const VX = SX + 12;
const KEYS = ['m', 'e', 's', 'h'] as const;
const KEY_Y0 = 72;
const STEP = 36;
const SAVE_Y = 238;
/** How far a request travels down the page (latency). */
const LAT = 10;

const keyY = (i: number) => KEY_Y0 + i * STEP;
const typed = (i: number) => KEYS.slice(0, i + 1).join('');

function Heads() {
  return (
    <g>
      {[
        { x: BX, label: 'BROWSER' },
        { x: SX, label: 'SERVER' },
      ].map(({ x, label }) => (
        <g key={label}>
          <rect className="ln fill-paper" x={x - 38} y={10} width={76} height={22} />
          <text className="svg-k" x={x} y={24.5} textAnchor="middle">
            {label}
          </text>
          <path
            className="ln ln--fine"
            strokeDasharray="2 3"
            d={`M${x} 32V${H - 14}`}
          />
          <path className="ln" d={`M${x - 5} ${H - 14}H${x + 5}`} />
        </g>
      ))}
      <text className="svg-k svg-k--dim" x={VX} y={48}>
        VALUE
      </text>
      <text className="svg-k" x={VX} y={62}>
        <Str>&quot;&quot;</Str>
      </text>
    </g>
  );
}

/** The time axis down the left edge. */
function Clock() {
  return (
    <g>
      <path className="ln ln--fine" d="M10 50V300" />
      <path className="fill-ink" d="M10 308L7.2 300H12.8Z" />
      <rect className="fill-paper" x={4} y={158} width={12} height={34} />
      <text
        className="svg-k svg-k--dim"
        transform="translate(7 175) rotate(90)"
        textAnchor="middle"
      >
        TIME
      </text>
    </g>
  );
}

/** Key caps typed into the island, each landing in local state at once. */
function Keystrokes() {
  return (
    <g>
      {KEYS.map((k, i) => {
        const y = keyY(i);
        return (
          <g key={k}>
            <rect
              className="ln fill-paper"
              x={28}
              y={y - 8}
              width={18}
              height={16}
            />
            <text
              className="svg-k"
              x={37}
              y={y + 3.5}
              textAnchor="middle"
              style={{ fill: 'var(--ink)', fontSize: 10 }}
            >
              {k}
            </text>
            <path className="ln ln--fine" d={`M46 ${y}H${BX}`} />
            <rect className="fill-ink" x={BX - 2.5} y={y - 2.5} width={5} height={5} />
          </g>
        );
      })}
    </g>
  );
}

function SaveButton() {
  return (
    <g>
      <rect className="fill-ink" x={20} y={SAVE_Y - 8} width={40} height={16} />
      <text
        className="svg-k"
        x={40}
        y={SAVE_Y + 3.5}
        textAnchor="middle"
        style={{ fill: 'var(--paper)' }}
      >
        SAVE
      </text>
      <path className="ln ln--fine" d={`M60 ${SAVE_Y}H${BX}`} />
    </g>
  );
}

/** The save round-trip, shared by both lanes. */
function SaveTrip({ mode }: { mode: Mode }) {
  const land = SAVE_Y + LAT;
  const done = mode === 'deferred' ? land + 36 : land + 22;
  const mid = (BX + SX) / 2;

  return (
    <g>
      <text
        className={mode === 'deferred' ? 'svg-k svg-k--accent' : 'svg-k'}
        x={mid}
        y={SAVE_Y - 6}
        textAnchor="middle"
      >
        $call(&quot;save&quot;)
      </text>
      <Arrow
        x1={BX}
        y1={SAVE_Y}
        x2={SX}
        y2={land}
        tone={mode === 'deferred' ? 'accent' : 'ink'}
      />
      {mode === 'deferred' ? (
        <text className="svg-k" x={mid} y={land + 12} textAnchor="middle">
          message: <Str>&quot;mesh&quot;</Str>
        </text>
      ) : (
        <text className="svg-k svg-k--dim" x={mid} y={land + 12} textAnchor="middle">
          nothing dirty
        </text>
      )}

      <rect
        className="ln fill-paper"
        x={SX - 4}
        y={land}
        width={8}
        height={done - land}
      />
      {mode === 'deferred' ? (
        <>
          <text className="svg-k" x={VX} y={land + 4}>
            <Str>&quot;mesh&quot;</Str>
          </text>
          <text className="svg-k" x={VX} y={land + 18}>
            updated()
          </text>
          <text className="svg-k" x={VX} y={land + 32}>
            save()
          </text>
        </>
      ) : (
        <text className="svg-k" x={VX} y={land + 12}>
          save()
        </text>
      )}

      <Arrow x1={SX} y1={done} x2={BX} y2={done + LAT} dashed />
      <text
        className="svg-k svg-k--dim"
        x={mid}
        y={done + LAT + 14}
        textAnchor="middle"
      >
        re-render · new props
      </text>
    </g>
  );
}

/** Deferred: no traffic while typing, the value is held as dirty. */
function DirtySpan() {
  const x = BX + 16;
  const top = keyY(0);
  return (
    <g>
      <path className="ln ln--fine" d={`M${BX} ${top}H${x + 5}M${BX} ${SAVE_Y}H${x + 5}`} />
      <path className="ln" d={`M${x} ${top}V${SAVE_Y}`} />
      <path
        className="ln"
        d={`M${x - 4} ${top + 4}L${x + 4} ${top - 4}M${x - 4} ${SAVE_Y + 4}L${x + 4} ${SAVE_Y - 4}`}
      />
      <text className="svg-k" x={x + 10} y={146}>
        DIRTY
      </text>
      <text className="svg-k svg-k--dim" x={x + 10} y={159}>
        held in the browser
      </text>
      <text className="svg-k svg-k--dim" x={x + 10} y={172}>
        0 requests
      </text>
    </g>
  );
}

/** Live: every keystroke is its own round-trip. */
function LiveTrips() {
  const first = keyY(0) + LAT;
  const last = keyY(KEYS.length - 1) + LAT + 8;
  const bx = W - 14;

  return (
    <g>
      {KEYS.map((k, i) => {
        const y = keyY(i);
        const land = y + LAT;
        return (
          <g key={k}>
            <Arrow x1={BX} y1={y} x2={SX} y2={land} />
            <rect
              className="ln fill-paper"
              x={SX - 3}
              y={land}
              width={6}
              height={8}
            />
            <text className="svg-k" x={VX} y={land + 6}>
              <Str>&quot;{typed(i)}&quot;</Str>
            </text>
            <Arrow
              x1={SX}
              y1={land + 8}
              x2={BX}
              y2={land + 8 + LAT}
              tone="fine"
              dashed
            />
          </g>
        );
      })}
      <path className="ln ln--fine" d={`M${bx - 4} ${first}H${bx}V${last}H${bx - 4}`} />
      <text
        className="svg-k svg-k--dim"
        transform={`translate(${bx + 5} ${(first + last) / 2}) rotate(90)`}
        textAnchor="middle"
      >
        updated() ×4
      </text>
    </g>
  );
}

function Lane({ mode }: { mode: Mode }) {
  const deferred = mode === 'deferred';

  return (
    <div>
      <PanelHead
        tag={deferred ? 'A' : 'B'}
        title={deferred ? 'Deferred' : 'Live'}
        code={deferred ? 'useEntangle("message")' : 'useEntangle("message", true)'}
        reading={deferred ? '1 request' : '5 requests'}
      />
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="block h-auto w-full overflow-visible"
        data-draw
        role="img"
        aria-label={
          deferred
            ? 'Deferred: typing m, e, s, h updates the island instantly and sends nothing. The value is held as dirty in the browser until Save, whose single request carries message "mesh"; the server runs updated() and then save(), and the island re-renders with new props.'
            : 'Live: each of the four keystrokes sends its own request, so the server value follows the typing ("m", "me", "mes", "mesh") and updated() runs four times. Save then sends a fifth request with nothing dirty.'
        }
      >
        <Clock />
        <Heads />
        <Keystrokes />
        {deferred ? <DirtySpan /> : <LiveTrips />}
        <SaveButton />
        <SaveTrip mode={mode} />
      </svg>
    </div>
  );
}

export function EntangleTimeline() {
  return (
    <div className="grid gap-x-8 gap-y-10 sm:grid-cols-2">
      <Lane mode="deferred" />
      <Lane mode="live" />
    </div>
  );
}
