'use client';

import { type ComponentProps, useCallback, useEffect, useId, useRef, useState, useSyncExternalStore } from 'react';
import Link from 'next/link';
import { useSearchContext } from 'fumadocs-ui/contexts/search';
import { Brand } from '@/lib/layout.shared';
import { demoUrl, docsRoute, githubUrl } from '@/lib/shared';
import { ChevronDownIcon, ExtIcon, GitHubIcon, SearchIcon } from './icons';
import { pad2, sheetCount, sheets } from './sheets';
import { getActiveSheet, getServerActiveSheet, subscribeActiveSheet } from './sheet-spy';
import { ThemeToggle } from './theme-toggle';

function useActiveSheet() {
  return useSyncExternalStore(subscribeActiveSheet, getActiveSheet, getServerActiveSheet);
}

/** The ⌘K search chip, drawn as a stamped field rather than a pill. */
function SearchChip({ compact = false }: { compact?: boolean }) {
  const { enabled, hotKey, setOpenSearch } = useSearchContext();
  if (!enabled) return null;

  return (
    <button
      type="button"
      className={compact ? 'mh-search mh-search--icon' : 'mh-search'}
      onClick={() => setOpenSearch(true)}
      aria-label="Search the docs"
      data-search=""
    >
      <SearchIcon size={14} />
      {compact ? null : (
        <>
          <span className="mh-search__label">Search</span>
          <span className="mh-search__keys" aria-hidden="true">
            {hotKey.map((k, i) => (
              <kbd key={i}>{k.display}</kbd>
            ))}
          </span>
        </>
      )}
    </button>
  );
}

/** Mobile + tablet: the drawing register as a dropdown, like the portfolio's index. */
function SheetIndex({ active }: { active: number }) {
  const [open, setOpen] = useState(false);
  const panelId = useId();
  const btnRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const close = useCallback((restoreFocus: boolean) => {
    setOpen(false);
    if (restoreFocus) btnRef.current?.focus();
  }, []);

  useEffect(() => {
    if (!open) return;
    const panel = panelRef.current;
    const current =
      panel?.querySelector<HTMLAnchorElement>('[aria-current="true"]') ??
      panel?.querySelector<HTMLAnchorElement>('a');
    current?.focus();

    function onPointer(e: PointerEvent) {
      const t = e.target as Node;
      if (!panelRef.current?.contains(t) && !btnRef.current?.contains(t)) close(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        e.preventDefault();
        close(true);
      }
    }
    document.addEventListener('pointerdown', onPointer, true);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('pointerdown', onPointer, true);
      document.removeEventListener('keydown', onKey);
    };
  }, [open, close]);

  return (
    <div className="mh-index">
      <button
        ref={btnRef}
        type="button"
        className="mh-index__btn"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((v) => !v)}
      >
        <span className="mh-index__label">Index</span>
        <span className="mh-index__count" aria-hidden={active === 0}>
          {active ? `${pad2(active)}/${pad2(sheetCount)}` : `${pad2(sheetCount)} sheets`}
        </span>
        <ChevronDownIcon className="mh-index__chev" />
      </button>
      <div
        ref={panelRef}
        id={panelId}
        className="mh-index__panel"
        hidden={!open}
        onBlur={(e) => {
          const next = e.relatedTarget as Node | null;
          if (next && !panelRef.current?.contains(next) && next !== btnRef.current) close(false);
        }}
      >
        <p className="mh-index__k">Drawing register · MESH-000</p>
        <ol className="mh-index__list">
          {sheets.map((s) => (
            <li key={s.id}>
              <a
                href={`/#${s.id}`}
                aria-current={active === s.no ? 'true' : undefined}
                onClick={() => close(false)}
              >
                <span>{pad2(s.no)}</span>
                {s.title}
              </a>
            </li>
          ))}
        </ol>
        <p className="mh-index__k mh-index__k--sub">Also</p>
        <ul className="mh-index__list mh-index__list--links">
          <li>
            <Link href={docsRoute} onClick={() => close(false)}>
              <span>→</span>Documentation
            </Link>
          </li>
          <li>
            <a href={demoUrl} target="_blank" rel="noreferrer">
              <span>↗</span>Live demo
            </a>
          </li>
          <li>
            <a href={githubUrl} target="_blank" rel="noreferrer">
              <span>↗</span>GitHub
            </a>
          </li>
        </ul>
        <div className="mh-index__theme">
          <span className="mh-index__k mh-index__k--inline">Sheet colour</span>
          <ThemeToggle />
        </div>
      </div>
    </div>
  );
}

/**
 * Masthead for the home layout (Fumadocs `slots.header`): brand, the numbered
 * sheet nav with scroll-spy, and the site chrome — search, theme, GitHub,
 * demo and the Docs call to action.
 */
export function Masthead(props: ComponentProps<'header'>) {
  const active = useActiveSheet();

  return (
    <header {...props} className="mh" data-home-masthead="">
      <a className="home-skip" href="#main">
        Skip to content
      </a>
      <div className="mh__inner">
        <Link href="/" className="mh__brand" aria-label="Mesh, home">
          <Brand />
        </Link>

        <nav className="mh-nav" aria-label="Sheets">
          <ul className="mh-nav__list">
            {sheets.slice(1).map((s) => (
              <li key={s.id}>
                <a href={`/#${s.id}`} aria-current={active === s.no ? 'true' : undefined}>
                  <span className="mh-nav__no">{pad2(s.no)}</span>
                  {s.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="mh__tools">
          <a className="mh-link" href={demoUrl} target="_blank" rel="noreferrer">
            Live demo
            <ExtIcon className="link__ext" />
          </a>
          <a
            className="mh-icon"
            href={githubUrl}
            target="_blank"
            rel="noreferrer"
            aria-label="Mesh on GitHub"
          >
            <GitHubIcon size={16} />
          </a>
          <SearchChip />
          <span className="mh__search-sm">
            <SearchChip compact />
          </span>
          <ThemeToggle className="mh__theme" />
          <Link className="mh-cta" href={docsRoute}>
            <span className="mh-cta__no" aria-hidden="true">
              →
            </span>
            Docs
          </Link>
          <SheetIndex active={active} />
        </div>
      </div>
    </header>
  );
}
