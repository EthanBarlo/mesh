import React, { useEffect, useRef, useState } from "react";
import { BigNumber, Eyebrow, Panel } from "@/components/ui";

interface HelloIslandProps {
    greeting: string;
    chunkNote: string;
}

/**
 * A deliberately tiny component. Its only job is to prove it just mounted:
 * the ticker starts at 0.0s the moment the chunk arrives and the component
 * renders for the first time.
 */
const HelloIsland: React.FC<HelloIslandProps> = ({ greeting, chunkNote }) => {
    const mountedAt = useRef<number>(Date.now());
    const [elapsed, setElapsed] = useState(0);

    useEffect(() => {
        const id = window.setInterval(() => {
            setElapsed((Date.now() - mountedAt.current) / 1000);
        }, 100);
        return () => window.clearInterval(id);
    }, []);

    return (
        <Panel className="flex flex-col gap-5 sm:flex-row sm:items-center">
            <div className="min-w-0 flex-1">
                <Eyebrow>Architecture/HelloIsland</Eyebrow>
                <h3 className="mt-1.5 text-xl font-semibold tracking-tight text-ink">{greeting}</h3>
                <p className="mt-1 text-sm leading-relaxed text-ink-2">{chunkNote}</p>
            </div>

            {/* The ticker is the island's one accent: proof it just mounted. */}
            <div className="shrink-0 border-t border-line-2 pt-4 sm:border-t-0 sm:border-l sm:pt-0 sm:pl-6 sm:text-right">
                <BigNumber className="text-3xl text-accent-ink">{elapsed.toFixed(1)}s</BigNumber>
                <div className="k k--caps mt-1 text-ink-3">Since mount</div>
            </div>
        </Panel>
    );
};

export default HelloIsland;
