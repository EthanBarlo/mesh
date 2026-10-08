'use client';

import { type CSSProperties, type ReactNode, useCallback, useId, useRef, useState } from 'react';
import { cn } from '@/lib/cn';
import { hasFinePointer, prefersReducedMotion } from './motion';
import { type FrameworkId, frameworkIds, frameworkNames, useFramework } from './use-framework';

/* ==========================================================================
   Fig. 2 — one component, two halves, one tag
   ========================================================================== */

type Part = 'name' | 'base' | 'state' | 'props' | 'renderer';

const ext: Record<FrameworkId, string> = { react: 'tsx', vue: 'vue', svelte: 'svelte' };

const PARTS: Array<{ id: Part; label: string; title: string; body: ReactNode }> = [
  {
    id: 'name',
    label: 'Name',
    title: 'One name, both halves',
    body: (
      <>
        <code>App\Mesh\Counter</code> and <code>resources/js/mesh/Counter/</code> both reduce to the id{' '}
        <code>Counter</code>. The tag is the same name in kebab-case: <code>&lt;mesh:counter /&gt;</code>.
      </>
    ),
  },
  {
    id: 'base',
    label: 'Base',
    title: 'A fixed base on each side',
    body: (
      <>
        PHP classes live under <code>App\Mesh</code>, frontend entries under <code>resources/js/mesh</code>. The{' '}
        <code>mesh:</code> prefix routes the tag there. Neither path is configurable, by design.
      </>
    ),
  },
  {
    id: 'state',
    label: 'State',
    title: 'Two-way state',
    body: (
      <>
        <code>useEntangle(&quot;count&quot;)</code> binds the island to <code>$count</code>. Because the property is{' '}
        <code>#[Modelable]</code>, the parent view can bind it too, with <code>wire:model</code>.
      </>
    ),
  },
  {
    id: 'props',
    label: 'Props',
    title: 'Props from the server',
    body: (
      <>
        <code>props()</code> runs on every Livewire render and arrives as ordinary component props. They are a
        read-only snapshot; edit state through entangle or <code>$wire</code>.
      </>
    ),
  },
  {
    id: 'renderer',
    label: 'Renderer',
    title: 'The extension picks the renderer',
    body: (
      <>
        <code>.tsx</code> or <code>.jsx</code> mounts with React, <code>.vue</code> with Vue, <code>.svelte</code> with
        Svelte. Import the hooks from the matching <code>@mesh/react</code>, <code>@mesh/vue</code> or{' '}
        <code>@mesh/svelte</code>.
      </>
    ),
  },
];

const IDLE = {
  k: 'Inspect',
  title: 'Hover, focus or tap a part',
  body: (
    <>
      Each part is marked in all three places it appears: the tag, the PHP class and the frontend entry. The
      switch swaps the frontend between React, Vue and Svelte; the PHP class never changes.
    </>
  ),
};

function partFrom(target: EventTarget | null, root: HTMLElement | null): Part | null {
  const el = (target as Element | null)?.closest?.('[data-part]');
  if (!el || !root?.contains(el)) return null;
  return el.getAttribute('data-part') as Part;
}

