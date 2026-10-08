'use client';

import { useCallback, useId, useState, type CSSProperties, type KeyboardEvent } from 'react';
import { packageVersion } from '@/lib/shared';
import { FRAMEWORKS, NARROW, PINS, WIDE, throwPositions, type Fw, type Layout } from './layout';
import { SchematicSvg } from './schematic';
import './hero-figure.css';

/**
 * Fig. 1 — Mesh drawn as a wiring schematic. U1 (a Livewire 4 component)
 * connects through J1 (Mesh, six labelled pins) to socket X1, the
 * `<mesh:counter />` tag, which seats an island chip. SW1 swaps the chip
 * between React, Vue and Svelte; the pinout never changes.
 */

type Shared = {
  fw: Fw;
  active: number | null;
  locked: number | null;
  count: number;
  swap: { key: number; fetched: boolean };
  hoverFw: Fw | null;
  descId: string;
  onLand: () => void;
  onSelect: (fw: Fw) => void;
  setHover: (i: number | null) => void;
  setFocus: (i: number | null) => void;
  setLocked: (fn: (l: number | null) => number | null) => void;
  setHoverFw: (fw: Fw | null) => void;
};

const pct = (v: number, total: number) => `${(v / total) * 100}%`;

function boxStyle(L: Layout, x: number, y: number, w: number, h: number): CSSProperties {
  return { left: pct(x, L.W), top: pct(y, L.H), width: pct(w, L.W), height: pct(h, L.H) };
}

function Stage({ L, s }: { L: Layout; s: Shared }) {
  const { pins, u1, chip, sw } = L;
  const rowH = pins[1] - pins[0];
  const hitX0 = u1.x + 6;
  const hitX1 = chip.x + (chip.mark.inline ? chip.w - 4 : chip.w * 0.56);
  const throws = throwPositions(L);
  const labelAdv = L.fs.k * 0.7;
  /** Hit box for a throw: its label + contact, one throw pitch tall. */
  const throwBox = (k: number) => {
    const t = throws[k];
    const x0 = t.x - sw.labelGap - t.f.label.length * labelAdv - 6;
    return boxStyle(L, x0, t.y - sw.spread / 2, t.x + 7 - x0, sw.spread);
  };

  const onRadioKey = (e: KeyboardEvent<HTMLButtonElement>, k: number) => {
    const delta = e.key === 'ArrowDown' || e.key === 'ArrowRight' ? 1 : e.key === 'ArrowUp' || e.key === 'ArrowLeft' ? -1 : 0;
    if (!delta) return;
    e.preventDefault();
    const next = (k + delta + FRAMEWORKS.length) % FRAMEWORKS.length;
    s.onSelect(FRAMEWORKS[next].id);
    const buttons = e.currentTarget.parentElement?.querySelectorAll<HTMLButtonElement>('button');
    buttons?.[next]?.focus();
  };

  return (
    <div className={`hl-schematic-stage hl-schematic-stage--${L.kind}`}>
      <SchematicSvg
        L={L}
        fw={s.fw}
        active={s.active}
        count={s.count}
        swapKey={s.swap.key}
        fetched={s.swap.fetched}
        version={packageVersion}
        hoverFw={s.hoverFw}
        onEntangleLand={s.onLand}
        onRowHover={s.setHover}
      />
      <div className="hl-schematic-hits">
        {PINS.map((p, i) => (
          <button
            key={p.n}
            type="button"
            className="hl-schematic-hit"
            style={boxStyle(L, hitX0, pins[i] - rowH / 2, hitX1 - hitX0, rowH)}
            aria-label={`Pin ${p.n}: ${p.name}`}
            aria-describedby={`${s.descId}-pin${p.n}`}
            aria-pressed={s.locked === i}
            onPointerEnter={(e) => {
              if (e.pointerType === 'mouse') s.setHover(i);
            }}
            onPointerLeave={() => s.setHover(null)}
            onFocus={(e) => {
              if (e.currentTarget.matches(':focus-visible')) s.setFocus(i);
            }}
            onBlur={() => s.setFocus(null)}
            onClick={() => s.setLocked((l) => (l === i ? null : i))}
          />
        ))}
        <div role="radiogroup" aria-label="Island renderer" className="hl-schematic-radios">
          {FRAMEWORKS.map((f, k) => (
            <button
                key={f.id}
                type="button"
                role="radio"
                aria-checked={s.fw === f.id}
                tabIndex={s.fw === f.id ? 0 : -1}
                className="hl-schematic-hit"
                style={throwBox(k)}
                aria-label={`${f.label.charAt(0)}${f.label.slice(1).toLowerCase()} island`}
                onClick={() => s.onSelect(f.id)}
                onKeyDown={(e) => onRadioKey(e, k)}
                onPointerEnter={(e) => {
                  if (e.pointerType === 'mouse') s.setHoverFw(f.id);
                }}
                onPointerLeave={() => s.setHoverFw(null)}
              />
          ))}
        </div>
      </div>
    </div>
  );
}

export function HeroFigure() {
  const [fw, setFw] = useState<Fw>('react');
  const [loaded, setLoaded] = useState<Record<Fw, boolean>>({ react: true, vue: false, svelte: false });
  const [swap, setSwap] = useState({ key: 0, fetched: true });
  const [hover, setHover] = useState<number | null>(null);
  const [focus, setFocus] = useState<number | null>(null);
  const [locked, setLocked] = useState<number | null>(null);
  const [hoverFw, setHoverFw] = useState<Fw | null>(null);
  const [count, setCount] = useState(7);
  const descId = useId();

  const onLand = useCallback(() => setCount((c) => (c >= 99 ? 0 : c + 1)), []);

  const onSelect = (next: Fw) => {
    if (next === fw) return;
    const fetched = !loaded[next];
    setFw(next);
    setLoaded((l) => ({ ...l, [next]: true }));
    setSwap((sw) => ({ key: sw.key + 1, fetched }));
  };

  const shared: Shared = {
    fw,
    active: hover ?? focus ?? locked,
    locked,
    count,
    swap,
    hoverFw,
    descId,
    onLand,
    onSelect,
    setHover,
    setFocus,
    setLocked,
    setHoverFw,
  };
  const current = FRAMEWORKS.find((f) => f.id === fw)!;

  return (
    <figure className="hl-schematic not-prose">
      <Stage L={WIDE} s={shared} />
      <Stage L={NARROW} s={shared} />
      <div className="hl-schematic-vh">
        <p>
          Wiring schematic of Mesh. On the left, U1 is a Livewire 4 component, App\Mesh\Counter, holding server
          state. In the middle, J1 is the Mesh connector with six pins: props, entangle, call, dispatch, slots and
          lifecycle. On the right, socket X1 is the &lt;mesh:counter /&gt; Blade tag; it holds the island chip,
          currently {current.label.toLowerCase()}. Selector SW1 swaps in a React, Vue or Svelte island and the
          pinout stays the same. A dashed line marks the island&rsquo;s lazy chunk, fetched the first time it is used.
        </p>
        {PINS.map((p) => (
          <span key={p.n} id={`${descId}-pin${p.n}`}>
            {p.a11y}
          </span>
        ))}
      </div>
      <figcaption className="fig-cap k">
        Fig. 1 · Livewire owns the state; Mesh carries six signals to whichever island sits in the socket.
      </figcaption>
    </figure>
  );
}
