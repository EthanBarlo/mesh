'use client';

import { useEffect, useLayoutEffect, useRef, useState, useSyncExternalStore } from 'react';
import { pad2, sheets, zones } from './sheets';
import {
  getActiveSheet,
  getServerActiveSheet,
  startSheetSpy,
  subscribeActiveSheet,
} from './sheet-spy';
import { armLines, drawableLines, hasFinePointer, onceInView, playLines, prefersReducedMotion, settleLines } from './motion';

const useIsoLayoutEffect = typeof window === 'undefined' ? useEffect : useLayoutEffect;

/**
 * The drawing frame: zone letters A–F on the top and bottom rails, sheet
 * numbers down the sides (the left rail links to each sheet), and a live zone
 * readout in the corner. Decorative — the masthead holds the real navigation.
 */
export function Frame() {
  const active = useSyncExternalStore(subscribeActiveSheet, getActiveSheet, getServerActiveSheet);
  const [zone, setZone] = useState(-1);

  useEffect(() => startSheetSpy(document), []);

  useEffect(() => {
    if (!hasFinePointer()) return;
    let raf = 0;
    let px = -1;

    function update() {
      raf = 0;
      const root = document.documentElement;
      const g = parseFloat(getComputedStyle(document.querySelector('.home') ?? root).getPropertyValue('--g')) || 0;
      const width = root.clientWidth - 2 * g;
      let i = px < 0 ? -1 : Math.floor(((px - g) / width) * zones.length);
      if (i < 0 || i >= zones.length) i = -1;
      setZone(i);
    }
    function queue() {
      if (!raf) raf = requestAnimationFrame(update);
    }
    function onMove(e: PointerEvent) {
      px = e.clientX;
      queue();
    }
    function onOut(e: MouseEvent) {
      if (!e.relatedTarget) {
        px = -1;
        queue();
      }
    }
    window.addEventListener('pointermove', onMove, { passive: true });
    document.addEventListener('mouseout', onOut);
    return () => {
      window.removeEventListener('pointermove', onMove);
      document.removeEventListener('mouseout', onOut);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  const readout = `${zone >= 0 ? zones[zone] : ''}${active || ''}`;

  const zoneRail = (side: 'top' | 'bottom') => (
    <div className={`frame__rail frame__rail--${side}`}>
      {zones.map((z, i) => (
        <span key={z} className={i === zone ? 'is-zone' : undefined}>
          {z}
        </span>
      ))}
    </div>
  );

  return (
    <div className="frame" aria-hidden="true">
      {zoneRail('top')}
      {zoneRail('bottom')}
      <div className="frame__rail frame__rail--left">
        {sheets.map((s) => (
          <a
            key={s.id}
            href={`#${s.id}`}
            tabIndex={-1}
            data-label={`${pad2(s.no)} · ${s.title}`}
            className={active === s.no ? 'is-active' : undefined}
          >
            <span>{s.no}</span>
          </a>
        ))}
      </div>
      <div className="frame__rail frame__rail--right">
        {sheets.map((s) => (
          <span key={s.id} className={active === s.no ? 'is-active' : undefined}>
            {s.no}
          </span>
        ))}
      </div>
      <div className="frame__corner frame__corner--tl">
        <span>{readout}</span>
      </div>
      <div className="frame__corner frame__corner--tr" />
      <div className="frame__corner frame__corner--bl" />
      <div className="frame__corner frame__corner--br" />
      <div className="frame__border" />
    </div>
  );
}

/**
 * Page-level motion: marks `[data-inview]` elements once they scroll into view
 * (sheet rules, dimension lines) and draws in the static line drawings marked
 * `data-autodraw`. Until this runs, CSS keeps everything in its final state
 * after a short fallback delay, so nothing depends on JavaScript to appear.
 */
export function HomeMotion() {
  const ref = useRef<HTMLSpanElement>(null);

  useIsoLayoutEffect(() => {
    const home = ref.current?.closest<HTMLElement>('.home');
    if (!home) return;
    const reduced = prefersReducedMotion();
    home.classList.add('is-live');
    if (reduced) home.classList.add('is-still');

    const cleanups: Array<() => void> = [];

    home.querySelectorAll<HTMLElement>('[data-inview]').forEach((el) => {
      if (reduced) {
        el.classList.add('is-inview');
        return;
      }
      cleanups.push(onceInView(el, () => el.classList.add('is-inview')));
    });

    home.querySelectorAll<SVGSVGElement>('svg[data-autodraw]').forEach((svg) => {
      if (reduced) {
        svg.classList.add('is-armed', 'is-drawn');
        return;
      }
      const lines = drawableLines(svg);
      armLines(svg, lines);
      svg.classList.add('is-armed');
      const timers: number[] = [];
      cleanups.push(
        onceInView(svg, () => {
          svg.getBoundingClientRect();
          timers.push(...playLines(lines, { dur: 900, stagger: 45, cap: 520 }));
          svg.classList.add('is-drawn');
        }),
      );
      cleanups.push(() => {
        timers.forEach((t) => clearTimeout(t));
        settleLines(lines);
      });
    });

    return () => {
      cleanups.forEach((fn) => fn());
      home.classList.remove('is-live', 'is-still');
    };
  }, []);

  return <span ref={ref} hidden />;
}