function FrameworkSwitch({
  value,
  onChange,
  label,
}: {
  value: FrameworkId;
  onChange: (fw: FrameworkId) => void;
  label: string;
}) {
  const name = useId();
  const index = frameworkIds.indexOf(value);
  return (
    <fieldset className="seg">
      <legend className="vh">{label}</legend>
      <div className="seg__track" style={{ '--i': index } as CSSProperties}>
        {frameworkIds.map((fw) => (
          <label key={fw} className="seg__opt">
            <input
              type="radio"
              name={name}
              value={fw}
              checked={value === fw}
              onChange={() => onChange(fw)}
            />
            <span>{frameworkNames[fw]}</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}

function Path({ parts }: { parts: Array<[string, Part | null]> }) {
  return (
    <code className="panel__path">
      {parts.map(([text, part], i) =>
        part ? (
          <span key={i} className="code__part" data-part={part}>
            {text}
          </span>
        ) : (
          <span key={i}>{text}</span>
        ),
      )}
    </code>
  );
}

function ComponentFigure({
  php,
  blade,
  front,
  fw,
  setFw,
}: {
  php: ReactNode;
  blade: ReactNode;
  front: Record<FrameworkId, ReactNode>;
  fw: FrameworkId;
  setFw: (fw: FrameworkId) => void;
}) {
  const rootRef = useRef<HTMLElement>(null);
  const [hot, setHot] = useState<Part | null>(null);
  const [pinned, setPinned] = useState<Part | null>(null);
  const [enterKey, setEnterKey] = useState(0);
  const [switches, setSwitches] = useState(0);
  const shown = hot ?? pinned;
  const info = shown ? PARTS.find((p) => p.id === shown)! : null;

  const show = useCallback((p: Part | null) => {
    setHot((prev) => {
      if (prev !== p && !prefersReducedMotion()) setEnterKey((k) => k + 1);
      return p;
    });
  }, []);

  return (
    <figure
      ref={rootRef}
      className="anat"
      data-hot={shown ?? undefined}
      aria-labelledby="fig-anat-cap"
      onPointerOver={(e) => {
        if (!hasFinePointer()) return;
        const p = partFrom(e.target, rootRef.current);
        if (p && p !== hot) show(p);
      }}
      onPointerLeave={() => {
        if (hasFinePointer()) show(null);
      }}
    >
      <div className="anat__tag">
        <p className="anat__k">
          <span className="tag">B</span>
          Blade tag
          <span className="anat__k-sub">in any Livewire view</span>
        </p>
        <div className="anat__tagline code">{blade}</div>
      </div>

      <div className="anat__branch" aria-hidden="true">
        <span className="anat__stem" />
        <span className="anat__bar" />
        <span className="anat__drop anat__drop--l">
          <span>Server · PHP</span>
        </span>
        <span className="anat__drop anat__drop--r">
          <span>Browser · JS</span>
        </span>
        <span className="anat__id">
          <span className="anat__id-k">Id</span>
          <span className="code__part" data-part="name">
            Counter
          </span>
        </span>
      </div>

      <div className="anat__halves">
        <section className="panel" aria-label="PHP class">
          <header className="panel__head">
            <span className="tag">A</span>
            <span className="panel__kind">PHP class</span>
            <Path
              parts={[
                ['app/', null],
                ['Mesh', 'base'],
                ['/', null],
                ['Counter', 'name'],
                ['.php', null],
              ]}
            />
          </header>
          <div className="panel__body code">{php}</div>
        </section>

        <section className="panel" aria-label={`Frontend entry, ${frameworkNames[fw]}`}>
          <header className="panel__head panel__head--wrap">
            <span className="tag">C</span>
            <span className="panel__kind">Frontend entry</span>
            <FrameworkSwitch
              value={fw}
              onChange={(next) => {
                setSwitches((n) => n + 1);
                setFw(next);
              }}
              label="Frontend framework"
            />
            <Path
              parts={[
                ['resources/js/mesh', 'base'],
                ['/', null],
                ['Counter', 'name'],
                ['/index', null],
                [`.${ext[fw]}`, 'renderer'],
              ]}
            />
          </header>
          <div className="panel__body code" key={fw} data-enter={switches > 0 ? '' : undefined}>
            {front[fw]}
          </div>
        </section>
      </div>

      <div className="anat__side">
        <div className="parts" role="group" aria-label="Parts of a Mesh component">
          {PARTS.map((p, i) => (
            <button
              key={p.id}
              type="button"
              className={cn('parts__btn', shown === p.id && 'is-hot')}
              data-part={p.id}
              aria-pressed={pinned === p.id}
              onFocus={() => show(p.id)}
              onBlur={() => show(null)}
              onClick={() => {
                setPinned((cur) => (cur === p.id ? null : p.id));
                show(p.id);
              }}
            >
              <span className="balloon">{i + 1}</span>
              {p.label}
            </button>
          ))}
        </div>
        <div className="inspector" aria-live="polite">
          <div key={enterKey} className={enterKey ? 'inspector__in is-enter' : 'inspector__in'}>
            <p className="inspector__k">
              {info ? `Part ${PARTS.indexOf(info) + 1} / ${PARTS.length} · ${info.label}` : IDLE.k}
            </p>
            <p className="inspector__title">{info ? info.title : IDLE.title}</p>
            <p className="inspector__body">{info ? info.body : IDLE.body}</p>
          </div>
        </div>
      </div>

      <figcaption className="fig-cap k" id="fig-anat-cap">
        <span className="fig-cap__n">Fig. 2 ·</span> One component, two halves, one tag. Hover, focus or tap a
        part to find it in every file.
      </figcaption>
    </figure>
  );
}

/* ==========================================================================
   Fig. 3 — how the id is derived (nested example)
   ========================================================================== */

type Col = 'base' | 'folder' | 'name' | 'entry';

const COLS: Array<{ id: Col; label: string }> = [
  { id: 'base', label: 'Base' },
  { id: 'folder', label: 'Folder' },
  { id: 'name', label: 'Name' },
  { id: 'entry', label: 'Entry' },
];

type Row = { label: string; base: string; folder: string; sep: string; name: string; tail: string; rule: ReactNode };

function rows(fw: FrameworkId): Row[] {
  return [
    {
      label: 'PHP class',
      base: 'App\\Mesh\\',
      folder: 'Forms',
      sep: '\\',
      name: 'Input',
      tail: '',
      rule: (
        <>
          Strip <code>App\Mesh\</code>, then <code>\</code> becomes <code>/</code>
        </>
      ),
    },
    {
      label: 'Frontend entry',
      base: 'resources/js/mesh/',
      folder: 'Forms',
      sep: '/',
      name: 'Input',
      tail: `/index.${ext[fw]}`,
      rule: (
        <>
          Strip the base, the extension and <code>/index</code>
        </>
      ),
    },
    {
      label: 'Blade tag',
      base: '<mesh:',
      folder: 'forms',
      sep: '.',
      name: 'input',
      tail: ' />',
      rule: <>Kebab-case; folders become dots</>,
    },
    {
      label: 'Id',
      base: '',
      folder: 'Forms',
      sep: '/',
      name: 'Input',
      tail: '',
      rule: <>The registry key. Case-sensitive on Linux.</>,
    },
  ];
}

function DerivationFigure({ fw }: { fw: FrameworkId }) {
  const [hot, setHot] = useState<Col | null>(null);
  const [pinned, setPinned] = useState<Col | null>(null);
  const shown = hot ?? pinned;
  const data = rows(fw);

  const cell = (col: Col | 'sep', text: string) => (
    <span className={cn('derive__c', `derive__c--${col}`)} data-col={col === 'sep' ? undefined : col}>
      {text}
    </span>
  );

  return (
    <figure className="derive" data-hot={shown ?? undefined} aria-labelledby="fig-derive-cap">
      <div className="derive__keys" role="group" aria-label="Highlight a column">
        {COLS.map((c, i) => (
          <button
            key={c.id}
            type="button"
            className={cn('parts__btn', shown === c.id && 'is-hot')}
            aria-pressed={pinned === c.id}
            onPointerEnter={() => hasFinePointer() && setHot(c.id)}
            onPointerLeave={() => hasFinePointer() && setHot(null)}
            onFocus={() => setHot(c.id)}
            onBlur={() => setHot(null)}
            onClick={() => setPinned((cur) => (cur === c.id ? null : c.id))}
          >
            <span className="balloon">{i + 1}</span>
            {c.label}
            {c.id === 'base' || c.id === 'entry' ? <span className="parts__hint">stripped</span> : null}
          </button>
        ))}
      </div>

      <div className="derive__grid">
        <div className="derive__row derive__row--head" aria-hidden="true">
          <span className="derive__label">Source</span>
          <span className="derive__str">
            {COLS.map((c, i) => (
              <span key={c.id} className="derive__keycell">
                {c.id === 'name' ? <span className="derive__c derive__c--sep" /> : null}
                <span className={cn('derive__c', `derive__c--${c.id}`, 'derive__c--key')} data-col={c.id}>
                  <span className="balloon">{i + 1}</span>
                </span>
              </span>
            ))}
          </span>
          <span className="derive__rule">Rule</span>
        </div>
        {data.map((r) => (
          <div key={r.label} className={cn('derive__row', r.label === 'Id' && 'derive__row--id')}>
            <span className="derive__label">{r.label}</span>
            <code className="derive__str">
              {cell('base', r.base)}
              {cell('folder', r.folder)}
              {cell('sep', r.sep)}
              {cell('name', r.name)}
              {cell('entry', r.tail)}
            </code>
            <span className="derive__rule">{r.rule}</span>
          </div>
        ))}
      </div>
      <figcaption className="fig-cap k" id="fig-derive-cap">
        <span className="fig-cap__n">Fig. 3 ·</span> How the id is derived, for a nested component. Base and entry
        are stripped; folder and name must match exactly on both sides.
      </figcaption>
    </figure>
  );
}

/** Sheet 02's two figures, sharing one framework choice (and the docs' one). */
export function AnatomyFigures(props: {
  php: ReactNode;
  blade: ReactNode;
  front: Record<FrameworkId, ReactNode>;
}) {
  const [fw, setFw] = useFramework();
  return (
    <>
      <ComponentFigure {...props} fw={fw} setFw={setFw} />
      <DerivationFigure fw={fw} />
    </>
  );
}
