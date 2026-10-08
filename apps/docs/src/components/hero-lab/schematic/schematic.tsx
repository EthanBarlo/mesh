import type { CSSProperties } from 'react';
import { Glyph } from './glyphs';
import { FRAMEWORKS, GROUPS, PINS, throwPositions, type Dir, type Fw, type Layout } from './layout';

/**
 * The drawing itself: a pure function of layout + state, no hooks, so it can
 * also be rendered to a static SVG for snapshots. All styling lives in
 * hero-figure.css under the `hl-schematic-` prefix.
 */

const P = 'hl-schematic-';

/** `cx('ln fine d')` → prefixed class list. Falsy entries are dropped. */
function cx(...parts: (string | false | null | undefined)[]): string {
  return parts
    .filter(Boolean)
    .join(' ')
    .split(/\s+/)
    .filter(Boolean)
    .map((c) => P + c)
    .join(' ');
}

type Vars = CSSProperties & Record<`--${string}`, string | number>;

/** Draw-in / fade delay. */
function dl(ms: number, extra?: Vars): Vars {
  return { '--dl': `${ms}ms`, ...extra };
}

const rect = (x: number, y: number, w: number, h: number) => `M${x} ${y}H${x + w}V${y + h}H${x}Z`;

/** 45° hatch segments clipped to a rectangle. */
function hatch(x: number, y: number, w: number, h: number, step: number): string {
  let d = '';
  for (let k = -h; k < w; k += step) {
    // Line x' = x + k + (y + h - y') : from bottom-left going up-right.
    let x0 = x + k;
    let y0 = y + h;
    let x1 = x + k + h;
    let y1 = y;
    if (x0 < x) {
      y0 -= x - x0;
      x0 = x;
    }
    if (x1 > x + w) {
      y1 += x1 - (x + w);
      x1 = x + w;
    }
    if (y0 - y1 > 0.5) d += `M${x0.toFixed(2)} ${y0.toFixed(2)}L${x1.toFixed(2)} ${y1.toFixed(2)}`;
  }
  return d;
}

/** A direction arrow, `len` long, starting at x. */
function Arrow({ x, y, len, dir, className }: { x: number; y: number; len: number; dir: Dir; className?: string }) {
  const h = 4.2;
  const w = 2.4;
  const left = dir === 'l' || dir === 'both';
  const right = dir === 'r' || dir === 'both';
  const x0 = left ? x + h - 0.5 : x;
  const x1 = right ? x + len - h + 0.5 : x + len;
  return (
    <g className={className}>
      <path d={`M${x0} ${y}H${x1}`} className={cx('ln arrow-ln')} />
      {right ? <path d={`M${x + len} ${y}l${-h} ${-w}v${w * 2}z`} className={cx('arrow-head')} /> : null}
      {left ? <path d={`M${x} ${y}l${h} ${-w}v${w * 2}z`} className={cx('arrow-head')} /> : null}
    </g>
  );
}

export type SchematicProps = {
  L: Layout;
  fw: Fw;
  /** Active pin index (0–5) or null. */
  active: number | null;
  /** The entangled register value shown in U1. */
  count: number;
  /** Increments on every renderer swap; re-keys the chip so it re-seats. */
  swapKey: number;
  /** Whether the current swap had to fetch a chunk (first use). */
  fetched: boolean;
  version: string;
  /** Renderer under the pointer in SW1 (hover preview). */
  hoverFw?: Fw | null;
  /** Fired when the island→server ENTANGLE pulse lands in U1. */
  onEntangleLand?: () => void;
  /** Pointer hover over a pin-table row (mouse only; pins have real buttons). */
  onRowHover?: (i: number | null) => void;
};

