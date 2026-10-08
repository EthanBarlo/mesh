import { useEffect, useState } from "react";
import {
    readChartTheme,
    sameChartTheme,
    subscribeChartTheme,
    type ChartTheme,
} from "./chartTheme";

/** The resolved chart colours, re-read when the page theme flips. */
export function useChartTheme(): ChartTheme {
    const [theme, setTheme] = useState<ChartTheme>(readChartTheme);

    useEffect(
        () =>
            subscribeChartTheme(() => {
                const next = readChartTheme();
                // Keep the old object when nothing changed, so the option memo holds.
                setTheme((current) => (sameChartTheme(current, next) ? current : next));
            }),
        [],
    );

    return theme;
}
