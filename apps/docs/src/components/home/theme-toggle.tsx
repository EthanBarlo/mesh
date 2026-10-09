'use client';

import { Moon, Sun } from 'lucide-react';
import { flushSync } from 'react-dom';
import { useTheme } from 'fumadocs-ui/provider/base';
import { cn } from '@/lib/cn';

/**
 * Light/dark toggle for the home masthead: one square button, two cells (sun
 * and moon), the active cell inked. `useTheme` is next-themes', provided by
 * Fumadocs' RootProvider. The inked cell is drawn from the `dark` class that
 * next-themes sets on <html> before paint, so it is right on the first frame
 * and needs no mounted check.
 */
export function ThemeToggle({ className }: { className?: string }) {
  const { resolvedTheme, setTheme } = useTheme();

  const toggle = () => {
    const dark = resolvedTheme
      ? resolvedTheme === 'dark'
      : document.documentElement.classList.contains('dark');
    const next = dark ? 'light' : 'dark';

    // Same cross-fade as Fumadocs' own switch.
    if (typeof document.startViewTransition === 'function') {
      document.startViewTransition(() => flushSync(() => setTheme(next)));
    } else {
      setTheme(next);
    }
  };

  return (
    <button type="button" className={cn('mh-theme', className)} aria-label="Toggle theme" onClick={toggle}>
      <Sun className="mh-theme__cell mh-theme__cell--light" />
      <Moon className="mh-theme__cell mh-theme__cell--dark" />
    </button>
  );
}
