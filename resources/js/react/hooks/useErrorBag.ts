import { useEffect, useState } from "react";
import useWire from "./useWire";

export type ErrorBagItem = string[] | null;

export function useErrorBag() {
    const $wire = useWire();
    const [errors, setErrors] = useState($wire.__instance.snapshot.memo.errors);

    // Listen to requests, and grab the error bag from them after completion
    useEffect(() => {
        $wire.$hook("commit", ({ succeed }) => {
            succeed(() => {
                // The snapshot on $wire.__instance is already parsed, so we read
                // the errors from there rather than re-parsing the commit payload.
                setErrors($wire.__instance.snapshot.memo.errors);
            });
        });
    }, [$wire]);

    return errors;
}
