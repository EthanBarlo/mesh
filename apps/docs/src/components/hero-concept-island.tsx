'use client';

import { useEffect, useState } from 'react';

const frameworks = ['React', 'Vue', 'Svelte'] as const;
type Framework = (typeof frameworks)[number];

/** A small, working example of the Blade → Mesh → JavaScript island journey. */
export function HeroConceptIsland() {
  const [framework, setFramework] = useState<Framework>('React');
  const [count, setCount] = useState(8);
  const [interacted, setInteracted] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
    const updatePreference = () => setReducedMotion(preference.matches);

    updatePreference();
    preference.addEventListener('change', updatePreference);

    return () => preference.removeEventListener('change', updatePreference);
  }, []);

  useEffect(() => {
    if (reducedMotion || interacted) return;

    const timer = window.setTimeout(() => {
      setCount((current) => (current >= 10 ? 8 : current + 1));
    }, 3600);

    return () => window.clearTimeout(timer);
  }, [count, interacted, reducedMotion]);

  function changeCount(amount: number) {
    setInteracted(true);
    setCount((current) => Math.max(0, current + amount));
  }

  const formattedCount = String(count).padStart(2, '0');

  return (
    <section
      className="@container relative isolate aspect-[26/25] w-full max-w-[520px] overflow-hidden"
      aria-label="Interactive Mesh component preview"
    >
      <style>{`
        @keyframes hci-travel {
          0% { opacity: 0; transform: translateY(-22px); }
          18% { opacity: 1; }
          82% { opacity: 1; }
          100% { opacity: 0; transform: translateY(22px); }
        }
        @keyframes hci-arrive {
          from { opacity: .45; transform: translateY(5px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .hci-travel { animation: hci-travel 3.6s ease-in-out infinite; }
        .hci-arrive { animation: hci-arrive .35s ease-out both; }
        @media (prefers-reduced-motion: reduce) {
          .hci-travel, .hci-arrive { animation: none; }
        }
      `}</style>

      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-[8%] rounded-full bg-rose-400/10 blur-3xl dark:bg-rose-400/5"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-[10%] bottom-[3%] h-[10%] rounded-full bg-zinc-950/5 blur-2xl dark:hidden"
      />

      <div className="absolute inset-x-[6%] top-[6%] h-[32%] overflow-hidden rounded-[min(2vw,16px)] bg-zinc-950 text-zinc-100 shadow-[0_20px_50px_-28px_rgba(24,24,27,0.75)] ring-1 ring-zinc-950/10 dark:shadow-none dark:ring-white/10">
        <div className="flex h-[27%] items-center justify-between border-b border-white/10 px-[4%]">
          <div className="flex min-w-0 items-center gap-2.5">
            <div className="flex shrink-0 gap-1.5" aria-hidden="true">
              <span className="size-1.5 rounded-full bg-zinc-600" />
              <span className="size-1.5 rounded-full bg-zinc-600" />
              <span className="size-1.5 rounded-full bg-zinc-600" />
            </div>
            <p className="truncate font-mono text-[clamp(9px,2.1cqw,11px)] text-zinc-300">
              dashboard.blade.php
            </p>
          </div>
          <p className="shrink-0 font-mono text-[clamp(8px,1.8cqw,10px)] tracking-wide text-zinc-500">
            BLADE VIEW
          </p>
        </div>

        <div className="grid grid-cols-[1.25rem_1fr] gap-x-[4%] px-[5%] pt-[3%] font-mono text-[clamp(10px,2.25cqw,12px)] leading-[1.55]">
          <div className="text-right text-zinc-600" aria-hidden="true">
            12<br />13<br />14
          </div>
          <code className="text-zinc-200">
            <span className="text-rose-300">&lt;mesh:counter</span>
            <br />
            <span className="pl-[2ch] text-amber-200">wire:model</span>
            <span className="text-zinc-400">=</span>
            <span className="text-emerald-300">&quot;count&quot;</span>
            <br />
            <span className="text-rose-300">/&gt;</span>
          </code>
        </div>
      </div>

      <div
        aria-hidden="true"
        className="absolute left-1/2 top-[38%] h-[10%] w-px -translate-x-1/2 bg-linear-to-b from-rose-400/0 via-rose-400/70 to-rose-400/0"
      >
        <span className="hci-travel absolute left-1/2 top-1/2 size-1.5 -translate-x-1/2 rounded-full bg-rose-400 shadow-[0_0_12px_3px_rgba(251,113,133,0.55)]" />
      </div>

      <div className="absolute right-[6%] top-[31%] z-10 flex w-[34%] items-center justify-between gap-2 rounded-xl bg-fd-card px-[3%] py-[2%] shadow-[0_12px_28px_-16px_rgba(24,24,27,0.55)] ring-1 ring-zinc-950/10 dark:shadow-none dark:ring-white/10">
        <div className="min-w-0">
          <p className="truncate font-mono text-[clamp(8px,1.8cqw,10px)] text-fd-muted-foreground">
            Livewire state
          </p>
          <p className="truncate font-mono text-[clamp(9px,2cqw,11px)] text-fd-foreground">
            $count
          </p>
        </div>
        <p
          key={count}
          aria-hidden="true"
          className="hci-arrive shrink-0 font-mono text-[clamp(18px,4cqw,22px)] font-semibold tabular-nums text-rose-500 dark:text-rose-400"
        >
          {formattedCount}
        </p>
      </div>

      <div className="absolute left-1/2 top-[40%] z-20 -translate-x-1/2 rounded-full bg-rose-500 px-3 py-1.5 text-[clamp(10px,2.1cqw,12px)] font-semibold tracking-tight text-white shadow-[0_7px_20px_-9px_rgba(244,63,94,0.9)] dark:shadow-none">
        mesh
      </div>

      <div className="absolute inset-x-[10%] bottom-[4%] top-[44%] overflow-hidden rounded-[min(2vw,16px)] bg-fd-card shadow-[0_22px_55px_-25px_rgba(24,24,27,0.35)] ring-1 ring-zinc-950/10 dark:shadow-none dark:ring-white/10">
        <div className="flex h-[24%] items-center justify-between gap-2 border-b border-fd-border px-[5%]">
          <div className="flex min-w-0 items-center gap-2">
            <span className="size-2 shrink-0 rounded-full bg-emerald-500" aria-hidden="true" />
            <p className="truncate font-mono text-[clamp(9px,2cqw,11px)] text-fd-muted-foreground">
              Live preview
            </p>
          </div>
          <div className="flex shrink-0 items-center rounded-md bg-fd-background p-0.5 ring-1 ring-fd-border" role="group" aria-label="Preview framework">
            {frameworks.map((option) => (
              <button
                key={option}
                type="button"
                aria-pressed={framework === option}
                onClick={() => setFramework(option)}
                className="min-h-6 rounded-[5px] px-2 py-1 font-medium text-[clamp(8px,1.85cqw,10px)] text-fd-muted-foreground aria-pressed:bg-fd-card aria-pressed:text-fd-foreground aria-pressed:shadow-sm dark:aria-pressed:shadow-none"
              >
                {option}
              </button>
            ))}
          </div>
        </div>

        <div className="px-[6%] pt-[5%]">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="font-mono text-[clamp(8px,1.8cqw,10px)] tracking-wide text-rose-500 dark:text-rose-400">
                YOUR ISLAND
              </p>
              <p className="text-[clamp(17px,4cqw,23px)] font-semibold tracking-tight text-fd-foreground">
                Counter
              </p>
            </div>
            <p className="shrink-0 rounded-full bg-emerald-500/10 px-2 py-1 text-[clamp(8px,1.8cqw,10px)] font-medium text-emerald-700 dark:text-emerald-300">
              Synced
            </p>
          </div>

          <div className="mt-[4%] flex items-center justify-between rounded-xl bg-fd-background px-[5%] py-[3%] ring-1 ring-fd-border">
            <button
              type="button"
              onClick={() => changeCount(-1)}
              aria-label="Decrease counter"
              className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-fd-card text-xl text-fd-foreground ring-1 ring-fd-border active:scale-95"
            >
              −
            </button>
            <output
              aria-live={interacted ? 'polite' : 'off'}
              aria-label="Counter value"
              className="min-w-0 font-mono text-[clamp(28px,7cqw,40px)] font-semibold tabular-nums tracking-tight text-fd-foreground"
            >
              <span key={count} className="hci-arrive">
                {formattedCount}
              </span>
            </output>
            <button
              type="button"
              onClick={() => changeCount(1)}
              aria-label="Increase counter"
              className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-rose-500 text-xl text-white active:scale-95"
            >
              +
            </button>
          </div>

          <p className="mt-[4%] font-mono text-[clamp(8px,1.85cqw,10px)] text-fd-muted-foreground">
            {framework.toLowerCase()} island <span aria-hidden="true">↔</span> Livewire
          </p>
        </div>
      </div>
    </section>
  );
}
