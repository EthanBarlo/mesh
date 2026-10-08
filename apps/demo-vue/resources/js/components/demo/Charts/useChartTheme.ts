import { onMounted, onUnmounted, shallowRef, type Ref } from "vue";
import {
    readChartTheme,
    sameChartTheme,
    subscribeChartTheme,
    type ChartTheme,
} from "./chartTheme";

/** The resolved chart colours, re-read when the page theme flips. */
export function useChartTheme(): Readonly<Ref<ChartTheme>> {
    const theme = shallowRef<ChartTheme>(readChartTheme());

    let unsubscribe: (() => void) | undefined;

    onMounted(() => {
        unsubscribe = subscribeChartTheme(() => {
            const next = readChartTheme();
            // Keep the old object when nothing changed, so the option computed holds.
            if (!sameChartTheme(theme.value, next)) theme.value = next;
        });
    });

    onUnmounted(() => {
        unsubscribe?.();
        unsubscribe = undefined;
    });

    return theme;
}
