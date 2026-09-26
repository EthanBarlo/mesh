import Link from 'next/link';
import { HeroDiagram } from '@/components/hero-diagram';

const demoUrl = 'https://mesh-demo-react.ebarlow.dev';

export default function HomePage() {
  return (
    <main className="flex-1 px-6 py-16">
      <div className="w-full max-w-5xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-fd-border bg-fd-card text-xs font-medium uppercase tracking-widest text-fd-muted-foreground mb-6">
            <span className="h-1.5 w-1.5 rounded-full bg-rose-400" />
            For Livewire 4
          </div>
          <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight mb-4">
            One Mesh tag.{' '}
            <span className="text-fd-muted-foreground">
              The whole JavaScript ecosystem.
            </span>
          </h1>
          <p className="text-lg text-fd-muted-foreground leading-relaxed mb-8">
            Mesh renders React, Vue, and Svelte components as islands inside
            Livewire views — props, two-way state, server actions, bundling,
            and lifecycle handled for you, so you can just focus on building.
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/docs"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-fd-foreground text-fd-background font-medium hover:opacity-90 transition-opacity"
            >
              Get started
            </Link>
            <a
              href={demoUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg border border-fd-border text-fd-muted-foreground font-medium hover:text-fd-foreground hover:bg-fd-accent transition-colors"
            >
              See the live demo
            </a>
          </div>
          <p className="mt-6 text-sm text-fd-muted-foreground">
            Reaching for a framework only sometimes?{' '}
            <Link
              href="/docs/why"
              className="font-medium underline underline-offset-4 hover:text-fd-foreground"
            >
              That&apos;s the point — read why.
            </Link>
          </p>
        </div>

        <HeroDiagram />
      </div>

      <div className="w-full max-w-5xl mx-auto mt-20">
        <div className="grid md:grid-cols-3 gap-3">
          <div className="rounded-xl border border-fd-border bg-fd-card overflow-hidden">
            <div className="px-4 py-2 border-b border-fd-border text-xs font-mono text-fd-muted-foreground">
              app/Mesh/Counter.php
            </div>
            <pre className="p-4 text-sm font-mono leading-relaxed overflow-x-auto">
              <code>
                <span className="text-fd-muted-foreground">
                  class Counter extends{' '}
                </span>
                <span>Mesh\Component</span>
                {'\n'}
                <span className="text-fd-muted-foreground">{'{'}</span>
                {'\n    '}
                <span className="text-fd-muted-foreground">
                  public function{' '}
                </span>
                <span>props()</span>
                <span className="text-fd-muted-foreground">: array</span>
                {'\n    '}
                <span className="text-fd-muted-foreground">{'{'}</span>
                {'\n        '}
                <span className="text-fd-muted-foreground">return </span>
                <span>[&apos;start&apos; =&gt; $this-&gt;count]</span>
                <span className="text-fd-muted-foreground">;</span>
                {'\n    '}
                <span className="text-fd-muted-foreground">{'}'}</span>
                {'\n'}
                <span className="text-fd-muted-foreground">{'}'}</span>
              </code>
            </pre>
          </div>
          <div className="rounded-xl border border-fd-border bg-fd-card overflow-hidden">
            <div className="px-4 py-2 border-b border-fd-border text-xs font-mono text-fd-muted-foreground">
              resources/js/mesh/Counter/index.tsx
            </div>
            <pre className="p-4 text-sm font-mono leading-relaxed overflow-x-auto">
              <code>
                <span className="text-fd-muted-foreground">
                  export default function{' '}
                </span>
                <span>Counter</span>
                <span className="text-fd-muted-foreground">
                  ({'{'} start {'}'}) {'{'}
                </span>
                {'\n    '}
                <span className="text-fd-muted-foreground">
                  const [count, setCount] ={' '}
                </span>
                <span>useEntangle(&apos;count&apos;)</span>
                <span className="text-fd-muted-foreground">;</span>
                {'\n    '}
                <span className="text-fd-muted-foreground">…</span>
                {'\n'}
                <span className="text-fd-muted-foreground">{'}'}</span>
              </code>
            </pre>
          </div>
          <div className="rounded-xl border border-fd-border bg-fd-card overflow-hidden">
            <div className="px-4 py-2 border-b border-fd-border text-xs font-mono text-fd-muted-foreground">
              anywhere.blade.php
            </div>
            <pre className="p-4 text-sm font-mono leading-relaxed overflow-x-auto">
              <code>
                <span className="text-rose-500 dark:text-rose-400">
                  &lt;mesh:counter
                </span>{' '}
                <span>wire:model=&quot;count&quot;</span>{' '}
                <span className="text-rose-500 dark:text-rose-400">/&gt;</span>
              </code>
            </pre>
          </div>
        </div>
      </div>
    </main>
  );
}
