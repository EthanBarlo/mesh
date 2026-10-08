/**
 * Motion helpers for the home page drawings, ported from the portfolio's
 * script.js: stroke-dashoffset draw-in, once-only "entered the viewport", and
 * a reduced-motion check. No animation library — CSS transitions do the work.
 */

export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export function hasFinePointer(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(hover: hover) and (pointer: fine)').matches;
}

/** Run `fn` once, the first time `el` enters the viewport. Returns a cleanup. */
export function onceInView(
  el: Element,
  fn: () => void,
  rootMargin = '0px 0px -10% 0px',
): () => void {
  if (!('IntersectionObserver' in window)) {
    fn();
    return () => {};
  }
  const io = new IntersectionObserver(
    (entries) => {
      if (entries.some((entry) => entry.isIntersecting)) {
        io.disconnect();
        fn();
      }
    },
    { rootMargin, threshold: 0.01 },
  );
  io.observe(el);
  return () => io.disconnect();
}

type Armed = SVGGeometryElement & { __dash?: number };

/** Lines that draw in: solid strokes only (dashes and centre lines fade in instead). */
export function drawableLines(svg: SVGSVGElement): SVGGeometryElement[] {
  return Array.from(
    svg.querySelectorAll<SVGGeometryElement>('.ln, .edge, .node__box'),
  ).filter(
    (el) =>
      !el.classList.contains('ln--dash') &&
      !el.classList.contains('ln--center') &&
      !el.classList.contains('edge--loop') &&
      !el.closest('[data-nodraw]'),
  );
}

/**
 * Strokes use `vector-effect: non-scaling-stroke`, so browsers may measure the
 * dash pattern in screen space. Arming with max(user, screen) length covers both.
 */
export function armLines(svg: SVGSVGElement, lines: SVGGeometryElement[]): void {
  const ctm = svg.getScreenCTM();
  const scale = ctm ? Math.max(Math.abs(ctm.a), Math.abs(ctm.d)) || 1 : 1;
  for (const el of lines as Armed[]) {
    let len = 0;
    try {
      len = el.getTotalLength();
    } catch {
      len = 0;
    }
    if (!len) continue;
    const d = Math.ceil(Math.max(len, len * scale)) + 4;
    el.style.strokeDasharray = `${d} ${d}`;
    el.style.strokeDashoffset = String(d);
    el.__dash = d;
  }
}

export function playLines(
  lines: SVGGeometryElement[],
  { dur = 900, stagger = 40, cap = 520, delay = 0 } = {},
): number[] {
  const timers: number[] = [];
  (lines as Armed[]).forEach((el, i) => {
    if (!el.__dash) return;
    const wait = delay + Math.min(i * stagger, cap);
    el.style.transition = `stroke-dashoffset ${dur}ms cubic-bezier(0.23, 1, 0.32, 1) ${wait}ms`;
    el.style.strokeDashoffset = '0';
    timers.push(
      window.setTimeout(() => {
        el.style.transition = '';
        el.style.strokeDasharray = '';
        el.style.strokeDashoffset = '';
        el.__dash = 0;
      }, wait + dur + 80),
    );
  });
  return timers;
}

/** Drop any armed dashes immediately (e.g. on unmount mid-animation). */
export function settleLines(lines: SVGGeometryElement[]): void {
  for (const el of lines as Armed[]) {
    el.style.transition = '';
    el.style.strokeDasharray = '';
    el.style.strokeDashoffset = '';
    el.__dash = 0;
  }
}

export function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}
