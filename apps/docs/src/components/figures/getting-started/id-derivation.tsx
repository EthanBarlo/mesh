import { Fragment } from 'react';
import { cn } from '@/lib/cn';
import s from './figures.module.css';
import {
  Arrow,
  BorderLabel,
  Responsive,
  monoWidth,
} from './primitives';

const LABEL =
  'How the component id is derived. The Blade tag <mesh:forms.input /> is ' +
  'resolved by Livewire through the mesh namespace to the class ' +
  'App\\Mesh\\Forms\\Input. PHP strips the App\\Mesh\\ prefix and turns ' +
  'backslashes into slashes, giving Forms/Input. The frontend entry ' +
  '/resources/js/mesh/Forms/Input/index.tsx keeps the path after ' +
  'resources/js/mesh/ and drops /index and the extension, also giving ' +
  'Forms/Input. The .tsx extension selects the React renderer.';

/** 12px IBM Plex Mono: one character is 7.2 units. */
const SIZE = 12;

type Segment = { text: string; kept?: boolean; gap?: boolean };

const TAG: Segment[] = [
  { text: '<mesh:' },
  { text: 'forms.input', kept: true },
  { text: '/>', gap: true },
];
const CLASS: Segment[] = [
  { text: 'App\\Mesh\\' },
  { text: 'Forms\\Input', kept: true },
];
const ENTRY: Segment[] = [
  { text: '/resources/js/mesh/' },
  { text: 'Forms/Input', kept: true },
  { text: '/index' },
  { text: '.tsx' },
];

const RESOLVE_NOTES = ['LIVEWIRE · mesh:: → App\\Mesh', 'dots → \\ · kebab → Studly'];

/** Lay segments out left to right from x, in 12px mono. */
function layout(segments: Segment[], x: number) {
  let cursor = x;
  return segments.map((seg) => {
    if (seg.gap) cursor += monoWidth(' ', SIZE);
    const start = cursor;
    cursor += monoWidth(seg.text, SIZE);
    return { ...seg, start, end: cursor };
  });
}

/**
 * A path string: kept segments in ink with a bracket beneath, dropped ones
 * dim and struck through. `strike` marks whether dropped parts are struck
 * (the tag's syntax is dim but not "removed").
 */
function PathString({
  segments,
  x,
  y,
  strike = true,
}: {
  segments: Segment[];
  x: number;
  y: number;
  strike?: boolean;
}) {
  const laid = layout(segments, x);
  return (
    <g>
      {laid.map((seg) => (
        <Fragment key={seg.text}>
          <text
            className={cn(s.str, !seg.kept && s.strDim)}
            x={seg.start}
            y={y}
          >
            {seg.text}
          </text>
          {!seg.kept && strike ? (
            <path
              className="ln ln--fine"
              d={`M${seg.start} ${y - 4}H${seg.end}`}
            />
          ) : null}
          {seg.kept && strike ? (
            <path
              className="ln"
              d={`M${seg.start} ${y + 6}V${y + 10}H${seg.end}V${y + 6}`}
            />
          ) : null}
        </Fragment>
      ))}
    </g>
  );
}

function RowLabel({ x, y, text }: { x: number; y: number; text: string }) {
  return (
    <text className={s.k} x={x} y={y}>
      {text}
    </text>
  );
}

function Note({
  x,
  y,
  text,
  anchor,
}: {
  x: number;
  y: number;
  text: string;
  anchor?: 'end';
}) {
  return (
    <text className={s.k} x={x} y={y} textAnchor={anchor}>
      {text}
    </text>
  );
}

function IdBox({ x, y, w }: { x: number; y: number; w: number }) {
  return (
    <g>
      <rect
        className={cn(s.box, s.boxAccent)}
        x={x}
        y={y}
        width={w}
        height={40}
      />
      <BorderLabel x={x + 8} y={y} text="ID" />
      <text
        className={s.idText}
        x={x + w / 2}
        y={y + 24.5}
        textAnchor="middle"
      >
        Forms/Input
      </text>
    </g>
  );
}

