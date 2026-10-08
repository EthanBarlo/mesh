'use client';

/**
 * A tiny shared store for "which sheet is on screen". The frame (rendered by
 * the page) starts the spy; the masthead (rendered by the layout) only reads,
 * so pages without sheets simply never mark anything active.
 */

let active = 0;
const listeners = new Set<() => void>();

function emit() {
  for (const l of listeners) l();
}

export function setActiveSheet(n: number) {
  if (!n || n === active) return;
  active = n;
  emit();
}

export function subscribeActiveSheet(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function getActiveSheet() {
  return active;
}

export function getServerActiveSheet() {
  return 0;
}

/** Observe every `[data-sheet]` section; returns a cleanup. */
export function startSheetSpy(root: ParentNode = document): () => void {
  const sections = Array.from(root.querySelectorAll<HTMLElement>('[data-sheet]'));
  if (!sections.length || !('IntersectionObserver' in window)) return () => {};

  setActiveSheet(1);

  const spy = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          setActiveSheet(Number(entry.target.getAttribute('data-sheet')));
        }
      }
    },
    { rootMargin: '-45% 0px -54% 0px' },
  );
  sections.forEach((s) => spy.observe(s));

  // The last sheet is short; claim it once the footer is on screen.
  const foot = root.querySelector('[data-home-foot]');
  let footIO: IntersectionObserver | null = null;
  if (foot) {
    footIO = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) setActiveSheet(sections.length);
      },
      { threshold: 0.6 },
    );
    footIO.observe(foot);
  }

  return () => {
    spy.disconnect();
    footIO?.disconnect();
    active = 0;
    emit();
  };
}
