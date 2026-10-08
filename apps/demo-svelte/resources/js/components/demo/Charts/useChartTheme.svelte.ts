import {
    readChartTheme,
    sameChartTheme,
    subscribeChartTheme,
    type ChartTheme,
} from "./chartTheme";

/**
 * The resolved chart colours, re-read when the page theme flips.
 * A read-only `{ value }` box; call during component init (uses $effect).
 */
export function useChartTheme(): { readonly value: ChartTheme } {
    let theme = $state.raw<ChartTheme>(readChartTheme());

    $effect(() =>
        subscribeChartTheme(() => {
            const next = readChartTheme();
            // Keep the old object when nothing changed, so the option $derived holds.
            if (!sameChartTheme(theme, next)) theme = next;
        }),
    );

    return {
        get value() {
            return theme;
        },
    };
}
