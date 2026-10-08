import Link from 'next/link';
import { TitleBlock } from '@/components/drafting/title-block';
import { Anatomy } from '@/components/home/anatomy';
import { Channels } from '@/components/home/channels';
import { CopyButton } from '@/components/home/copy-button';
import { Details } from '@/components/home/details';
import { Fit } from '@/components/home/fit';
import { HomeFooter } from '@/components/home/footer';
import { Frame, HomeMotion } from '@/components/home/frame';
import { HeroFigure } from '@/components/home/hero-figure';
import { ArrowRightIcon, ExtIcon } from '@/components/home/icons';
import { Install } from '@/components/home/install';
import { RenderFlow } from '@/components/home/render-flow';
import { Sheet, SheetHead } from '@/components/home/sheet-head';
import { drawingNo, pad2, sheetCount } from '@/components/home/sheets';
import { demoUrl, docsRoute, githubUrl, packageVersion } from '@/lib/shared';

const install = 'composer require ethanbarlo/mesh';

function drawnOn(): { iso: string; label: string } {
  const now = new Date();
  const label = `${now.getUTCFullYear()}-${pad2(now.getUTCMonth() + 1)}`;
  return { iso: label, label };
}

function TitleSheet() {
  const date = drawnOn();
  return (
    <Sheet id="top" className="sheet--hero">
      <div className="sheet-head sheet-head--hero" data-inview="">
        <p className="sheet-head__no">
          Sheet 01 / {pad2(sheetCount)}
        </p>
        <p className="sheet-head__meta">General arrangement · Scale 1:1</p>
        <span className="sheet-head__rule" aria-hidden="true" />
      </div>

      <div className="hero">
        <div className="hero__text">
          <h1 className="hero__name" id="top-title">
            Mesh
          </h1>
          <p className="hero__role">One Mesh tag. The whole JavaScript ecosystem.</p>
          <p className="hero__kicker k k--caps">React, Vue and Svelte islands for Livewire 4</p>
          <p className="hero__lead">
            Livewire owns the state. Mesh carries it across the boundary, mounts your component, and
            keeps both sides in step.
          </p>
          <p className="hero__lead">
            Reach for a framework only where it&rsquo;s the easier path: a chart, a data grid, a
            drag-and-drop board. One Blade tag drops it in.
          </p>

          <div className="hero__actions">
            <Link className="btn btn--solid" href={docsRoute}>
              Get started
              <ArrowRightIcon className="btn__icon btn__icon--right" />
            </Link>
            <a className="btn btn--line" href={demoUrl} target="_blank" rel="noreferrer">
              Live demo
              <ExtIcon className="btn__icon btn__icon--ext" />
            </a>
          </div>

          <div className="hero__install">
            <p className="hero__install-k k k--caps">Install</p>
            <div className="chip">
              <span className="chip__k" aria-hidden="true">
                $
              </span>
              <code className="chip__cmd">
                <span className="nw">composer require</span> <b className="nw">ethanbarlo/mesh</b>
              </code>
              <CopyButton text={install} label="Copy the install command" />
            </div>
          </div>

          <p className="hero__why">
            Reaching for a framework only sometimes? That&rsquo;s the point.{' '}
            <Link className="link" href="/docs/why">
              Read why
            </Link>
          </p>
        </div>

        <HeroFigure />
      </div>

      <div className="hero__base">
        <div className="notes">
          <h2 className="notes__k">General notes</h2>
          <ol className="notes__list">
            <li>
              <span>Requires Livewire 4, PHP 8.3+ and Laravel 11 or 12.</span>
            </li>
            <li>
              <span>The frontend ships inside the Composer package and is wired in with a Vite alias. There is
              no npm package to install.</span>
            </li>
            <li>
              <span>Components are discovered from <code>resources/js/mesh</code>. Each one is its own lazy chunk, so
              heavy libraries load only on pages that render that island.</span>
            </li>
            <li>
              <span>You ship only the renderers you register in <code>app.ts</code>.</span>
            </li>
            <li>
              <span>MIT licence.</span>
            </li>
          </ol>
        </div>

        <TitleBlock
          label="Title block"
          title="Mesh"
          rows={[
            [
              { label: 'Package', value: 'ethanbarlo/mesh', span: 'half' },
              { label: 'Renderers', value: 'React · Vue · Svelte', span: 'half' },
            ],
            [
              { label: 'Requires', value: 'Livewire 4', span: 'third' },
              { label: 'Runtime', value: 'Vite alias @mesh', span: 'third' },
              {
                label: 'Source',
                value: (
                  <a href={githubUrl} target="_blank" rel="noreferrer">
                    GitHub
                  </a>
                ),
                span: 'third',
              },
            ],
            [
              { label: 'Dwg no.', value: drawingNo },
              { label: 'Sheet', value: `01 of ${pad2(sheetCount)}` },
              { label: 'Rev', value: packageVersion },
              { label: 'Date', value: <time dateTime={date.iso}>{date.label}</time> },
              { label: 'Scale', value: '1:1' },
              { label: 'Licence', value: 'MIT' },
            ],
          ]}
        />
      </div>
    </Sheet>
  );
}

