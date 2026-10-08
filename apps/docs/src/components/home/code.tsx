import type { ReactNode } from 'react';
import { highlight } from 'fumadocs-core/highlight';
import { draftingDark, draftingLight } from '@/lib/shiki-themes';

export type CodeLang = 'php' | 'tsx' | 'ts' | 'vue' | 'svelte' | 'blade' | 'bash';

/** A range of the source to tag with `data-part`, found by text search. */
export type CodeMark = {
  part: string;
  /** Text to find. */
  match: string;
  /** Which occurrence (0-based); defaults to the first. */
  nth?: number;
};

function offsetOf(code: string, match: string, nth = 0): number {
  let from = 0;
  for (let i = 0; i <= nth; i++) {
    const at = code.indexOf(match, from);
    if (at === -1) throw new Error(`Code mark "${match}" (#${nth}) not found`);
    if (i === nth) return at;
    from = at + match.length;
  }
  return -1;
}

/**
 * Highlight a snippet with the site's drafting themes (both modes, switched by
 * CSS variables), optionally wrapping ranges in `<span data-part>` so figures
 * can light them up. Renders a bare `<pre><code>` — the frame is the caller's.
 */
export async function Code({
  code,
  lang,
  marks = [],
}: {
  code: string;
  lang: CodeLang;
  marks?: CodeMark[];
}): Promise<ReactNode> {
  const decorations = marks.map((m) => {
    const start = offsetOf(code, m.match, m.nth);
    return {
      start,
      end: start + m.match.length,
      properties: { class: 'code__part', 'data-part': m.part },
    };
  });

  return highlight(code, {
    lang,
    themes: { light: draftingLight, dark: draftingDark },
    defaultColor: false,
    decorations,
    components: {
      pre: ({ children }) => <pre className="code__pre">{children}</pre>,
    },
  });
}
