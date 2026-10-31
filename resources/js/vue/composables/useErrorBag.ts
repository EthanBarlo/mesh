import { onScopeDispose, shallowRef } from "vue";
import useWire from "./useWire";

export type ErrorBagItem = string[] | null;

export function useErrorBag() {
    const $wire = useWire();
    const errors = shallowRef($wire.__instance.snapshot.memo.errors);

    // Grab the error bag after each successful response. `onSync` runs right
    // after Livewire merges the new snapshot, so the bag updates in the same
    // frame as the morph.
    const unsubscribe = $wire.$interceptMessage(({ onSuccess }) => {
        onSuccess(({ onSync }) => {
            onSync(() => {
                // The snapshot on $wire.__instance is already parsed, so we
                // read the errors from there.
                errors.value = $wire.__instance.snapshot.memo.errors;
            });
        });
    });
    onScopeDispose(unsubscribe);

    return errors;
}
