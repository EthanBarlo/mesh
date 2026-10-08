import React from "react";
import { useEntangle } from "@mesh/react";

interface CounterProps {
    initialCount: number;
}

// Card C on the home page. It shares the `.ctr` drafting card markup (home.css)
// with the two Livewire cards, so all three read as one drawing.
const Counter: React.FC<CounterProps> = ({ initialCount }) => {
    // Deferred (lazy) entangle: clicks write to the shared client-side
    // Livewire store, so the Alpine card follows instantly with zero
    // network requests — the server hears about it piggybacked on the
    // next Livewire round-trip (e.g. the Pure Livewire card's buttons).
    const [count, setCount] = useEntangle<number>("count");

    return (
        <div className="ctr ctr--mesh" data-kind="mesh">
            <div className="ctr__head">
                <span className="tag ctr__tag">C</span>
                <p className="ctr__title">
                    <span className="ctr__name">Mesh + React</span>
                    <span className="ctr__via">useEntangle('count')</span>
                </p>
            </div>

            <div className="ctr__body">
                <span className="ctr__value">{count}</span>
                <span className="ctr__k k k--caps">$count</span>
            </div>

            <div className="ctr__actions">
                <button
                    type="button"
                    className="btn btn--line ctr__btn"
                    onClick={() => setCount(count - 1)}
                    aria-label="Decrement counter"
                >
                    −
                </button>

                <button
                    type="button"
                    className="btn ctr__reset"
                    onClick={() => setCount(initialCount)}
                    aria-label="Reset counter"
                >
                    Reset
                </button>

                <button
                    type="button"
                    className="btn btn--solid ctr__btn"
                    onClick={() => setCount(count + 1)}
                    aria-label="Increment counter"
                >
                    +
                </button>
            </div>
        </div>
    );
};

export default Counter;
