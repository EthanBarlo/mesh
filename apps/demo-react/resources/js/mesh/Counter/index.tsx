import React from "react";
import { useEntangle } from "@mesh/react";
import { BigNumber, Button, Eyebrow, GlowCard } from "@/components/ui";

interface CounterProps {
    initialCount: number;
}

const Counter: React.FC<CounterProps> = ({ initialCount }) => {
    // live: each click syncs immediately, so the sibling Livewire and Alpine
    // counters on the page update in real time.
    const [count, setCount] = useEntangle<number>("count", true);

    return (
        <GlowCard
            glow="from-cyan-500 to-blue-500"
            glowClassName="opacity-25 group-hover:opacity-40"
            contentClassName="p-8"
        >
            <div className="text-center">
                <Eyebrow className="mb-4 block">React Counter</Eyebrow>

                <div className="my-6">
                    <BigNumber className="text-7xl">{count}</BigNumber>
                </div>

                <div className="flex items-center justify-center gap-3">
                    <Button
                        variant="secondary"
                        size="icon"
                        className="focus:ring-cyan-500 focus:ring-offset-slate-800"
                        onClick={() => setCount(count - 1)}
                        aria-label="Decrement counter"
                    >
                        -
                    </Button>

                    <Button
                        variant="ghost"
                        className="px-5 h-14 focus:ring-offset-slate-800"
                        onClick={() => setCount(initialCount)}
                        aria-label="Reset counter"
                    >
                        Reset
                    </Button>

                    <Button
                        variant="accent"
                        size="icon"
                        className="font-medium focus:ring-offset-slate-800"
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
