/**
 * Chart colours come from the page's CSS variables, not hex codes, so the
 * chart follows the light/dark sheet and the framework accent. ECharts draws
 * to a canvas and can't read `var(--accent)` itself, so we resolve the tokens
 * with getComputedStyle and re-read them whenever the theme flips.
 *
 * Framework-agnostic: the Vue and Svelte ports call `readChartTheme()` and
 * `subscribeChartTheme()` from their own lifecycle hooks.
 */

export interface ChartTheme {
    paper: string;
    paper2: string;
    ink: string;
    ink2: string;
    ink3: string;
    line: string;
    line2: string;
    line3: string;
    accent: string;
    accentInk: string;
    blueline: string;
    mono: string;
    reducedMotion: boolean;
}

const MONO_FALLBACK = "'IBM Plex Mono', ui-monospace, SFMono-Regular, Menlo, monospace";

/** Resolve the drafting tokens on <html> into concrete colours. */
export function readChartTheme(): ChartTheme {
    const css = getComputedStyle(document.documentElement);
    const token = (name: string) => css.getPropertyValue(name).trim();

    return {
        paper: token("--paper"),
        paper2: token("--paper-2"),
        ink: token("--ink"),
        ink2: token("--ink-2"),
        ink3: token("--ink-3"),
        line: token("--line"),
        line2: token("--line-2"),
        line3: token("--line-3"),
        accent: token("--accent"),
        accentInk: token("--accent-ink"),
        blueline: token("--blueline"),
        mono: token("--font-mono") || MONO_FALLBACK,
        reducedMotion: window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    };
}

export function sameChartTheme(a: ChartTheme, b: ChartTheme): boolean {
    return (Object.keys(a) as (keyof ChartTheme)[]).every((key) => a[key] === b[key]);
}

/**
 * Call `onChange` whenever the theme may have changed: the shell's
 * `demo:theme` window event, a class / data-framework change on <html>
 * (fallback), or a reduced-motion preference change. Returns an unsubscribe.
 */
export function subscribeChartTheme(onChange: () => void): () => void {
    const root = document.documentElement;
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const observer = new MutationObserver(onChange);

    window.addEventListener("demo:theme", onChange);
    observer.observe(root, { attributes: true, attributeFilter: ["class", "data-framework"] });
    motion.addEventListener("change", onChange);

    return () => {
        window.removeEventListener("demo:theme", onChange);
        observer.disconnect();
        motion.removeEventListener("change", onChange);
    };
}
