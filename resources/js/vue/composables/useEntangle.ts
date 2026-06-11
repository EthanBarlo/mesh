import { onScopeDispose, ref, watch, type Ref } from "vue";
import useWire from "./useWire";

// Two-way binding to a Livewire property, as a writable ref.
//
// The watch is shallow: replace the value (objects included), don't mutate it
// in place — mutations of nested fields won't sync.
export function useEntangle<T = string>(
    key: string,
    live: boolean = false
): Ref<T> {
    const wire = useWire();

    const value = ref(wire.$get(key)) as Ref<T>;

    // Keep our ref in sync with the livewire property
    const unwatch = wire.$watch(key, (next: T) => {
        value.value = next;
    });
    onScopeDispose(unwatch);

    // Update the livewire property when our ref changes. The guard breaks the
    // echo: a server-driven $watch assignment lands here with a value that is
    // already what Livewire holds, so it must not be $set back (which would
    // trigger another request in live mode).
    watch(value, (next) => {
        if (next !== wire.$get(key)) {
            wire.$set(key, next, live);
        }
    });

    return value;
}
