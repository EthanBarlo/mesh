import {
    useCallback,
    useEffect,
    useState,
    type Dispatch,
    type SetStateAction,
} from "react";
import useWire from "./useWire";

// Two-way binding to a Livewire property, as a `useState`-style pair.
//
// Only the returned setter writes to Livewire, and only when the new value
// differs (`!==`) from what Livewire already holds. Nothing is $set on mount,
// and a server-driven $watch update goes straight into React state, so it is
// never echoed back (which would send another request in live mode).
//
// The comparison is by identity: replace the value (objects included), don't
// mutate it in place.
export function useEntangle<T = string>(
    key: string,
    live: boolean = false
): [T, Dispatch<SetStateAction<T>>] {
    const wire = useWire();

    const [value, setValue] = useState<T>(() => wire.$get(key));

    // Inbound: keep our React state in sync with the Livewire property.
    // Reseeding after subscribing catches a change that landed between render
    // and subscribe, and a new `key`. Returning the unwatch keeps StrictMode's
    // double mount and `key` changes from stacking watchers.
    useEffect(() => {
        const unwatch = wire.$watch(key, (next: T) => {
            setValue(next);
        });
        setValue(wire.$get(key));

        return unwatch;
    }, [wire, key]);

    // Outbound: write through to Livewire. React state mirrors what Livewire
    // holds, so an updater function is resolved against `$get(key)`.
    const setEntangled = useCallback<Dispatch<SetStateAction<T>>>(
        (action) => {
            const current: T = wire.$get(key);
            const next =
                typeof action === "function"
                    ? (action as (prev: T) => T)(current)
                    : action;

            setValue(next);

            if (next !== current) {
                void wire.$set(key, next, live);
            }
        },
        [wire, key, live]
    );

    return [value, setEntangled];
}
