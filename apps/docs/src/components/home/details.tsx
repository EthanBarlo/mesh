import type { ReactNode } from 'react';
import { demoUrl } from '@/lib/shared';
import { ExtIcon } from './icons';

/* Small line drawings, 240 × 120, in the portfolio's "Also on Tara" voice. */

function TableDwg() {
  return (
    <>
      <rect className="ln ln--fine" x="16" y="8" width="96" height="15" />
      <circle className="ln ln--fine" cx="25" cy="15.5" r="3.2" />
      <path className="ln ln--fine" d="M27.4 17.9 30 20.5M36 15.5H74" />
      <rect className="ln ln--fine" x="120" y="8" width="44" height="15" />
      <path className="ln ln--fine" d="M153 14l3 3 3-3" />
      <rect className="ln" x="16" y="30" width="208" height="80" />
      <rect className="fill fill-paper-2" x="16.5" y="30.5" width="207" height="15" />
      <path className="ln" d="M16 46H224" />
      <path className="ln ln--fine" d="M16 62H224M16 78H224M16 94H224M58 30V110M140 30V110M202 30V110" />
      <text className="svg-k" x="23" y="41">
        NO.
      </text>
      <text className="svg-k" x="65" y="41">
        CUSTOMER
      </text>
      <text className="svg-k svg-k--accent" x="147" y="41">
        TOTAL
      </text>
      <path className="ln ln--accent" d="M190 34.5V41.5M187 38.5l3 3 3-3" />
      <path className="ln ln--fine" d="M24 54H44M24 70H40M24 86H46M24 102H38M66 54H124M66 70H110M66 86H128M66 102H102" />
      <path className="ln ln--fine" d="M166 54H192M172 70H192M164 86H192M174 102H192" />
      <rect className="ln ln--accent" x="207" y="81" width="12" height="10" />
      <path className="ln ln--accent" d="M210 88V84h6l-1.5 1.5L216 87h-6" />
    </>
  );
}

function ChartDwg() {
  return (
    <>
      <path className="ln ln--dash" d="M26 34H222M26 56H222M26 78H222" />
      <path className="ln" d="M26 10V100H224" />
      <path className="ln ln--fine" d="M22 34H26M22 56H26M22 78H26" />
      <path
        className="ln ln--fine"
        d="M40 100V84H50V100M66 100V76H76V100M92 100V80H102V100M118 100V66H128V100M144 100V70H154V100M170 100V58H180V100M196 100V50H206V100"
      />
      <path className="ln ln--accent" d="M45 74C60 70 64 64 71 66S90 72 97 68 114 52 123 54 140 60 149 56 166 44 175 42 192 34 201 30" />
      <path className="ln ln--dash" d="M149 14V100" />
      <circle className="fill fill-accent" cx="149" cy="56" r="3" />
      <rect className="ln fill fill-paper" x="156" y="12" width="56" height="24" />
      <text className="svg-k" x="162" y="22">
        90D
      </text>
      <text className="svg-k svg-k--accent" x="162" y="32">
        +12.4%
      </text>
    </>
  );
}

function BoardDwg() {
  return (
    <>
      {[16, 92, 168].map((x) => (
        <g key={x}>
          <rect className="ln" x={x} y="10" width="56" height="100" />
          <path className="ln ln--fine" d={`M${x} 24H${x + 56}M${x + 7} 17H${x + 30}`} />
        </g>
      ))}
      <rect className="ln" x="22" y="30" width="44" height="16" />
      <rect className="ln" x="22" y="52" width="44" height="16" />
      <rect className="ln" x="22" y="74" width="44" height="16" />
      <rect className="ln ln--dash" x="98" y="30" width="44" height="16" />
      <rect className="ln" x="98" y="52" width="44" height="16" />
      <rect className="ln" x="174" y="30" width="44" height="16" />
      <rect className="ln ln--fine" x="174" y="74" width="44" height="16" />
      <g transform="rotate(-6 150 72)">
        <rect className="ln ln--accent fill fill-paper" x="134" y="64" width="44" height="16" />
        <path className="ln ln--fine" d="M140 72H164" />
      </g>
      <path className="ln ln--accent" d="M142 38C160 38 176 52 184 66" />
      <path className="ln ln--accent" d="M178.5 63.5l5.5 2.5 0.5-6" />
      <path className="ln ln--fine" d="M28 38H52M28 60H48M28 82H56M104 60H128M180 38H204" />
    </>
  );
}

function KanbanDwg() {
  const island = (x: number, y: number) => (
    <path key={`${x}-${y}`} className="ln" d={`M${x} ${y - 3.5}l3.5 3.5-3.5 3.5-3.5-3.5Z`} />
  );
  return (
    <>
      <rect className="ln ln--dash" x="8" y="12" width="224" height="98" />
      <rect className="fill fill-paper" x="16" y="7" width="98" height="10" />
      <text className="svg-k" x="20" y="15">
        LIVEWIRE BOARD
      </text>
      {[20, 92, 164].map((x) => (
        <g key={x}>
          <rect className="ln" x={x} y="24" width="56" height="12" />
          <path className="ln ln--fine" d={`M${x + 16} 30H${x + 40}`} />
        </g>
      ))}
      {[
        [20, 42],
        [20, 62],
        [20, 82],
        [92, 42],
        [164, 42],
        [164, 62],
      ].map(([x, y]) => (
        <g key={`${x}-${y}`}>
          <rect className="ln" x={x} y={y} width="56" height="14" />
          <path className="ln ln--fine" d={`M${x + 16} ${y + 7}H${x + 44}`} />
        </g>
      ))}
      {[
        [28, 30],
        [100, 30],
        [172, 30],
        [28, 49],
        [28, 69],
        [28, 89],
        [100, 49],
        [172, 49],
        [172, 69],
      ].map(([x, y]) => island(x, y))}
      <rect className="ln ln--accent" x="92" y="62" width="56" height="14" />
      <path className="ln ln--fine" d="M108 69H136" />
      <path className="ln ln--accent" d="M100 65.5l3.5 3.5-3.5 3.5-3.5-3.5Z" />
      <text className="svg-k svg-k--dim" x="92" y="101">
        ◇ = ISLAND
      </text>
    </>
  );
}

