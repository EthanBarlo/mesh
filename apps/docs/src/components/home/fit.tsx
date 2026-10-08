import Link from 'next/link';

type Mark = 'yes' | 'some' | 'no';

const COLS = ['Livewire + Alpine', 'Mesh island', 'Inertia / SPA', 'Hand-rolled mount'] as const;

const ROWS: Array<{ need: string; marks: [Mark, Mark, Mark, Mark] }> = [
  {
    need: 'One widget needs a JavaScript library: a chart, a data grid, drag and drop',
    marks: ['some', 'yes', 'yes', 'yes'],
  },
  {
    need: 'The page stays a Livewire page: Blade, routes, wire:model',
    marks: ['yes', 'yes', 'no', 'yes'],
  },
  {
    need: 'State lives on the server; the client mirrors it',
    marks: ['yes', 'yes', 'some', 'some'],
  },
  {
    need: 'No glue code per widget: mount, props, sync, teardown',
    marks: ['yes', 'yes', 'yes', 'no'],
  },
  {
    need: 'The whole interface is client-driven',
    marks: ['no', 'some', 'yes', 'some'],
  },
  {
    need: 'No JavaScript build step',
    marks: ['yes', 'no', 'no', 'no'],
  },
];

const LABEL: Record<Mark, string> = { yes: 'Fits', some: 'Possible, with work', no: 'Not a fit' };

function FitMark({ mark }: { mark: Mark }) {
  return (
    <span className={`fit__mark fit__mark--${mark}`}>
      <svg viewBox="0 0 14 14" width="14" height="14" aria-hidden="true" focusable="false">
        {mark === 'yes' ? <circle cx="7" cy="7" r="5" fill="currentColor" /> : null}
        {mark === 'some' ? <circle cx="7" cy="7" r="4.5" fill="none" stroke="currentColor" strokeWidth="1.25" /> : null}
        {mark === 'no' ? <path d="M3 7h8" stroke="currentColor" strokeWidth="1.25" /> : null}
      </svg>
      <span className="vh">{LABEL[mark]}</span>
    </span>
  );
}

/** Sheet 06 — a fit table: where an island earns its place, and where it doesn't. */
export function Fit() {
  return (
    <div className="fit">
      <table className="fit__table">
        <caption className="vh">
          How a Mesh island compares with Livewire and Alpine alone, an Inertia or single-page app, and mounting a
          framework by hand.
        </caption>
        <thead>
          <tr>
            <th scope="col" className="fit__need">
              Requirement
            </th>
            {COLS.map((c, i) => (
              <th key={c} scope="col" className={i === 1 ? 'fit__col is-mesh' : 'fit__col'}>
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {ROWS.map((r, i) => (
            <tr key={r.need}>
              <th scope="row" className="fit__need">
                <span className="fit__needin">
                  <span className="fit__no">{String(i + 1).padStart(2, '0')}</span>
                  <span>{r.need}</span>
                </span>
              </th>
              {r.marks.map((m, j) => (
                <td key={COLS[j]} className={j === 1 ? 'fit__cell is-mesh' : 'fit__cell'} data-col={COLS[j]}>
                  <FitMark mark={m} />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      <div className="fit__foot">
        <p className="fit__legend k">
          <span>
            <FitMark mark="yes" /> Fits
          </span>
          <span>
            <FitMark mark="some" /> Possible, with work
          </span>
          <span>
            <FitMark mark="no" /> Not a fit
          </span>
        </p>
        <aside className="revnote" aria-label="Revision note">
          <svg className="revnote__mark" viewBox="0 0 28 26" width="28" height="26" aria-hidden="true">
            <path d="M14 2 26 24H2Z" fill="none" stroke="currentColor" strokeWidth="1.25" />
            <text x="14" y="20" textAnchor="middle">
              1
            </text>
          </svg>
          <p>
            <strong>Revision note.</strong> Most interactions don&rsquo;t need an island. Keep forms, lists and toggles
            in Livewire and Alpine, and reach for Mesh when a component is genuinely easier to build in React, Vue or
            Svelte.{' '}
            <Link className="link" href="/docs/why">
              Why Mesh
            </Link>
          </p>
        </aside>
      </div>
    </div>
  );
}