export function SchematicSvg({
  L,
  fw,
  active,
  count,
  swapKey,
  fetched,
  version,
  hoverFw = null,
  onEntangleLand,
  onRowHover,
}: SchematicProps) {
  const { W, H, fs, pins, u1, j1, sock, chip, sw, notes } = L;
  const wide = L.kind === 'wide';
  const fwIndex = FRAMEWORKS.findIndex((f) => f.id === fw);
  const framework = FRAMEWORKS[fwIndex];
  const u1R = u1.x + u1.w;
  const j1R = j1.x + j1.w;
  const routeLen = chip.x - u1R;
  const tY = (y: number, size = fs.k) => y + size * 0.35;
  const state = (i: number) => (active === null ? '' : active === i ? 'is-on' : 'is-dim');
  const readoutHead = active === null ? '' : `Pin ${PINS[active].n} · ${PINS[active].sig}`;

  // SW1: the blade rests pointing left and rotates onto the selected throw.
  const throws = throwPositions(L);
  const bladeAngle = throws[fwIndex].deg;

  // Seat timing: first paint waits for the draw-in; a cached chunk seats at
  // once; a fresh chunk waits for the fetch packet to arrive.
  const seatDelay = swapKey === 0 ? 1220 : fetched ? 520 : 40;

  const i0 = L.frame.inset;
  const zw = (W - 2 * i0) / L.frame.cols;
  const zh = (H - 2 * i0) / L.frame.rows;
  let grid = '';
  for (let gx = i0 + 12; gx < W - i0; gx += 12) grid += `M${gx} ${i0}V${H - i0}`;
  for (let gy = i0 + 12; gy < H - i0; gy += 12) grid += `M${i0} ${gy}H${W - i0}`;

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox={`0 0 ${W} ${H}`}
      className={cx('svg', `svg--${L.kind}`, active !== null && 'has-active')}
      aria-hidden="true"
      focusable="false"
    >
      {/* ---------- Drafting grid ---------- */}
      <path d={grid} className={cx('ln grid fade')} style={dl(0)} />

      {/* ---------- Sheet frame + zones ---------- */}
      <g className={cx('frame')}>
        <path d={rect(0.5, 0.5, W - 1, H - 1)} pathLength={1} className={cx('ln fine d')} style={dl(0)} />
        <path d={rect(i0, i0, W - 2 * i0, H - 2 * i0)} pathLength={1} className={cx('ln d')} style={dl(60)} />
        {Array.from({ length: L.frame.cols - 1 }, (_, k) => {
          const x = i0 + (k + 1) * zw;
          return (
            <path key={`zc${k}`} d={`M${x} 0.5V${i0}M${x} ${H - i0}V${H - 0.5}`} className={cx('ln fine fade')} style={dl(300)} />
          );
        })}
        {Array.from({ length: L.frame.rows - 1 }, (_, k) => {
          const y = i0 + (k + 1) * zh;
          return (
            <path key={`zr${k}`} d={`M0.5 ${y}H${i0}M${W - i0} ${y}H${W - 0.5}`} className={cx('ln fine fade')} style={dl(300)} />
          );
        })}
        {Array.from({ length: L.frame.cols }, (_, k) => {
          const x = i0 + (k + 0.5) * zw;
          return (
            <g key={`zl${k}`} className={cx('fade')} style={dl(360)}>
              <text x={x} y={tY(i0 / 2, fs.xs)} className={cx('k xs dim mid')}>
                {k + 1}
              </text>
              <text x={x} y={tY(H - i0 / 2, fs.xs)} className={cx('k xs dim mid')}>
                {k + 1}
              </text>
            </g>
          );
        })}
        {Array.from({ length: L.frame.rows }, (_, k) => {
          const y = i0 + (k + 0.5) * zh;
          const ch = String.fromCharCode(65 + k);
          return (
            <g key={`zv${k}`} className={cx('fade')} style={dl(360)}>
              <text x={i0 / 2} y={tY(y, fs.xs)} className={cx('k xs dim mid')}>
                {ch}
              </text>
              <text x={W - i0 / 2} y={tY(y, fs.xs)} className={cx('k xs dim mid')}>
                {ch}
              </text>
            </g>
          );
        })}
      </g>

      {/* ---------- Server / browser boundary ---------- */}
      <g className={cx('boundary')}>
        <path d={`M${L.boundary.x} ${L.boundary.y0}V${L.boundary.y1}`} className={cx('ln center fade')} style={dl(900)} />
        <g className={cx('fade')} style={dl(1000)}>
          <text x={L.boundary.x - 8} y={tY(L.boundary.labelY, fs.xs)} className={cx('k xs caps dim end')}>
            PHP · server
          </text>
          <text x={L.boundary.x + 8} y={tY(L.boundary.labelY, fs.xs)} className={cx('k xs caps dim')}>
            browser · JS
          </text>
        </g>
      </g>

      {/* ---------- General notes; in the wide layout, the active pin's readout ---------- */}
      <g className={cx('fade')} style={dl(1100)}>
        {active === null || !notes.readout ? (
          <>
            <text x={notes.x} y={notes.y} className={cx('k sm caps dim')}>
              Notes
            </text>
            {notes.lines.map((line, k) => (
              <g key={line}>
                <text x={notes.x} y={notes.y + 15 + k * 14} className={cx('k dim')}>
                  {k + 1}
                </text>
                <text x={notes.x + 12} y={notes.y + 15 + k * 14} className={cx('k ink2')}>
                  {line}
                </text>
              </g>
            ))}
          </>
        ) : (
          <g key={`readout-${active}`} className={cx('readout')}>
            <text x={notes.x} y={notes.y} className={cx('k sm caps acc')}>
              {readoutHead}
            </text>
            <Arrow
              x={notes.x + (readoutHead.length + 1) * 6.3}
              y={notes.y - 3}
              len={14}
              dir={PINS[active].dir}
              className={cx('is-on')}
            />
            {PINS[active].note.map((line, k) => (
              <text key={k} x={notes.x} y={notes.y + 15 + k * 14} className={cx('k ink2')}>
                {line}
              </text>
            ))}
          </g>
        )}
      </g>

      {/* ---------- Traces (under every body) ---------- */}
      <g className={cx('traces')}>
        {pins.map((y, i) => (
          <path
            key={`tr${i}`}
            d={`M${u1R} ${y}H${chip.x}`}
            pathLength={1}
            className={cx('ln trace d', state(i))}
            style={dl(560 + i * 55)}
          />
        ))}
      </g>

      {/* ---------- Signal pulses ---------- */}
      <g className={cx('pulses', active !== null && 'is-paused')}>
        <path d={`M${u1R} ${pins[0]}H${chip.x}`} className={cx('pulse amb amb-props')} style={{ '--d': `${routeLen}px` } as Vars} />
        <path d={`M${u1R} ${pins[1]}H${chip.x}`} className={cx('pulse amb amb-ent-r')} style={{ '--d': `${routeLen}px` } as Vars} />
        <path
          d={`M${chip.x} ${pins[1]}H${u1R}`}
          className={cx('pulse amb amb-ent-l')}
          style={{ '--d': `${routeLen}px` } as Vars}
          onAnimationIteration={onEntangleLand}
        />
      </g>
      {active !== null ? (
        <g className={cx('pulses-run')} key={`run-${active}`}>
          {PINS[active].dir !== 'l' ? (
            <path d={`M${u1R} ${pins[active]}H${chip.x}`} className={cx('pulse run')} style={{ '--d': `${routeLen}px` } as Vars} />
          ) : null}
          {PINS[active].dir !== 'r' ? (
            <path
              d={`M${chip.x} ${pins[active]}H${u1R}`}
              className={cx('pulse run', PINS[active].dir === 'both' && 'run-late')}
              style={{ '--d': `${routeLen}px` } as Vars}
            />
          ) : null}
        </g>
      ) : null}

      {/* ---------- U1 · Livewire component ---------- */}
      <g className={cx('u1')}>
        <path d={rect(u1.x, u1.y, u1.w, u1.h)} pathLength={1} className={cx('ln d body')} style={dl(180)} />
        <path
          d={`M${u1.x} ${u1.headY + 21}H${u1R}`}
          pathLength={1}
          className={cx('ln fine d')}
          style={dl(420)}
        />
        {u1.holes
          ? [
              [u1.x + 8, u1.y + 8],
              [u1R - 8, u1.y + 8],
              [u1.x + 8, u1.y + u1.h - 8],
              [u1R - 8, u1.y + u1.h - 8],
            ].map(([hx, hy], k) => (
              <g key={`h${k}`} className={cx('fade')} style={dl(700)}>
                <circle cx={hx} cy={hy} r={2.8} className={cx('ln fine')} />
                <path d={`M${hx - 1.4} ${hy}H${hx + 1.4}M${hx} ${hy - 1.4}V${hy + 1.4}`} className={cx('ln fine')} />
              </g>
            ))
          : null}
        <g className={cx('fade')} style={dl(760)}>
          <text x={u1.x} y={u1.y - 7} className={cx('k ref ink')}>
            U1
          </text>
          <text x={u1R} y={u1.y - 7} className={cx('k sm caps dim end')}>
            Livewire 4
          </text>
          <text x={u1.x + 8} y={u1.headY} className={cx('k lg ink')}>
            {u1.long ? 'App\\Mesh\\Counter' : 'Counter'}
          </text>
          <text x={u1.x + 8} y={u1.headY + 13} className={cx('k sm dim')}>
            {u1.long ? 'PHP · server state' : 'PHP · server'}
          </text>
        </g>
        {GROUPS.map(([label, a, b], g) => (
          <g key={label} className={cx('fade')} style={dl(820 + g * 40)}>
            <text x={u1.groupX} y={pins[a] - (wide ? 13 : 12)} className={cx('k xs caps dim')}>
              {label}
            </text>
            {g < GROUPS.length - 1 ? (
              <path
                d={`M${u1.x + 6} ${pins[b] + L.sepDy}H${u1R - 6}`}
                className={cx('ln faint')}
              />
            ) : null}
          </g>
        ))}
        {pins.map((y, i) => (
          <text
            key={`lw${i}`}
            x={u1.nameX}
            y={tY(y)}
            className={cx('k ink2 end fade pin-name', state(i))}
            style={dl(860 + i * 30)}
          >
            {wide ? PINS[i].lw : PINS[i].lwShort}
          </text>
        ))}
        {/* The entangled register: $count's live value. */}
        <g className={cx('fade reg', state(1))} style={dl(1000)}>
          <path d={rect(u1.regX, pins[1] - 6.5, 18, 13)} className={cx('ln fine')} />
          <text x={u1.regX + 9} y={tY(pins[1])} className={cx('k ink mid reg-val')} key={count}>
            {count}
          </text>
        </g>
        {/* Pin numbers on the stubs. */}
        {pins.map((y, i) => (
          <text
            key={`pn${i}`}
            x={(u1R + L.stubX) / 2}
            y={y - 3.5}
            className={cx('k xs dim mid fade', state(i))}
            style={dl(900)}
          >
            {i + 1}
          </text>
        ))}
      </g>

      {/* ---------- J1 · Mesh connector ---------- */}
      <g className={cx('j1')}>
        <path d={rect(j1.x, j1.y, j1.w, j1.h)} pathLength={1} className={cx('ln wall d body')} style={dl(260)} />
        <path
          d={`M${j1.x} ${j1.y + j1.cap}H${j1R}M${j1.x} ${j1.y + j1.h - j1.cap}H${j1R}`}
          className={cx('ln fine fade')}
          style={dl(700)}
        />
        <path
          d={hatch(j1.x, j1.y, j1.w, j1.cap, 4) + hatch(j1.x, j1.y + j1.h - j1.cap, j1.w, j1.cap, 4)}
          className={cx('ln faint fade')}
          style={dl(760)}
        />
        {GROUPS.slice(0, -1).map(([label, , b]) => (
          <path
            key={`js${label}`}
            d={`M${j1.x} ${pins[b] + L.sepDy}H${j1R}`}
            className={cx('ln faint fade')}
            style={dl(800)}
          />
        ))}
        <g className={cx('fade')} style={dl(820)}>
          <text x={j1.x} y={j1.y - 7} className={cx('k ref ink')}>
            J1
          </text>
          <text x={j1R} y={j1.y - 7} className={cx('k caps ink strong end')}>
            Mesh
          </text>
        </g>
        {pins.map((y, i) => (
          <g key={`jp${i}`} className={cx('fade jrow', state(i))} style={dl(880 + i * 35)}>
            <rect x={j1.x + 1} y={y - 9} width={j1.w - 2} height={18} className={cx('jrow-bg')} />
            {j1.numX ? (
              <text x={j1.numX} y={tY(y, fs.xs)} className={cx('k xs dim mid')}>
                {i + 1}
              </text>
            ) : null}
            <text x={j1.nameX} y={tY(y)} className={cx('k caps ink sig')}>
              {PINS[i].sig}
            </text>
            {i < 2 ? (
              // Lights up while the ambient pulse passes through the connector.
              <text x={j1.nameX} y={tY(y)} className={cx('k caps acc sig blink', i === 0 ? 'blink-props' : 'blink-ent')}>
                {PINS[i].sig}
              </text>
            ) : null}
            <Arrow x={j1.arrowX} y={y} len={j1.arrowLen} dir={PINS[i].dir} />
          </g>
        ))}
        {/* Contacts stay opaque when dimmed so the faded trace never shows through. */}
        {pins.map((y, i) => (
          <g key={`jt${i}`} className={cx('fade')} style={dl(880 + i * 35)}>
            <circle cx={j1.x} cy={y} r={2.2} className={cx('term', state(i))} />
            <circle cx={j1R} cy={y} r={2.2} className={cx('term', state(i))} />
          </g>
        ))}
      </g>

      {/* ---------- X1 · socket + lazy-chunk path ---------- */}
      <g className={cx('sock')}>
        <path
          d={`M${sock.x + 8} ${sock.y}H${sock.x + sock.w}V${sock.y + sock.h}H${sock.x}V${sock.y + 8}Z`}
          pathLength={1}
          className={cx('ln soft d')}
          style={dl(340)}
        />
        {pins.map((y, i) => (
          <circle key={`rc${i}`} cx={sock.recX} cy={y} r={2.6} className={cx('rec fade', state(i))} style={dl(800)} />
        ))}
        <g className={cx('fade')} style={dl(880)}>
          {sock.label === 'top' ? (
            <>
              <text x={sock.x} y={sock.y - 7} className={cx('k ref ink')}>
                X1
              </text>
              <text x={sock.x + 20} y={sock.y - 7} className={cx('k ink')}>
                {'<mesh:counter />'}
              </text>
            </>
          ) : (
            <>
              <text x={sock.x} y={sock.y - 7} className={cx('k ref ink')}>
                X1
              </text>
              <text x={sock.x + sock.w} y={sock.y + sock.h + 14} className={cx('k ink end')}>
                {'<mesh:counter />'}
              </text>
            </>
          )}
        </g>
      </g>

      <g className={cx('lazy')}>
        <path d={`M${L.lazy.x} ${L.lazy.y0}V${L.lazy.y1 - 5}`} className={cx('ln blue fade')} style={dl(420)} />
        <path d={`M${L.lazy.x} ${L.lazy.y1}l-2.6 -5h5.2z`} className={cx('blue-head fade')} style={dl(420)} />
        <g className={cx('fade')} style={dl(980)}>
          <text x={L.lazy.noteX} y={L.lazy.noteY} className={cx('k xs caps dim', L.lazy.anchor === 'end' && 'end')}>
            Lazy chunk · first use
          </text>
          <text x={L.lazy.noteX} y={L.lazy.noteY + 12} className={cx('k blue-k', L.lazy.anchor === 'end' && 'end')}>
            {`Counter/index.${framework.ext}`}
          </text>
          {L.lazy.leaderY ? (
            <>
              <path
                d={`M${L.lazy.noteX + 20 * fs.k * 0.66 + 6} ${L.lazy.leaderY}H${L.lazy.x - 2}`}
                className={cx('ln fine')}
              />
              <circle cx={L.lazy.x} cy={L.lazy.leaderY} r={1.6} className={cx('blue-head')} />
            </>
          ) : null}
        </g>
        {swapKey === 0 || fetched ? (
          <rect
            key={`pk${swapKey}`}
            x={L.lazy.x - 2.5}
            y={L.lazy.y0}
            width={5}
            height={5}
            className={cx('packet', swapKey === 0 && 'packet--first')}
            style={{ '--dy': `${L.lazy.y1 - L.lazy.y0 - 5}px` } as Vars}
          />
        ) : null}
      </g>

      {/* ---------- U2 · the island, seated in X1 ---------- */}
      <g key={`chip-${fw}-${swapKey}`} className={cx('chip seat')} style={{ '--seat': `${seatDelay}ms` } as Vars}>
        {pins.map((y, i) => (
          <g key={`lg${i}`}>
            <path d={`M${sock.recX + 2.6} ${y}H${chip.x}`} className={cx('ln leg', state(i))} />
            <circle cx={sock.recX} cy={y} r={1.25} className={cx('pin-dot', state(i))} />
          </g>
        ))}
        <path
          d={`M${chip.x} ${chip.y}H${chip.x + chip.w / 2 - 5}a5 5 0 0 0 10 0H${chip.x + chip.w}V${chip.y + chip.h}H${chip.x}Z`}
          className={cx('ln chip-body')}
        />
        <circle cx={chip.x + 7} cy={chip.y + 8} r={1.7} className={cx('fill-ink')} />
        {pins.map((y, i) => (
          <text key={`cn${i}`} x={chip.nameX} y={tY(y)} className={cx('k ink2 pin-name', state(i))}>
            {PINS[i].isl}
          </text>
        ))}
        {chip.mark.inline ? (
          <>
            <path d={`M${chip.x} ${pins[5] + 14}H${chip.x + chip.w}`} className={cx('ln faint')} />
            <Glyph
              fw={fw}
              x={chip.mark.cx - 20 * chip.mark.s}
              y={chip.mark.cy - 20 * chip.mark.s}
              s={chip.mark.s}
              className={cx('glyph')}
            />
            <text x={chip.mark.cx + 16} y={chip.mark.labelY} className={cx('k caps ink strong')}>
              {framework.label}
            </text>
          </>
        ) : (
          <>
            <Glyph fw={fw} x={chip.mark.cx - 20} y={chip.mark.cy - 20} s={chip.mark.s} className={cx('glyph')} />
            <text x={chip.mark.cx} y={chip.mark.labelY} className={cx('k caps ink strong mid')}>
              {framework.label}
            </text>
            <text x={chip.mark.cx} y={chip.mark.labelY + 12} className={cx('k xs dim mid')}>
              {`.${framework.ext}`}
            </text>
            <text x={chip.x + chip.w - 7} y={chip.y + chip.h - 8} className={cx('k xs caps dim end')}>
              U2
            </text>
          </>
        )}
      </g>

      {/* ---------- SW1 · renderer selector ---------- */}
      <g className={cx('sw')}>
        {throws.map((t, k) => (
          <g key={t.f.id} className={cx('fade throw', k === fwIndex && 'is-sel', hoverFw === t.f.id && 'is-hover')} style={dl(300 + k * 40)}>
            <circle cx={t.x} cy={t.y} r={2.6} className={cx('contact')} />
            <text x={t.x - sw.labelGap} y={tY(t.y)} className={cx('k caps end throw-label')}>
              {t.f.label}
            </text>
          </g>
        ))}
        <g className={cx('fade')} style={dl(380)}>
          <path
            d={`M${sw.px} ${sw.py}H${sw.px - sw.r + 4}`}
            className={cx('ln blade')}
            style={{
              transform: `rotate(${bladeAngle}deg)`,
              transformOrigin: `${sw.px}px ${sw.py}px`,
            }}
          />
          <circle cx={sw.px} cy={sw.py} r={3} className={cx('pivot')} />
          <text x={sw.ref.x} y={sw.ref.y} className={cx('k ref ink', sw.ref.anchor === 'middle' && 'mid')}>
            SW1
          </text>
        </g>
      </g>

      {/* ---------- Pin table ---------- */}
      <g className={cx('legend fade')} style={dl(1150)}>
        {(() => {
          const { x, y, w, row, cols } = L.legend;
          const top = y + 21;
          return (
            <>
              <path d={`M${x} ${y + 4}H${x + w}`} className={cx('ln')} />
              <text x={cols[0]} y={y + 15} className={cx('k xs caps dim')}>
                Pin
              </text>
              <text x={cols[1]} y={y + 15} className={cx('k xs caps dim')}>
                Signal
              </text>
              <text x={cols[2]} y={y + 15} className={cx('k xs caps dim')}>
                Dir
              </text>
              <text x={cols[3]} y={y + 15} className={cx('k xs caps dim')}>
                Function
              </text>
              <path d={`M${x} ${top}H${x + w}`} className={cx('ln fine')} />
              {PINS.map((p, i) => {
                const ry = top + i * row;
                const mid = ry + row / 2;
                return (
                  <g
                    key={p.sig}
                    className={cx('lrow', state(i))}
                    onPointerEnter={onRowHover ? (e) => e.pointerType === 'mouse' && onRowHover(i) : undefined}
                    onPointerLeave={onRowHover ? () => onRowHover(null) : undefined}
                  >
                    <rect x={x} y={ry + 0.5} width={w} height={row - 1} className={cx('lrow-bg')} />
                    <circle cx={cols[0] + 7} cy={mid} r={6} className={cx('balloon')} />
                    <text x={cols[0] + 7} y={tY(mid, fs.xs)} className={cx('k xs mid balloon-k')}>
                      {p.n}
                    </text>
                    <text x={cols[1]} y={tY(mid)} className={cx('k caps ink sig')}>
                      {p.sig}
                    </text>
                    <Arrow x={cols[2]} y={mid} len={12} dir={p.dir} />
                    <text x={cols[3]} y={tY(mid)} className={cx('k ink2 fn')}>
                      {p.fn}
                    </text>
                    {i < PINS.length - 1 ? (
                      <path d={`M${x} ${ry + row}H${x + w}`} className={cx('ln faint')} />
                    ) : null}
                  </g>
                );
              })}
              <path d={`M${x} ${top + row * 6}H${x + w}`} className={cx('ln')} />
            </>
          );
        })()}
      </g>

      {/* ---------- Title block ---------- */}
      <g className={cx('tblock fade')} style={dl(1200)}>
        {L.tblock.strip ? (
          (() => {
            const { x, y, w, h } = L.tblock;
            const c1 = x + w * 0.5;
            const c2 = x + w * 0.75;
            return (
              <>
                <path d={rect(x, y, w, h)} className={cx('ln')} />
                <path d={`M${c1} ${y}V${y + h}M${c2} ${y}V${y + h}`} className={cx('ln')} />
                <text x={x + 8} y={y + 18} className={cx('t title')}>
                  Mesh
                </text>
                <text x={x + 8} y={y + 31} className={cx('k xs caps dim')}>
                  Island interface
                </text>
                <rect x={c1 - 12} y={y + 5} width={7} height={7} className={cx('fill-acc')} />
                <text x={c1 + 7} y={y + 15} className={cx('k xs caps dim')}>
                  Dwg
                </text>
                <text x={c1 + 7} y={y + 29} className={cx('k ink')}>
                  SCH-01
                </text>
                <text x={c2 + 7} y={y + 15} className={cx('k xs caps dim')}>
                  Rev
                </text>
                <text x={c2 + 7} y={y + 29} className={cx('k ink')}>
                  {version}
                </text>
              </>
            );
          })()
        ) : (
          (() => {
            const { x, y, w, h } = L.tblock;
            const r1 = y + 34;
            const r2 = r1 + (h - 34) / 2;
            const rowH = (h - 34) / 2;
            const c = x + w / 2;
            const cell = (cx0: number, cy0: number, k: string, v: string) => (
              <>
                <text x={cx0 + 7} y={cy0 + rowH * 0.4} className={cx('k xs caps dim')}>
                  {k}
                </text>
                <text x={cx0 + 7} y={cy0 + rowH * 0.82} className={cx('k ink')}>
                  {v}
                </text>
              </>
            );
            return (
              <>
                <path d={rect(x, y, w, h)} className={cx('ln')} />
                <path d={`M${x} ${r1}H${x + w}M${x} ${r2}H${x + w}M${c} ${r1}V${y + h}`} className={cx('ln')} />
                <text x={x + 8} y={y + 19} className={cx('t title')}>
                  Mesh
                </text>
                <text x={x + 8} y={y + 29} className={cx('k xs caps dim')}>
                  Island interface · sheet 1/1
                </text>
                <rect x={x + w - 13} y={y + 6} width={7} height={7} className={cx('fill-acc')} />
                {cell(x, r1, 'Dwg', 'SCH-01')}
                {cell(c, r1, 'Scale', 'NTS')}
                {cell(x, r2, 'Stack', 'Livewire 4')}
                {cell(c, r2, 'Rev', version)}
              </>
            );
          })()
        )}
      </g>
    </svg>
  );
}
