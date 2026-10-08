'use client';

import { useCallback, useEffect, useState } from 'react';

export const frameworkIds = ['react', 'vue', 'svelte'] as const;
export type FrameworkId = (typeof frameworkIds)[number];

export const frameworkNames: Record<FrameworkId, string> = {
  react: 'React',
  vue: 'Vue',
  svelte: 'Svelte',
};

// Same key and values as the docs' <Frameworks> tabs (Fumadocs groupId
// "framework", persisted), so a choice made here carries into /docs.
const KEY = 'framework';

function isFramework(v: string | null): v is FrameworkId {
  return v === 'react' || v === 'vue' || v === 'svelte';
}

function read(): FrameworkId | null {
  try {
    const v = sessionStorage.getItem(KEY) ?? localStorage.getItem(KEY);
    return isFramework(v) ? v : null;
  } catch {
    return null;
  }
}

export function useFramework(): [FrameworkId, (fw: FrameworkId) => void] {
  const [fw, setFw] = useState<FrameworkId>('react');

  useEffect(() => {
    const stored = read();
    // Adopt the persisted choice after hydration; the server always renders React.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (stored) setFw(stored);
  }, []);

  const choose = useCallback((next: FrameworkId) => {
    setFw(next);
    try {
      sessionStorage.setItem(KEY, next);
      localStorage.setItem(KEY, next);
    } catch {
      // Storage can be unavailable (private mode); the switch still works.
    }
  }, []);

  return [fw, choose];
}
