import React from "react";
import { useEntangle } from "@mesh/react";
import { BigNumber, Button, Eyebrow, GlowCard } from "@/components/ui";

interface CounterProps {
    initialCount: number;
}

const Counter: React.FC<CounterProps> = ({ initialCount }) => {
    // Deferred (lazy) entangle: clicks write to the shared client-side
    // Livewire store, so the Alpine card follows instantly with zero
    // network requests — the server hears about it piggybacked on the
    // next Livewire round-trip (e.g. the Pure Livewire card's buttons).
    const [count, setCount] = useEntangle<number>("count");

    return (
        <GlowCard contentClassName="p-8">
            <div className="text-center">
                <Eyebrow className="mb-4 block">React Counter</Eyebrow>

                <div className="my-6">
                    <BigNumber className="text-7xl">{count}</BigNumber>
                </div>

                <div className="flex items-center justify-center gap-3">
                    <Button
                        variant="secondary"
                        size="icon"
                        onClick={() => setCount(count - 1)}
                        aria-label="Decrement counter"
                    >
                        -
                    </Button>

                    <Button
                        variant="ghost"
                        className="px-5 h-14"
                        onClick={() => setCount(initialCount)}
                        aria-label="Reset counter"
                    >
                        Reset
                    </Button>

                    <Button
                        variant="primary"
                        size="icon"
                        onClick={() => setCount(count + 1)}
                        aria-label="Increment counter"
                    >
                        +
                    </Button>
                </div>
            </div>
        </GlowCard>
    );
};

export default Counter;
