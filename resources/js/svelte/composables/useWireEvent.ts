import { onDestroy } from "svelte";
import useWire from "./useWire";

// `$wire.$on` with cleanup: listens for `name` on the component's root
// element (events dispatched from this component or bubbling up from its
// children) and calls `callback` with the event's params, like `$on` does.
// Unlike `$on`, the listener is removed when the component is destroyed,
// so an `{#if}` child doesn't leak one listener per mount.
export function useWireEvent(name: string, callback: (params: any) => void) {
    const wire = useWire();
    const el = wire.$el;
    const listener = (event: Event) => {
        callback((event as CustomEvent).detail);
    };

    el.addEventListener(name, listener);
    onDestroy(() => el.removeEventListener(name, listener));
}
