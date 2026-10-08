import Link from 'next/link';
import { HeroConceptFlow } from '@/components/hero-concept-flow';
import { HeroConceptIsland } from '@/components/hero-concept-island';

const concepts = [
  {
    label: 'Direction A',
    title: 'System flow',
    description:
      'A clearer map of how Livewire, Mesh, and the frontend frameworks connect.',
    visual: <HeroConceptFlow />,
  },
  {
    label: 'Direction B',
    title: 'Live island',
    description:
      'A closer look at the component experience: one tag, live state, and a framework UI.',
    visual: <HeroConceptIsland />,
  },
];

export default function HeroPreviewPage() {
  return (
    <main className="isolate flex-1 py-12 sm:py-16">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="flex flex-wrap items-start justify-between gap-6">
          <div className="flex flex-col items-start gap-2">
            <p className="font-mono text-xs uppercase tracking-wide text-rose-600 dark:text-rose-400">
              Hero explorations
            </p>
            <h1 className="max-w-[35ch] text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
              Two directions for the Mesh homepage
            </h1>
            <p className="max-w-[56ch] text-pretty text-base text-fd-muted-foreground sm:text-sm">
              Compare two ways to show how Mesh brings Livewire components into your UI.
            </p>
          </div>
          <Link
            href="/"
            className="rounded-lg border border-fd-border px-4 py-2 text-base font-medium text-fd-muted-foreground hover:bg-fd-accent hover:text-fd-foreground sm:text-sm"
          >
            Current homepage
          </Link>
        </div>

        <div className="mt-10 grid gap-8 lg:grid-cols-2">
          {concepts.map((concept) => (
            <section
              key={concept.label}
              className="min-w-0 overflow-hidden rounded-2xl border border-fd-border bg-fd-card dark:shadow-none"
            >
              <div className="flex flex-col items-start gap-1 border-b border-fd-border px-5 py-5 sm:px-7">
                <p className="font-mono text-xs uppercase tracking-wide text-rose-600 dark:text-rose-400">
                  {concept.label}
                </p>
                <h2 className="text-balance text-xl font-semibold tracking-tight">
                  {concept.title}
                </h2>
                <p className="max-w-[56ch] text-pretty text-base text-fd-muted-foreground sm:text-sm">
                  {concept.description}
                </p>
              </div>
              <div className="flex aspect-square items-center justify-center overflow-hidden p-3 sm:p-6">
                {concept.visual}
              </div>
            </section>
          ))}
        </div>
      </div>
    </main>
  );
}