function Wide() {
  const x0 = 150;
  const entry = layout(ENTRY, x0);
  const ext = entry[3];
  const extMid = (ext.start + ext.end) / 2;

  return (
    <svg
      className={cn(s.svg, s.svgWide)}
      viewBox="0 0 640 264"
      role="img"
      aria-label={LABEL}
      data-draw=""
    >
      <RowLabel x={16} y={48} text="BLADE TAG" />
      <PathString segments={TAG} x={x0} y={48} strike={false} />

      {/* Livewire resolves the tag to a class */}
      <path className="ln ln--fine" d="M240 56V108" />
      <Arrow x={240} y={112} angle={90} className={s.arrowFine} />
      <Note x={252} y={80} text={RESOLVE_NOTES[0]} />
      <Note x={252} y={93} text={RESOLVE_NOTES[1]} />

      <RowLabel x={16} y={128} text="PHP CLASS" />
      <PathString segments={CLASS} x={x0} y={128} />
      <Note x={x0} y={152} text="strip App\Mesh\ · \ becomes /" />

      <RowLabel x={16} y={208} text="FRONTEND ENTRY" />
      <PathString segments={ENTRY} x={x0} y={208} />
      <Note x={x0} y={232} text="strip prefix, /index, extension" />

      {/* Both halves arrive at the same id */}
      <path className="ln" d="M300 124H456V204H444M456 166H473" />
      <circle className={s.dot} cx={456} cy={166} r={2.5} />
      <Arrow x={480} y={166} angle={0} />
      <IdBox x={480} y={146} w={144} />

      {/* The extension picks the renderer */}
      <path className="ln ln--fine" d={`M${extMid} 214V248H462`} />
      <Arrow x={468} y={248} angle={0} className={s.arrowFine} />
      <Note x={474} y={251.4} text="RENDERER · react" />
    </svg>
  );
}

function Narrow() {
  const x0 = 16;
  const entry = layout(ENTRY, x0);
  const ext = entry[3];
  const extMid = (ext.start + ext.end) / 2;

  return (
    <svg
      className={cn(s.svg, s.svgNarrow)}
      viewBox="0 0 340 336"
      role="img"
      aria-label={LABEL}
      data-draw=""
    >
      <RowLabel x={x0} y={22} text="BLADE TAG" />
      <PathString segments={TAG} x={x0} y={42} strike={false} />

      <path className="ln ln--fine" d="M100 50V108" />
      <Arrow x={100} y={112} angle={90} className={s.arrowFine} />
      <Note x={112} y={74} text={RESOLVE_NOTES[0]} />
      <Note x={112} y={87} text={RESOLVE_NOTES[1]} />

      <RowLabel x={x0} y={106} text="PHP CLASS" />
      <PathString segments={CLASS} x={x0} y={126} />
      <Note x={x0} y={150} text="strip App\Mesh\ · \ becomes /" />

      <RowLabel x={x0} y={180} text="FRONTEND ENTRY" />
      <PathString segments={ENTRY} x={x0} y={200} />
      <Note x={x0} y={226} text="strip prefix, /index, extension" />

      <path className="ln ln--fine" d={`M${extMid} 206V240`} />
      <Arrow x={extMid} y={246} angle={90} className={s.arrowFine} />
      <Note x={304} y={262} text="RENDERER · react" anchor="end" />

      <path className="ln" d="M166 122H326V306H251M310 196H326" />
      <circle className={s.dot} cx={326} cy={196} r={2.5} />
      <Arrow x={244} y={306} angle={180} />
      <IdBox x={96} y={286} w={148} />
    </svg>
  );
}

/**
 * Fig · How one id is derived on both sides: tag → class → id, and
 * entry path → id, with the extension choosing the renderer.
 */
export function IdDerivation() {
  return <Responsive wide={<Wide />} narrow={<Narrow />} />;
}
