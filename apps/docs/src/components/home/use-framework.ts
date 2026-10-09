'use client';

import { useCallback, useSyncExternalStore } from 'react';
import { type FrameworkId, frameworkIds, frameworkKey } from '@/lib/framework';

export { type FrameworkId, frameworkIds };

export const frameworkNames: Record<FrameworkId, string> = {
  react: 'React',
  vue: 'Vue',
  svelte: 'Svelte',
};

function isFramework(v: string | null): v is FrameworkId {
  return v === 'react' || v === 'vue' || v === 'svelte';
}

// Storage can be unavailable (private mode); the switch still works for the
// rest of the visit from this copy.
let memory: FrameworkId | null = null;
const listeners = new Set<() => void>();

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function getSnapshot(): FrameworkId {
  try {
    const v = sessionStorage.getItem(frameworkKey) ?? localStorage.getItem(frameworkKey);
    if (isFramework(v)) return v;
  } catch {
    // fall through to the in-memory choice
  }
  return memory ?? 'react';
}

// The server can't see storage, so the server render and the hydration pass
// get `null`: "not known yet". Components then render every variant and let
// CSS pick the one matching <html data-framework> (set before paint by
// `frameworkScript`), so a returning Vue or Svelte reader never sees React
// first. Right after hydration React re-renders with the real choice.
function getServerSnapshot(): null {
  return null;
}

export function useFramework(): [FrameworkId | null, (fw: FrameworkId) => void] {
  const fw = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const choose = useCallback((next: FrameworkId) => {
    memory = next;
    document.documentElement.setAttribute('data-framework', next);
    try {
      sessionStorage.setItem(frameworkKey, next);
      localStorage.setItem(frameworkKey, next);
    } catch {
      // see `memory`
    }
    listeners.forEach((listener) => listener());
  }, []);

  return [fw, choose];
}
