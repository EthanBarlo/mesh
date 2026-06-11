// @vitest-environment happy-dom
import { describe, expect, it, vi } from "vitest";
import { createApp, defineComponent, h, nextTick } from "vue";
import { LivewireComponentKey } from "../../resources/js/vue/context";
import { useEntangle } from "../../resources/js/vue/composables/useEntangle";
import { useErrorBag } from "../../resources/js/vue/composables/useErrorBag";
import useWire from "../../resources/js/vue/composables/useWire";
import type { LivewireComponent } from "../../resources/js/types";

// Fake $wire backed by a plain store. Mirrors the real semantics the
// composables rely on: $set lands in the store (Livewire's reactive state),
// and a server push updates the store BEFORE the $watch callback fires.
function fakeWire(initial: Record<string, any> = {}, errors: any = {}) {
    const store: Record<string, any> = { ...initial };
    const watchers: Record<string, (value: any) => void> = {};
    const hooks: Record<string, (params: any) => void> = {};
    const unwatch = vi.fn();
    const unhook = vi.fn();

    const $wire: any = {
        $get: vi.fn((key: string) => store[key]),
        $set: vi.fn((key: string, value: any) => {
            store[key] = value;
        }),
        $watch: vi.fn((key: string, cb: (value: any) => void) => {
            watchers[key] = cb;
            return unwatch;
        }),
        $hook: vi.fn((name: string, cb: (params: any) => void) => {
            hooks[name] = cb;
            return unhook;
        }),
    };
    $wire.__instance = { snapshot: { memo: { errors } }, $wire };

    const serverPush = (key: string, value: any) => {
        store[key] = value;
        watchers[key]?.(value);
    };

    return { $wire, store, watchers, hooks, unwatch, unhook, serverPush };
}

// Run a composable inside a mounted Mesh-like island (app-level provide of
// the livewire component) and return its result plus an unmount handle.
function withSetup<T>($wire: any, composable: () => T) {
    let result!: T;
    const app = createApp(
        defineComponent({
            setup() {
                result = composable();
                return () => h("div");
            },
        })
    );
    app.provide(LivewireComponentKey, {
        $wire,
    } as unknown as LivewireComponent);
    app.mount(document.createElement("div"));
    return { result, unmount: () => app.unmount() };
}

describe("useWire", () => {
    it("returns the $wire of the providing livewire component", () => {
        const { $wire } = fakeWire();
        const { result } = withSetup($wire, () => useWire());

        expect(result).toBe($wire);
    });
});

describe("useEntangle", () => {
    it("initializes from wire.$get", () => {
        const { $wire } = fakeWire({ count: 7 });
        const { result } = withSetup($wire, () => useEntangle<number>("count"));

        expect($wire.$get).toHaveBeenCalledWith("count");
        expect(result.value).toBe(7);
    });

    it("does not $set on mount", async () => {
        const { $wire } = fakeWire({ count: 7 });
        withSetup($wire, () => useEntangle<number>("count"));
        await nextTick();

        expect($wire.$set).not.toHaveBeenCalled();
    });

    it("updates the ref on a server push without echoing a $set back", async () => {
        const wire = fakeWire({ count: 1 });
        const { result } = withSetup(wire.$wire, () =>
            useEntangle<number>("count")
        );

        wire.serverPush("count", 5);
        await nextTick();

        expect(result.value).toBe(5);
        expect(wire.$wire.$set).not.toHaveBeenCalled();
    });

    it("sends exactly one deferred $set on a user write", async () => {
        const wire = fakeWire({ count: 1 });
        const { result } = withSetup(wire.$wire, () =>
            useEntangle<number>("count")
        );

        result.value = 2;
        await nextTick();

        expect(wire.$wire.$set).toHaveBeenCalledTimes(1);
        expect(wire.$wire.$set).toHaveBeenCalledWith("count", 2, false);
    });

    it("passes live=true through to $set", async () => {
        const wire = fakeWire({ q: "" });
        const { result } = withSetup(wire.$wire, () =>
            useEntangle<string>("q", true)
        );

        result.value = "mesh";
        await nextTick();

        expect(wire.$wire.$set).toHaveBeenCalledWith("q", "mesh", true);
    });

    it("unsubscribes the livewire watcher when the scope is disposed", () => {
        const wire = fakeWire({ count: 1 });
        const { unmount } = withSetup(wire.$wire, () =>
            useEntangle<number>("count")
        );

        expect(wire.unwatch).not.toHaveBeenCalled();
        unmount();
        expect(wire.unwatch).toHaveBeenCalledTimes(1);
    });
});

describe("useErrorBag", () => {
    it("reads the initial error bag from the snapshot", () => {
        const wire = fakeWire({}, { name: ["Required"] });
        const { result } = withSetup(wire.$wire, () => useErrorBag());

        expect(result.value).toEqual({ name: ["Required"] });
    });

    it("refreshes the bag after a successful commit", () => {
        const wire = fakeWire({}, {});
        const { result } = withSetup(wire.$wire, () => useErrorBag());

        wire.$wire.__instance.snapshot.memo.errors = { email: ["Invalid"] };
        // Simulate Livewire's commit hook: succeed(cb) runs cb after the
        // round-trip completes and the snapshot has been swapped in.
        wire.hooks.commit({ succeed: (cb: () => void) => cb() });

        expect(result.value).toEqual({ email: ["Invalid"] });
    });

    it("unhooks when the scope is disposed", () => {
        const wire = fakeWire();
        const { unmount } = withSetup(wire.$wire, () => useErrorBag());

        unmount();
        expect(wire.unhook).toHaveBeenCalledTimes(1);
    });
});
