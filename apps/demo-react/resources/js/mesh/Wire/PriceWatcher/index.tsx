import React, { useEffect, useState } from "react";
import { useWire } from "@mesh/react";
import { BigNumber, Button, Panel } from "@/components/ui";
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
    // through $watch into local React state. Returning the unwatch keeps
    // StrictMode's double mount from appending each price twice.
    useEffect(() => {
        return wire.$watch("price", (value: number) => {
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

    return (
        <Panel>
            <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                    <p className="k k--caps text-ink-3">
                        {symbol} · server-side random walk
                    </p>
                    <div className="mt-1 flex items-baseline gap-3">
                        {/* Key by history length so each server tick re-renders a fresh node */}
                        <BigNumber key={history.length} className="text-4xl">
                            ${price.toFixed(2)}
                        </BigNumber>
                        {direction !== null && (
                            <span className="font-mono text-sm tabular-nums text-ink-2">
                                <span aria-hidden="true">
                                    {direction === "up" ? "▲" : "▼"}
                                </span>
                                <span className="sr-only">
                                    {direction === "up" ? "Up" : "Down"}
                                </span>{" "}
                                {Math.abs(delta).toFixed(2)}
                            </span>
                        )}
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <span className="core-status">
                        <span
                            className="core-dot"
                            data-state={paused ? "off" : "live"}
                            aria-hidden="true"
                        />
                        {paused ? "Paused" : "Every 2s"}
                    </span>
                    <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => setPaused((p) => !p)}
                        aria-pressed={paused}
                    >
                        {paused ? "Resume ticks" : "Pause ticks"}
                    </Button>
                </div>
            </div>

            <Sparkline
                className="mt-6"
                values={history}
                direction={direction}
                ariaLabel={`Sparkline of the last ${history.length} prices for ${symbol}`}
            />

            {/* Dimension line spanning the plot: how many ticks it holds. */}
            <div className="mt-2 pl-14">
                <div className="core-dim">
                    <span>
                        {history.length} of {MAX_POINTS} points
                    </span>
                </div>
            </div>

            <p className="mt-4 text-xs leading-relaxed text-ink-3">
                <code className="core-code">wire.$call("tick")</code> every 2s.{" "}
                <code className="core-code">wire.$watch("price", …)</code>{" "}
                streams each change back.
            </p>
        </Panel>
    );
};

export default PriceWatcher;
