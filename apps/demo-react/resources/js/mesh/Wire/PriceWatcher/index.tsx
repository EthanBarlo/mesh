import React, { useEffect, useState } from "react";
import { useWire } from "@mesh/react";

interface PriceWatcherProps {
    symbol: string;
    initialPrice: number;
}

const MAX_POINTS = 40;
const W = 600;
const H = 120;
const PAD = 6;

const PriceWatcher: React.FC<PriceWatcherProps> = ({ symbol, initialPrice }) => {
    const wire = useWire();

    const [history, setHistory] = useState<number[]>([initialPrice]);
    const [paused, setPaused] = useState(false);

    // Inbound: the server owns `price` — every change it makes flows
    // through $watch into local React state.
    useEffect(() => {
        wire.$watch("price", (value: number) => {
            setHistory((prev) => [...prev, value].slice(-MAX_POINTS));
        });
    }, [wire]);

    // Outbound: all React does is schedule the next server-side tick.
    // The interval is cleared on unmount (and while paused).
    useEffect(() => {
        if (paused) return;
        const id = window.setInterval(() => {
            void wire.$call("tick");
        }, 2000);
        return () => window.clearInterval(id);
    }, [wire, paused]);

    const price = history[history.length - 1];
    const previous = history.length > 1 ? history[history.length - 2] : null;
    const direction = previous === null ? null : price >= previous ? "up" : "down";
    const delta = previous === null ? 0 : price - previous;

    const min = Math.min(...history);
    const max = Math.max(...history);
    const range = max - min || 1;

    const coords = history.map((p, i) => {
        const x = history.length > 1 ? PAD + (i / (history.length - 1)) * (W - PAD * 2) : W / 2;
        const y = PAD + (1 - (p - min) / range) * (H - PAD * 2);
        return [x, y] as const;
    });
    const points = coords.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(" ");
    const area = `${PAD},${H - PAD} ${points} ${(W - PAD).toFixed(1)},${H - PAD}`;
    const [lastX, lastY] = coords[coords.length - 1];

    const priceColor =
        direction === "up" ? "text-emerald-400" : direction === "down" ? "text-rose-400" : "text-white";

    return (
        <div className="p-5 rounded-2xl bg-slate-800/60 border border-white/10">
            <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                    <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                        {symbol} · server-side random walk
                    </span>
                    <div className="mt-1 flex items-baseline gap-3">
                        {/* Key by history length so each server tick re-renders a fresh node */}
                        <span
                            key={history.length}
                            className={`text-4xl font-bold tabular-nums transition-colors duration-300 ${priceColor}`}
                        >
                            ${price.toFixed(2)}
                        </span>
                        {direction !== null && (
                            <span
                                className={`text-sm font-semibold tabular-nums ${
                                    direction === "up" ? "text-emerald-400" : "text-rose-400"
                                }`}
                            >
                                {direction === "up" ? "▲" : "▼"} {Math.abs(delta).toFixed(2)}
                            </span>
                        )}
                    </div>
                </div>

                <button
                    type="button"
                    onClick={() => setPaused((p) => !p)}
                    className="px-4 h-10 rounded-xl bg-slate-700/50 border border-white/10 text-sm font-medium text-white hover:bg-slate-700 hover:border-white/20 active:scale-95 transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 focus:ring-offset-slate-900"
                    aria-pressed={paused}
                >
                    {paused ? "Resume ticks" : "Pause ticks"}
                </button>
            </div>

            {/* Hand-rolled sparkline — no chart library, just a polyline */}
            <svg
                viewBox={`0 0 ${W} ${H}`}
                preserveAspectRatio="none"
                className="mt-4 w-full h-28"
                role="img"
                aria-label={`Sparkline of the last ${history.length} prices for ${symbol}`}
            >
                <defs>
                    <linearGradient id="price-watcher-stroke" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor="#22d3ee" />
                        <stop offset="100%" stopColor="#3b82f6" />
                    </linearGradient>
                    <linearGradient id="price-watcher-fill" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.25" />
                        <stop offset="100%" stopColor="#22d3ee" stopOpacity="0" />
                    </linearGradient>
                </defs>
                <polygon points={area} fill="url(#price-watcher-fill)" />
                <polyline
                    points={points}
                    fill="none"
                    stroke="url(#price-watcher-stroke)"
                    strokeWidth="2.5"
                    strokeLinejoin="round"
                    strokeLinecap="round"
                    vectorEffect="non-scaling-stroke"
                />
                <circle
                    cx={lastX}
                    cy={lastY}
                    r="4"
                    fill={direction === "down" ? "#fb7185" : "#34d399"}
                    stroke="#0f172a"
                    strokeWidth="2"
                />
            </svg>

            <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
                <span>
                    Low <span className="text-slate-300 tabular-nums">${min.toFixed(2)}</span> · High{" "}
                    <span className="text-slate-300 tabular-nums">${max.toFixed(2)}</span> · {history.length} points
                </span>
                <span>
                    <code className="text-cyan-300">wire.$call("tick")</code> every 2s ·{" "}
                    <code className="text-cyan-300">wire.$watch("price", …)</code> streams it back
                </span>
            </div>
        </div>
    );
};

export default PriceWatcher;
