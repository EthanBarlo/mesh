// @vitest-environment happy-dom
import { describe, expect, it, vi } from "vitest";
import { flushSync, mount, unmount } from "svelte";
import { LivewireComponentKey } from "../../resources/js/svelte/context";
import { useEntangle } from "../../resources/js/svelte/composables/useEntangle.svelte";
import { useErrorBag } from "../../resources/js/svelte/composables/useErrorBag.svelte";
import { useWireEvent } from "../../resources/js/svelte/composables/useWireEvent";
import useWire from "../../resources/js/svelte/composables/useWire";
import type { LivewireComponent } from "../../resources/js/types";
import Harness from "./fixtures/Harness.svelte";

// Fake $wire backed by a plain store. Mirrors the real semantics the
// composables rely on: $set lands in the store (Livewire's reactive state),
// and a server push updates the store BEFORE the $watch callback fires.
function fakeWire(initial: Record<string, any> = {}, errors: any = {}) {
    const store: Record<string, any> = { ...initial };
    const watchers: Record<string, (value: any) => void> = {};
    let interceptor: ((context: any) => void) | undefined;
    const unwatch = vi.fn();
    const uninterceptMessage = vi.fn();

    const $wire: any = {
        $get: vi.fn((key: string) => store[key]),
        $set: vi.fn((key: string, value: any) => {
            store[key] = value;
        }),
        $watch: vi.fn((key: string, cb: (value: any) => void) => {
            watchers[key] = cb;
            return unwatch;
        }),
        $interceptMessage: vi.fn((cb: (context: any) => void) => {
            interceptor = cb;
            return uninterceptMessage;
        }),
        $el: document.createElement("div"),
    };
    $wire.__instance = { snapshot: { memo: { errors } }, $wire };

    const serverPush = (key: string, value: any) => {
        store[key] = value;
        watchers[key]?.(value);
    };

    // A successful round-trip, in Livewire's order: the message interceptor
    // registers its onSuccess stages, the new snapshot is merged, then the
    // onSync callback runs.
    const commit = (nextErrors: any) => {
        let synced: (() => void) | undefined;
        interceptor?.({
            onSuccess: (success: (context: any) => void) =>
                success({ onSync: (done: () => void) => (synced = done) }),
        });
        $wire.__instance.snapshot.memo.errors = nextErrors;
        synced?.();
    };

    return { $wire, store, watchers, unwatch, uninterceptMessage, serverPush, commit };
}

// Run a composable inside a mounted Mesh-like island (the livewire component
// provided via mount()'s context Map) and return its result plus an unmount
// handle.
function withSetup<T>($wire: any, composable: () => T) {
    let result!: T;
    const app = mount(Harness, {
        target: document.createElement("div"),
        props: {
            run: () => {
                result = composable();
            },
        },
        context: new Map([
            [
                LivewireComponentKey,
                { $wire } as unknown as LivewireComponent,
            ],
        ]),
    });
    // Flush the initial render: unmount only runs onDestroy teardown once the
    // component's effect tree has actually been created.
    flushSync();
    return { result, unmount: () => unmount(app) };
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

    it("does not $set on mount", () => {
        const { $wire } = fakeWire({ count: 7 });
        withSetup($wire, () => useEntangle<number>("count"));
        flushSync();

        expect($wire.$set).not.toHaveBeenCalled();
    });

    it("updates the box on a server push without echoing a $set back", () => {
        const wire = fakeWire({ count: 1 });
        const { result } = withSetup(wire.$wire, () =>
            useEntangle<number>("count")
        );

        wire.serverPush("count", 5);
        flushSync();

        expect(result.value).toBe(5);
        expect(wire.$wire.$set).not.toHaveBeenCalled();
    });

    it("sends exactly one deferred $set on a user write", () => {
        const wire = fakeWire({ count: 1 });
        const { result } = withSetup(wire.$wire, () =>
            useEntangle<number>("count")
        );

        result.value = 2;
        flushSync();

        expect(wire.$wire.$set).toHaveBeenCalledTimes(1);
        expect(wire.$wire.$set).toHaveBeenCalledWith("count", 2, false);
    });

    it("passes live=true through to $set", () => {
        const wire = fakeWire({ q: "" });
        const { result } = withSetup(wire.$wire, () =>
            useEntangle<string>("q", true)
        );

        result.value = "mesh";
        flushSync();

        expect(wire.$wire.$set).toHaveBeenCalledWith("q", "mesh", true);
    });

    it("unsubscribes the livewire watcher when the component is destroyed", () => {
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

    it("refreshes the bag once the new snapshot is synced", () => {
        const wire = fakeWire({}, {});
        const { result } = withSetup(wire.$wire, () => useErrorBag());

        wire.commit({ email: ["Invalid"] });

        expect(result.value).toEqual({ email: ["Invalid"] });
    });

    it("removes its message interceptor when the component is destroyed", () => {
        const wire = fakeWire();
        const { unmount } = withSetup(wire.$wire, () => useErrorBag());

        expect(wire.uninterceptMessage).not.toHaveBeenCalled();
        unmount();
        expect(wire.uninterceptMessage).toHaveBeenCalledTimes(1);
    });
});

describe("useWireEvent", () => {
    const dispatch = (el: HTMLElement, name: string, detail: any) =>
        el.dispatchEvent(new CustomEvent(name, { bubbles: true, detail }));

    it("calls the callback with the event's params", () => {
        const { $wire } = fakeWire();
        const callback = vi.fn();
        withSetup($wire, () => useWireEvent("saved", callback));

        dispatch($wire.$el, "saved", { id: 1 });

        expect(callback).toHaveBeenCalledTimes(1);
        expect(callback).toHaveBeenCalledWith({ id: 1 });
    });

    it("hears events bubbling up from inside the component", () => {
        const { $wire } = fakeWire();
        const child = $wire.$el.appendChild(document.createElement("span"));
        const callback = vi.fn();
        withSetup($wire, () => useWireEvent("saved", callback));

        dispatch(child, "saved", ["a"]);

        expect(callback).toHaveBeenCalledWith(["a"]);
    });

    it("removes the listener when the component is destroyed", () => {
        const { $wire } = fakeWire();
        const callback = vi.fn();
        const { unmount } = withSetup($wire, () =>
            useWireEvent("saved", callback)
        );

        unmount();
        dispatch($wire.$el, "saved", {});

        expect(callback).not.toHaveBeenCalled();
    });
});
