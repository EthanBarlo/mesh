'use client';

import { useEffect, useRef, useState } from 'react';
import { CheckIcon, CopyIcon } from './icons';

/** The portfolio's copy stamp: Copy → Copied, with a polite live status. */
export function CopyButton({ text, label }: { text: string; label: string }) {
  const [done, setDone] = useState(false);
  const timer = useRef(0);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  async function copy() {
    let ok = false;
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
        ok = true;
      }
    } catch {
      ok = false;
    }
    if (!ok) {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.setAttribute('readonly', '');
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      try {
        ok = document.execCommand('copy');
      } catch {
        ok = false;
      }
      ta.remove();
    }
    if (!ok) return;
    setDone(true);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setDone(false), 1800);
  }

  return (
    <>
      <button type="button" className={done ? 'copy is-done' : 'copy'} onClick={copy} aria-label={label}>
        <span className="copy__icons" aria-hidden="true">
          <CopyIcon size={14} className="copy__idle" />
          <CheckIcon size={14} className="copy__done" />
        </span>
        <span className="copy__label">{done ? 'Copied' : 'Copy'}</span>
      </button>
      <span className="vh" aria-live="polite">
        {done ? 'Copied to clipboard' : ''}
      </span>
    </>
  );
}
