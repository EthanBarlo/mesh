'use client';

import type { ComponentProps } from 'react';

/**
 * Container slot for the home layout. Fumadocs renders its container as a
 * `<main>` with the header inside it; the home page supplies its own `<main>`
 * so the masthead can be a real banner landmark, so this is a plain wrapper.
 */
export function HomeShell({ children }: ComponentProps<'main'>) {
  return <div className="home-shell">{children}</div>;
}
