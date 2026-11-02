import { useEffect, useRef } from "react";
import useWire from "./useWire";

// `$wire.$on` with cleanup: listens for `name` on the component's root
// element (events dispatched from this component or bubbling up from its
// children) and calls `callback` with the event's params, like `$on` does.
// Unlike `$on`, the listener is removed when the island unmounts. The latest
// `callback` is always used, so an inline arrow doesn't resubscribe.
export function useWireEvent(name: string, callback: (params: any) => void) {
    const $wire = useWire();
    const callbackRef = useRef(callback);

    useEffect(() => {
        callbackRef.current = callback;
    });

    useEffect(() => {
        const el = $wire.$el;
        const listener = (event: Event) => {
            callbackRef.current((event as CustomEvent).detail);
        };

        el.addEventListener(name, listener);
        return () => el.removeEventListener(name, listener);
    }, [$wire, name]);
}