function FormDwg() {
  return (
    <>
      <rect className="ln" x="12" y="8" width="124" height="104" />
      <path className="ln ln--fine" d="M22 20H52M22 48H44" />
      <rect className="ln ln--fine" x="22" y="25" width="104" height="13" />
      <rect className="ln" x="22" y="53" width="104" height="13" />
      <path className="ln ln--accent" d="M22 66.5H126" />
      <path className="ln ln--accent" d="M22 73H82" />
      <path className="ln ln--accent" d="M115 56.5 120 64.5H110Z" />
      <rect className="fill fill-ink" x="22" y="88" width="40" height="14" />
      <text className="svg-k fill-paper-text" x="30" y="98">
        SAVE
      </text>
      <rect className="ln" x="184" y="30" width="44" height="66" />
      <text className="svg-k" x="190" y="44">
        RULES
      </text>
      <path className="ln ln--fine" d="M190 56H222M190 66H216M190 76H220" />
      <path className="ln" d="M136 50H184M178 47l6 3-6 3" />
      <path className="ln ln--accent ln--dash-accent" d="M184 78H136" />
      <path className="ln ln--accent" d="M142 75l-6 3 6 3" />
      <text className="svg-k svg-k--accent" x="140" y="92">
        ERRORS
      </text>
    </>
  );
}

function UploadDwg() {
  return (
    <>
      <rect className="ln ln--dash" x="12" y="10" width="104" height="100" />
      <path className="ln" d="M52 34h16l8 8v28H52Z M68 34v8h8" />
      <path className="ln ln--accent" d="M64 92V60M58 66l6-6 6 6" />
      <path className="ln" d="M116 60H136" />
      <rect className="ln" x="136" y="28" width="92" height="64" />
      <path className="ln ln--fine" d="M146 40H190" />
      <rect className="ln" x="146" y="50" width="72" height="8" />
      <rect className="fill fill-accent" x="146.5" y="50.5" width="44" height="7" />
      <text className="svg-k" x="146" y="72">
        62%
      </text>
      <text className="svg-k svg-k--dim" x="146" y="84">
        TMP UPLOAD
      </text>
    </>
  );
}

const DETAILS: Array<{
  key: string;
  dwg: () => ReactNode;
  title: string;
  lib: string;
  body: string;
  path: string;
}> = [
  {
    key: 'A',
    dwg: TableDwg,
    title: 'Data table',
    lib: 'TanStack Table',
    body: '250 orders built in PHP and passed as props. Sorting, filtering and paging run in the browser; the row action is a $call.',
    path: '/table',
  },
  {
    key: 'B',
    dwg: ChartDwg,
    title: 'Live charts',
    lib: 'ECharts',
    body: 'Change the range and the chart animates to the new series. Props update in place, so the chart survives every request.',
    path: '/charts',
  },
  {
    key: 'C',
    dwg: BoardDwg,
    title: 'Drag-and-drop board',
    lib: 'dnd-kit',
    body: 'Drag physics and keyboard support in one island. The board is entangled state, and the server confirms each move.',
    path: '/board',
  },
  {
    key: 'D',
    dwg: KanbanDwg,
    title: 'Blade-composed kanban',
    lib: 'Livewire + islands',
    body: 'A plain Livewire component owns the board. Each column and card is its own island, laid out with Blade loops.',
    path: '/kanban',
  },
  {
    key: 'E',
    dwg: FormDwg,
    title: 'Forms and validation',
    lib: 'Laravel rules',
    body: 'The rules stay in PHP. useErrorBag() brings the messages into the island: one field validates live, the rest on submit.',
    path: '/forms',
  },
  {
    key: 'F',
    dwg: UploadDwg,
    title: 'File uploads',
    lib: 'wire.$upload()',
    body: 'A hand-rolled dropzone streams to Livewire’s temporary uploads, with progress and server-side validation.',
    path: '/uploads',
  },
];

/** Sheet 05 — six details, each a drawing plus a link to the live demo page. */
export function Details() {
  const host = demoUrl.replace(/^https?:\/\//, '');
  return (
    <ul className="details__grid">
      {DETAILS.map((d) => (
        <li key={d.key} className="detail">
          <svg className="detail__svg" viewBox="0 0 240 120" data-draw="" data-autodraw="" aria-hidden="true" focusable="false">
            {d.dwg()}
          </svg>
          <p className="detail__k">
            Detail {d.key}
            <span className="detail__lib">{d.lib}</span>
          </p>
          <h3 className="detail__title">{d.title}</h3>
          <p className="detail__body">{d.body}</p>
          <a
            className="link link--mono detail__link"
            href={`${demoUrl}${d.path}`}
            target="_blank"
            rel="noreferrer"
            aria-label={`${d.title}: live demo at ${host}${d.path}`}
          >
            Live demo {d.path}
            <ExtIcon className="link__ext" />
          </a>
        </li>
      ))}
    </ul>
  );
}
