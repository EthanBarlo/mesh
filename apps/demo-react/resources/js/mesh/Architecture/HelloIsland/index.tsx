import React, { useEffect, useRef, useState } from "react";

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
        <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-3xl blur-xl opacity-20 group-hover:opacity-30 transition-opacity duration-500" />

            <div className="relative p-6 rounded-2xl bg-slate-800/80 border border-white/10 backdrop-blur-xl flex flex-col sm:flex-row sm:items-center gap-5">
                <div className="flex-1">
                    <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400">
                        Architecture/HelloIsland
                    </span>
                    <h3 className="mt-1 text-xl font-bold text-white">{greeting}</h3>
                    <p className="mt-1 text-sm text-slate-400 leading-relaxed">{chunkNote}</p>
                </div>

                <div className="shrink-0 px-5 py-4 rounded-xl bg-slate-900/70 border border-white/10 text-center">
                    <div className="text-3xl font-bold tabular-nums text-transparent bg-clip-text bg-gradient-to-b from-white to-slate-400">
                        {elapsed.toFixed(1)}s
                    </div>
                    <div className="mt-1 text-[11px] font-medium uppercase tracking-wider text-slate-500">
                        since mount
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HelloIsland;
