import type { BaseLayoutProps } from 'fumadocs-ui/layouts/shared';
import { demoUrl, githubUrl, packageVersion } from './shared';

export function Brand() {
  return (
    <span className="brand">
      <span className="brand__mark" aria-hidden="true">
        MS
      </span>
      <span className="brand__name">Mesh</span>
      <span className="brand__rev">v{packageVersion}</span>
    </span>
  );
}

export function baseOptions(): BaseLayoutProps {
  return {
    nav: {
      title: <Brand />,
    },
    links: [
      {
        text: 'Docs',
        url: '/docs',
        active: 'nested-url',
        // Redundant inside the docs sidebar; only the home navbar shows it.
        on: 'nav',
      },
      {
        text: 'Live demo',
        url: demoUrl,
        external: true,
      },
    ],
    githubUrl,
  };
}