function AnatomySheet() {
  return (
    <Sheet id="anatomy">
      <SheetHead id="anatomy" meta="make:mesh · 1 id · 2 halves" />
      <p className="sheet-intro">
        A Mesh component is one component in two halves: a Livewire class that owns the state, and a React, Vue
        or Svelte component that renders it. One Blade tag mounts both.
      </p>
      <ol className="snotes">
        <li>
          <span><code>php artisan make:mesh Counter</code> scaffolds both halves with matching names.</span>
        </li>
        <li>
          <span>The renderer comes from the entry&rsquo;s extension: <code>.tsx</code>, <code>.vue</code> or{' '}
          <code>.svelte</code>.</span>
        </li>
        <li>
          <span>Ids are case-sensitive. A mismatch that works on macOS breaks on Linux.</span>
        </li>
      </ol>
      <Anatomy />
    </Sheet>
  );
}

function RenderSheet() {
  return (
    <Sheet id="render">
      <SheetHead id="render" meta="5 steps · Livewire 4 hooks" />
      <p className="sheet-intro">
        What happens between the Blade tag and a live island, and how the two sides stay in step afterwards.
      </p>
      <RenderFlow />
    </Sheet>
  );
}

function ChannelsSheet() {
  return (
    <Sheet id="channels">
      <SheetHead id="channels" meta="7 channels · 3 renderers" />
      <p className="sheet-intro">
        Data crosses the boundary through a handful of channels. The names are the same in every framework; only
        the shape of the value changes. <code>wire</code> is <code>useWire()</code>, from the same package as the
        other hooks.
      </p>
      <Channels />
    </Sheet>
  );
}

function EcosystemSheet() {
  return (
    <Sheet id="ecosystem">
      <SheetHead id="ecosystem" meta="6 details · live demo" />
      <p className="sheet-intro">
        An island can use any library on npm. These run on the live demo, which is built with React; the{' '}
        <a className="link" href={`${githubUrl}/tree/main/apps/demo-vue`} target="_blank" rel="noreferrer">
          Vue
        </a>{' '}
        and{' '}
        <a className="link" href={`${githubUrl}/tree/main/apps/demo-svelte`} target="_blank" rel="noreferrer">
          Svelte
        </a>{' '}
        demos mirror them in the repository.
      </p>
      <Details />
    </Sheet>
  );
}

function FitSheet() {
  return (
    <Sheet id="fit">
      <SheetHead id="fit" meta="4 options · 6 requirements" />
      <p className="sheet-intro">
        Mesh is for the parts of a Livewire app that want a JavaScript framework. It is not a way to turn Livewire
        into a single-page app.
      </p>
      <Fit />
    </Sheet>
  );
}

function InstallSheet() {
  return (
    <Sheet id="install" className="sheet--last">
      <SheetHead id="install" meta="Composer · Vite · 4 steps" />
      <p className="sheet-intro">Four steps in a Laravel 11 or 12 app with Livewire 4 and PHP 8.3+.</p>
      <Install />
    </Sheet>
  );
}

export default function HomePage() {
  return (
    <div className="home">
      <Frame />
      <HomeMotion />
      <main id="main">
        <TitleSheet />
        <AnatomySheet />
        <RenderSheet />
        <ChannelsSheet />
        <EcosystemSheet />
        <FitSheet />
        <InstallSheet />
      </main>
      <HomeFooter />
    </div>
  );
}
