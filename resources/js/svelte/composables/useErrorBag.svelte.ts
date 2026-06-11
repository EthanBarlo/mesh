import { onDestroy } from "svelte";
import useWire from "./useWire";

export type ErrorBagItem = string[] | null;

// (The `$` prefix is reserved in Svelte-compiled modules, so the wire is
// named `wire` here rather than the `$wire` used elsewhere.)
export function useErrorBag() {
    const wire = useWire();
    let errors = $state.raw(wire.__instance.snapshot.memo.errors);

    // Listen to requests, and grab the error bag from them after completion
    const unhook = wire.$hook(
        "commit",
        ({ succeed }: { succeed: (cb: () => void) => void }) => {
            succeed(() => {
                // The snapshot on wire.__instance is already parsed, so we read
                // the errors from there rather than re-parsing the commit payload.
                errors = wire.__instance.snapshot.memo.errors;
            });
        }
    );
    onDestroy(unhook);

    // Read-only box: the bag only changes when the server says so.
    return {
        get value() {
            return errors;
        },
    };
}
