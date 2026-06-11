import React, { useEffect, useState } from "react";
import { useWire } from "@mesh/react";
import { Button, Eyebrow, Panel } from "@/components/ui";
import Sparkline from "@/components/demo/Wire/Sparkline";

interface PriceWatcherProps {
    symbol: string;
    initialPrice: number;
}

const MAX_POINTS = 40;

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

    const priceColor =
        direction === "up" ? "text-emerald-400" : direction === "down" ? "text-rose-400" : "text-white";

    return (
        <Panel>
            <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                    <Eyebrow>{symbol} · server-side random walk</Eyebrow>
                    <div className="mt-1 flex items-baseline gap-3">
                        {/* Key by history length so each server tick re-renders a fresh node */}
                        <span
                            key={history.length}
                            className={`text-4xl font-semibold tracking-tight tabular-nums transition-colors duration-300 ${priceColor}`}
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

                <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setPaused((p) => !p)}
                    aria-pressed={paused}
                >
                    {paused ? "Resume ticks" : "Pause ticks"}
                </Button>
            </div>

            <Sparkline
                className="mt-4"
                values={history}
                direction={direction}
                ariaLabel={`Sparkline of the last ${history.length} prices for ${symbol}`}
            />

            <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs text-zinc-500">
                <span>
                    Low <span className="text-zinc-300 tabular-nums">${min.toFixed(2)}</span> · High{" "}
                    <span className="text-zinc-300 tabular-nums">${max.toFixed(2)}</span> · {history.length} points
                </span>
                <span>
                    <code className="font-mono text-zinc-400">wire.$call("tick")</code> every 2s ·{" "}
                    <code className="font-mono text-zinc-400">wire.$watch("price", …)</code> streams it back
                </span>
            </div>
        </Panel>
    );
};

export default PriceWatcher;
