'use client';

import { type MouseEvent, type ReactNode, useState } from 'react';
import { cn } from '@/lib/cn';
import { prefersReducedMotion } from './motion';
import { type FrameworkId, frameworkIds, frameworkNames } from './use-framework';

type Dir = 'down' | 'up' | 'both' | 'bus';

const DIRS: Record<Dir, string> = {
  down: 'Server → island',
  up: 'Island → server',
  both: 'Two-way',
  bus: 'Page-wide',
};

type Row = {
  name: string;
  api: string;
  dir: Dir;
  note: ReactNode;
  /** One snippet per framework; a string[] is one line each. */
  code: Record<FrameworkId, string[]>;
  /** Small annotation under the snippet, per framework. */
  hint?: Partial<Record<FrameworkId, string>>;
};

const same = (lines: string[]): Record<FrameworkId, string[]> => ({ react: lines, vue: lines, svelte: lines });

const ROWS: Row[] = [
  {
    name: 'Props',
    api: 'props()',
    dir: 'down',
    note: 'A JSON snapshot, re-read after every Livewire render. Never written back.',
    code: {
      react: ['function Counter({ label })'],
      vue: ['defineProps<{', '  label: string;', '}>()'],
      svelte: ['let { label } = $props()'],
    },
  },
  {
    name: 'Entangle',
    api: 'useEntangle(key, live?)',
    dir: 'both',
    note: (
      <>
        Deferred by default: changes ride along with the next request. Pass <code>true</code> to sync on every
        change.
      </>
    ),
    code: {
      react: ['const [count, setCount] =', '  useEntangle("count")'],
      vue: ['const count =', '  useEntangle("count")'],
      svelte: ['const count =', '  useEntangle("count")'],
    },
    hint: { react: 'value + setter', vue: 'writable ref', svelte: '{ value } box' },
  },
  {
    name: 'Call',
    api: '$call(method, ...args)',
    dir: 'up',
    note: 'Runs a public PHP method and resolves with its return value. Failed validation resolves with null.',
    code: same(['await wire.$call("save")']),
  },
  {
    name: 'Watch',
    api: '$watch(key, callback)',
    dir: 'down',
    note: 'Runs when a property changes on the server. Returns an unsubscribe function.',
    code: same(['wire.$watch("price", fn)']),
  },
  {
    name: 'Events',
    api: '$dispatch · $on',
    dir: 'bus',
    note: 'Livewire events. Any component on the page can listen, Mesh or not.',
    code: same(['wire.$dispatch("saved", { id })', 'wire.$on("saved", fn)']),
  },
  {
    name: 'Errors',
    api: 'useErrorBag()',
    dir: 'down',
    note: 'The validation messages from the last request, refreshed after each one.',
    code: {
      react: ['const errors = useErrorBag()'],
      vue: ['const errors = useErrorBag()'],
      svelte: ['const errors = useErrorBag()'],
    },
    hint: { react: 'errors.email', vue: 'errors.value.email', svelte: 'errors.value.email' },
  },
  {
    name: 'Uploads',
    api: '$upload(name, file, …)',
    dir: 'up',
    note: (
      <>
        Livewire&rsquo;s temporary uploads, with progress events. The class uses <code>WithFileUploads</code>.
      </>
    ),
    code: same(['wire.$upload("photo", file, …)']),
  },
];

function Linetype({ fw }: { fw: FrameworkId }) {
  return <span className={cn('lt', `lt--${fw}`)} aria-hidden="true" />;
}

function DirMark({ dir }: { dir: Dir }) {
  // Small drawn arrows: down (server → island), up, both ways, or a bus.
  const d = {
    down: 'M8 2v11M4 9.5 8 13.5l4-4',
    up: 'M8 14V3M4 6.5 8 2.5l4 4',
    both: 'M8 2.5v11M5 5.5 8 2.5l3 3M5 10.5l3 3 3-3',
    bus: 'M2 8h12M5 5 2 8l3 3M11 5l3 3-3 3',
  }[dir];
  return (
    <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true" focusable="false" className="bom__dirmark">
      <path d={d} fill="none" stroke="currentColor" strokeWidth="1.25" />
    </svg>
  );
}

/**
 * Sheet 04 — the bill of materials for state: every channel, its direction,
 * and the API in each framework. Layers switch frameworks on and off, CAD
 * style; shift-click isolates one.
 */
export function Channels() {
  const [on, setOn] = useState<Record<FrameworkId, boolean>>({ react: true, vue: true, svelte: true });
  const [entering, setEntering] = useState<FrameworkId | null>(null);
  const shown = frameworkIds.filter((fw) => on[fw]);

  function toggle(fw: FrameworkId, e: MouseEvent) {
    const next = { ...on };
    if (e.shiftKey || e.altKey) {
      const solo = frameworkIds.every((x) => on[x] === (x === fw));
      for (const x of frameworkIds) next[x] = solo ? true : x === fw;
    } else {
      next[fw] = !on[fw];
    }
    if (!on[fw] && next[fw] && !prefersReducedMotion()) setEntering(fw);
    else setEntering(null);
    setOn(next);
  }

  return (
    <div className="bom" data-cols={shown.length}>
      <div className="bom__bar">
        <div className="layers" role="group" aria-label="Show or hide frameworks">
          {frameworkIds.map((fw) => (
            <button
              key={fw}
              type="button"
              className="layer"
              aria-pressed={on[fw]}
              onClick={(e) => toggle(fw, e)}
            >
              <span className="layer__eye" aria-hidden="true" />
              <Linetype fw={fw} />
              <span className="layer__name">{frameworkNames[fw]}</span>
              <span className="layer__count">@mesh/{fw}</span>
            </button>
          ))}
        </div>
        <p className="bom__status k">
          <span aria-live="polite">
            {shown.length ? `Showing ${shown.length} of 3 renderers` : 'All layers off. Switch one back on.'}
          </span>
          <span className="bom__hint"> · Shift-click a layer to isolate it</span>
        </p>
      </div>

      <table className="bom__table">
        <caption className="vh">
          State channels between a Livewire component and its island, with the API in each framework.
        </caption>
        <thead>
          <tr>
            <th scope="col" className="bom__no">
              Item
            </th>
            <th scope="col" className="bom__ch">
              Channel · direction
            </th>
            {shown.map((fw) => (
              <th key={fw} scope="col" className={cn('bom__fw', entering === fw && 'is-entering')}>
                <span className="bom__fwh">
                  <Linetype fw={fw} />
                  {frameworkNames[fw]}
                </span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {ROWS.map((r, i) => (
            <tr key={r.name}>
              <td className="bom__no">{String(i + 1).padStart(2, '0')}</td>
              <th scope="row" className="bom__ch">
                <span className="bom__name">{r.name}</span>
                <code className="bom__api">{r.api}</code>
                <span className="bom__dirv">
                  <DirMark dir={r.dir} />
                  {DIRS[r.dir]}
                </span>
                <span className="bom__note">{r.note}</span>
              </th>
              {shown.map((fw) => (
                <td
                  key={fw}
                  className={cn('bom__fw', entering === fw && 'is-entering')}
                  data-fw={frameworkNames[fw]}
                >
                  <code className="bom__code">
                    {r.code[fw].map((line, j) => (
                      <span key={j} className="bom__line">
                        {line}
                      </span>
                    ))}
                  </code>
                  {r.hint?.[fw] ? <span className="bom__hintv">{r.hint[fw]}</span> : null}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
