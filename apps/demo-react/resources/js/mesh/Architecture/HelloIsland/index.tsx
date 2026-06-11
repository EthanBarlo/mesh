import React, { useEffect, useRef, useState } from "react";
import { BigNumber, Eyebrow, GlowCard } from "@/components/ui";

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
        <GlowCard contentClassName="p-6 flex flex-col sm:flex-row sm:items-center gap-5">
            <div className="flex-1">
                <Eyebrow>Architecture/HelloIsland</Eyebrow>
                <h3 className="mt-1 text-xl font-semibold tracking-tight text-white">{greeting}</h3>
                <p className="mt-1 text-sm text-zinc-400 leading-relaxed">{chunkNote}</p>
            </div>

            <div className="shrink-0 px-5 py-4 rounded-xl bg-white/[0.02] border border-white/5 text-center">
                <BigNumber className="text-3xl">{elapsed.toFixed(1)}s</BigNumber>
                <div className="mt-1 text-[11px] font-medium uppercase tracking-widest text-zinc-500">
                    since mount
                </div>
            </div>
        </GlowCard>
    );
};

export default HelloIsland;
