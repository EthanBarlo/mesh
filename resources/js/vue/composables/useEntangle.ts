import { onScopeDispose, shallowRef, watch, type Ref } from "vue";
import { snapshot } from "../../utils";
import useWire from "./useWire";

// Two-way binding to a Livewire property, as a writable ref.
//
// The watch is shallow: replace the value (objects included), don't mutate it
// in place — mutations of nested fields won't sync. Inbound objects/arrays are
// snapshotted: Livewire patches them in place, so the reference it hands us
// never changes and the shallowRef would not trigger.
export function useEntangle<T = string>(
    key: string,
    live: boolean = false
): Ref<T> {
    const wire = useWire();

    const value = shallowRef(snapshot(wire.$get(key))) as Ref<T>;

    // The value the last $watch assignment put in the ref, until the outbound
    // watch has seen it. A snapshot is never identical to what Livewire holds,
    // so this is what marks an assignment as inbound.
    const none = Symbol();
    let inbound: T | typeof none = none;

    // Keep our ref in sync with the livewire property
    const unwatch = wire.$watch(key, (next: T) => {
        value.value = inbound = snapshot(next);
    });
    onScopeDispose(unwatch);

    // Update the livewire property when our ref changes. The guard breaks the
    // echo: a server-driven $watch assignment lands here with the inbound
    // snapshot (or, for a primitive, the value Livewire already holds), so it
    // must not be $set back (which would trigger another request in live mode).
    watch(value, (next) => {
        const fromServer = next === inbound;
        inbound = none;

        if (!fromServer && next !== wire.$get(key)) {
            wire.$set(key, next, live);
        }
    });

    return value;
}
