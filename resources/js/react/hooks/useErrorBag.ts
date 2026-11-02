import { useEffect, useState } from "react";
import useWire from "./useWire";

export type ErrorBagItem = string[] | null;

export function useErrorBag() {
    const $wire = useWire();
    const [errors, setErrors] = useState($wire.__instance.snapshot.memo.errors);

    // Grab the error bag after each successful response. `onSync` runs right
    // after Livewire merges the new snapshot, so the bag updates in the same
    // frame as the morph. Returning the unsubscribe keeps StrictMode's double
    // mount from stacking interceptors.
    useEffect(() => {
        return $wire.$interceptMessage(({ onSuccess }) => {
            onSuccess(({ onSync }) => {
                onSync(() => {
                    // The snapshot on $wire.__instance is already parsed, so
                    // we read the errors from there.
                    setErrors($wire.__instance.snapshot.memo.errors);
                });
            });
        });
    }, [$wire]);

    return errors;
}
