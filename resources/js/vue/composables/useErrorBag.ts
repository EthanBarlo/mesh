import { onScopeDispose, shallowRef } from "vue";
import useWire from "./useWire";

export type ErrorBagItem = string[] | null;

export function useErrorBag() {
    const $wire = useWire();
    const errors = shallowRef($wire.__instance.snapshot.memo.errors);

    // Listen to requests, and grab the error bag from them after completion
    const unhook = $wire.$hook("commit", ({ succeed }) => {
        succeed(() => {
            // The snapshot on $wire.__instance is already parsed, so we read
            // the errors from there rather than re-parsing the commit payload.
            errors.value = $wire.__instance.snapshot.memo.errors;
        });
    });
    onScopeDispose(unhook);

    return errors;
}
