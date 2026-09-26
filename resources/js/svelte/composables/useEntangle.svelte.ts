import { onDestroy } from "svelte";
import useWire from "./useWire";

// Two-way binding to a Livewire property, as a writable `{ value }` box
// (bind with `bind:value={x.value}`).
//
// The state is shallow ($state.raw): replace the value (objects included),
// don't mutate it in place — mutations of nested fields won't sync.
export function useEntangle<T = string>(
    key: string,
    live: boolean = false
): { value: T } {
    const wire = useWire();

    let value = $state.raw(wire.$get(key)) as T;

    // Keep our state in sync with the livewire property
    const unwatch = wire.$watch(key, (next: T) => {
        value = next;
    });
    onDestroy(unwatch);

    return {
        get value() {
            return value;
        },
        // Update the livewire property when the box is written to. Nothing is
        // $set on mount (only explicit writes land here), and the guard breaks
        // the echo: a server-driven $watch assignment never re-enters this
        // setter, and a write that matches what Livewire already holds must
        // not be $set back (which would trigger another request in live mode).
        set value(next: T) {
            value = next;
            if (next !== wire.$get(key)) {
                wire.$set(key, next, live);
            }
        },
    };
}
