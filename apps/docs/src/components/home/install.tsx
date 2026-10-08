import type { ReactNode } from 'react';
import Link from 'next/link';
import { Code, type CodeLang } from './code';
import { CopyButton } from './copy-button';
import { ArrowRightIcon } from './icons';

// Lines are kept short so every block fits its column without scrolling.

const viteConfig = `import { defineConfig } from 'vite'
import laravel from 'laravel-vite-plugin'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [
    laravel({ input: ['resources/js/app.ts'] }),
    react(),
  ],
  resolve: {
    alias: {
      '@mesh':
        '/vendor/ethanbarlo/mesh/resources/js',
    },
  },
})`;

const appTs = `import { Livewire } from
  '../../vendor/livewire/livewire/dist/livewire.esm'
import { initMesh } from '@mesh'
import reactRenderer from '@mesh/react'

initMesh(Livewire, {
  renderers: [reactRenderer],
})

Livewire.start()`;

const layout = `@vite('resources/js/app.ts')
@livewireScriptConfig`;

async function Block({ title, code, lang }: { title: string; code: string; lang: CodeLang }) {
  return (
    <figure className="cblock">
      <figcaption className="cblock__head">
        <span className="cblock__title">{title}</span>
        <CopyButton text={code} label={`Copy ${title}`} />
      </figcaption>
      <div className="cblock__body code">{await Code({ code, lang })}</div>
    </figure>
  );
}

function Step({ n, title, body, children }: { n: string; title: string; body: ReactNode; children: ReactNode }) {
  return (
    <li className="istep">
      <div className="istep__text">
        <span className="istep__n balloon" aria-hidden="true">
          {n}
        </span>
        <h3 className="istep__title">
          <span className="vh">Step {n}: </span>
          {title}
        </h3>
        <p className="istep__body">{body}</p>
      </div>
      <div className="istep__code">{children}</div>
    </li>
  );
}

/** Sheet 07 — four steps, then the way into the docs. */
export async function Install() {
  return (
    <>
      <ol className="isteps">
        <Step
          n="01"
          title="Require the package"
          body={
            <>
              The PHP classes, the Blade tag and the frontend runtime ship in one Composer package. There is no
              Mesh package on npm.
            </>
          }
        >
          <Block title="Terminal" code="composer require ethanbarlo/mesh" lang="bash" />
        </Step>
        <Step
          n="02"
          title="Alias the runtime in Vite"
          body={
            <>
              Point <code>@mesh</code> at the package&rsquo;s <code>resources/js</code> and add your framework&rsquo;s
              plugin. This is React; Vue uses <code>@vitejs/plugin-vue</code> and Svelte{' '}
              <code>@sveltejs/vite-plugin-svelte</code>. Components need no input entries.
            </>
          }
        >
          <Block title="Terminal" code={'npm install react react-dom\nnpm install -D @vitejs/plugin-react'} lang="bash" />
          <Block title="vite.config.ts" code={viteConfig} lang="ts" />
        </Step>
        <Step
          n="03"
          title="Start Mesh in app.ts"
          body={
            <>
              Register a renderer for each framework you use, then start Livewire. Because you bundle Livewire
              yourself, the layout emits <code>@livewireScriptConfig</code>.
            </>
          }
        >
          <Block title="resources/js/app.ts" code={appTs} lang="ts" />
          <Block title="Your Blade layout" code={layout} lang="blade" />
        </Step>
        <Step
          n="04"
          title="Make a component, render it"
          body={
            <>
              <code>make:mesh</code> writes both halves with matching names. Pass <code>--renderer=vue</code> or{' '}
              <code>--renderer=svelte</code> for the others.
            </>
          }
        >
          <Block title="Terminal" code="php artisan make:mesh Counter" lang="bash" />
          <Block title="Any Livewire view" code="<mesh:counter />" lang="blade" />
        </Step>
      </ol>

      <div className="install__next">
        <Link className="btn btn--solid" href="/docs/installation">
          Read the installation guide
          <ArrowRightIcon className="btn__icon btn__icon--right" />
        </Link>
        <Link className="link link--mono" href="/docs/quickstart">
          Quickstart
          <ArrowRightIcon size={12} className="link__ext" />
        </Link>
      </div>
    </>
  );
}
