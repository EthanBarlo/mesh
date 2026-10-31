import { onDestroy } from "svelte";
import useWire from "./useWire";

export type ErrorBagItem = string[] | null;

// (The `$` prefix is reserved in Svelte-compiled modules, so the wire is
// named `wire` here rather than the `$wire` used elsewhere.)
export function useErrorBag() {
    const wire = useWire();
    let errors = $state.raw(wire.__instance.snapshot.memo.errors);

    // Grab the error bag after each successful response. `onSync` runs right
    // after Livewire merges the new snapshot, so the bag updates in the same
    // frame as the morph.
    const unsubscribe = wire.$interceptMessage(({ onSuccess }) => {
        onSuccess(({ onSync }) => {
            onSync(() => {
                // The snapshot on wire.__instance is already parsed, so we
                // read the errors from there.
                errors = wire.__instance.snapshot.memo.errors;
            });
        });
    });
    onDestroy(unsubscribe);

    // Read-only box: the bag only changes when the server says so.
    return {
        get value() {
            return errors;
        },
    };
}
