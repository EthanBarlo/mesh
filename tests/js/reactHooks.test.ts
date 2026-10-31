// @vitest-environment happy-dom
import { describe, expect, it, vi } from "vitest";
import { act, createElement as h, StrictMode } from "react";
import { createRoot } from "react-dom/client";
import LivewireContext from "../../resources/js/react/context";
import { useEntangle } from "../../resources/js/react/hooks/useEntangle";
import { useErrorBag } from "../../resources/js/react/hooks/useErrorBag";
import { useWireEvent } from "../../resources/js/react/hooks/useWireEvent";
import type { LivewireComponent } from "../../resources/js/types";

// Tell React this is a test environment, so act() flushes without warnings.
(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;

// Fake $wire backed by a plain store. Mirrors the real semantics the hooks
// rely on:
// - $set lands in the store (Livewire's reactive state);
// - a server push updates the store BEFORE the $watch callback fires;
// - $watch also fires for local writes, a microtask later (Alpine.watch);
// - $watch and $interceptMessage return a function that removes the listener.
// The live listener sets let the tests count what is still subscribed.
function fakeWire(initial: Record<string, any> = {}, errors: any = {}) {
    const store: Record<string, any> = { ...initial };
    const watchers = new Map<string, Set<(value: any) => void>>();
    const interceptors = new Set<(context: any) => void>();

    const notify = (key: string, value: any) => {
        for (const cb of [...(watchers.get(key) ?? [])]) cb(value);
    };

    const unwatch = vi.fn();
    const uninterceptMessage = vi.fn();

    const $wire: any = {
        $get: vi.fn((key: string) => store[key]),
        $set: vi.fn((key: string, value: any) => {
            store[key] = value;
            queueMicrotask(() => notify(key, value));
            return Promise.resolve();
        }),
        $watch: vi.fn((key: string, cb: (value: any) => void) => {
            if (!watchers.has(key)) watchers.set(key, new Set());
            watchers.get(key)!.add(cb);
            return () => {
                unwatch(key);
                watchers.get(key)!.delete(cb);
            };
        }),
        $interceptMessage: vi.fn((cb: (context: any) => void) => {
            interceptors.add(cb);
            return () => {
                uninterceptMessage();
                interceptors.delete(cb);
            };
        }),
        $el: document.createElement("div"),
    };
    $wire.__instance = { snapshot: { memo: { errors } }, $wire };

    const activeWatchers = (key: string) => watchers.get(key)?.size ?? 0;
    const activeInterceptors = () => interceptors.size;

    const serverPush = (key: string, value: any) => {
        store[key] = value;
        notify(key, value);
    };

    // A successful round-trip, in Livewire's order: each message interceptor
    // registers its onSuccess stages, the new snapshot is merged, then the
    // onSync callbacks run.
    const commit = (nextErrors: any) => {
        const synced: Array<() => void> = [];
        for (const cb of [...interceptors]) {
            cb({
                onSuccess: (success: (context: any) => void) =>
                    success({ onSync: (done: () => void) => synced.push(done) }),
            });
        }
        $wire.__instance.snapshot.memo.errors = nextErrors;
        synced.forEach((done) => done());
    };

    return {
        $wire,
        store,
        unwatch,
        uninterceptMessage,
        activeWatchers,
        activeInterceptors,
        serverPush,
        commit,
    };
}

// Render a hook inside a Mesh-like island: StrictMode around the Livewire
// context provider, exactly as the React renderer mounts components.
function renderHook<P extends object, R>(
    $wire: any,
    hook: (props: P) => R,
    initialProps: P
) {
    const result = { current: undefined as unknown as R };
    const livewire = { $wire } as unknown as LivewireComponent;

    function Probe(props: P) {
        result.current = hook(props);
        return null;
    }

    const root = createRoot(document.createElement("div"));
    const render = (props: P) =>
        act(() => {
            root.render(
                h(
                    StrictMode,
                    null,
                    h(LivewireContext.Provider, { value: livewire }, h(Probe, props))
                )
            );
        });

    render(initialProps);

    return {
        result,
        rerender: render,
        unmount: () => act(() => root.unmount()),
    };
}

// Let queued microtasks (the fake $watch's local-write notifications) run,
// and flush the React updates they cause.
const flush = () => act(async () => {});

type EntangleProps = { name: string; live?: boolean };
const entangle = <T>({ name, live }: EntangleProps) => useEntangle<T>(name, live);

describe("useEntangle", () => {
    it("initializes from wire.$get", () => {
        const wire = fakeWire({ count: 7 });
        const { result } = renderHook(wire.$wire, entangle<number>, {
            name: "count",
        });

        expect(wire.$wire.$get).toHaveBeenCalledWith("count");
        expect(result.current[0]).toBe(7);
    });

    it.each([false, true])("does not $set on mount (live: %s)", async (live) => {
        const wire = fakeWire({ count: 7 });
        renderHook(wire.$wire, entangle<number>, { name: "count", live });
        await flush();

        expect(wire.$wire.$set).not.toHaveBeenCalled();
    });

    it("updates state on a server push without echoing a $set back", async () => {
        const wire = fakeWire({ count: 1 });
        const { result } = renderHook(wire.$wire, entangle<number>, {
            name: "count",
            live: true,
        });

        act(() => wire.serverPush("count", 5));
        await flush();

        expect(result.current[0]).toBe(5);
        expect(wire.$wire.$set).not.toHaveBeenCalled();
    });

    it.each([
        ["object", { count: 5 }],
        ["array", [1, 2, 3]],
    ])("keeps a server-pushed %s without a live write back", async (_kind, next) => {
        const wire = fakeWire({ value: null });
        const { result } = renderHook(wire.$wire, entangle<typeof next>, {
            name: "value",
            live: true,
        });

        act(() => wire.serverPush("value", next));
        await flush();

        expect(result.current[0]).toBe(next);
        expect(wire.$wire.$set).not.toHaveBeenCalled();
    });

    it("sends exactly one deferred $set on a user write", async () => {
        const wire = fakeWire({ count: 1 });
        const { result } = renderHook(wire.$wire, entangle<number>, {
            name: "count",
        });

        act(() => result.current[1](2));
        // The local write also fires $watch; that must not loop back.
        await flush();

        expect(result.current[0]).toBe(2);
        expect(wire.$wire.$set).toHaveBeenCalledTimes(1);
        expect(wire.$wire.$set).toHaveBeenCalledWith("count", 2, false);
    });

    it("passes live=true through to $set", async () => {
        const wire = fakeWire({ q: "" });
        const { result } = renderHook(wire.$wire, entangle<string>, {
            name: "q",
            live: true,
        });

        act(() => result.current[1]("mesh"));
        await flush();

        expect(wire.$wire.$set).toHaveBeenCalledTimes(1);
        expect(wire.$wire.$set).toHaveBeenCalledWith("q", "mesh", true);
    });

    it("resolves updater functions against the current value", async () => {
        const wire = fakeWire({ count: 1 });
        const { result } = renderHook(wire.$wire, entangle<number>, {
            name: "count",
        });

        act(() => {
            const setCount = result.current[1];
            setCount((c) => c + 1);
            setCount((c) => c + 1);
        });
        await flush();

        expect(result.current[0]).toBe(3);
        expect(wire.$wire.$set.mock.calls).toEqual([
            ["count", 2, false],
            ["count", 3, false],
        ]);
    });

    it("skips the $set when the value matches what Livewire holds", async () => {
        const wire = fakeWire({ count: 7 });
        const { result } = renderHook(wire.$wire, entangle<number>, {
            name: "count",
            live: true,
        });

        act(() => result.current[1](7));
        await flush();

        expect(result.current[0]).toBe(7);
        expect(wire.$wire.$set).not.toHaveBeenCalled();
    });

    it("still sends a user write that follows a server push", async () => {
        const wire = fakeWire({ count: 1 });
        const { result } = renderHook(wire.$wire, entangle<number>, {
            name: "count",
            live: true,
        });

        act(() => wire.serverPush("count", 5));
        act(() => result.current[1]((c) => c + 1));
        await flush();

        expect(result.current[0]).toBe(6);
        expect(wire.$wire.$set).toHaveBeenCalledTimes(1);
        expect(wire.$wire.$set).toHaveBeenCalledWith("count", 6, true);
    });

    it("leaves one watcher after StrictMode's double mount, none after unmount", () => {
        const wire = fakeWire({ count: 1 });
        const { unmount } = renderHook(wire.$wire, entangle<number>, {
            name: "count",
        });

        // StrictMode ran the effect twice; the first watcher was removed.
        expect(wire.$wire.$watch).toHaveBeenCalledTimes(2);
        expect(wire.activeWatchers("count")).toBe(1);

        unmount();
        expect(wire.activeWatchers("count")).toBe(0);
        expect(wire.unwatch).toHaveBeenCalledTimes(2);
    });

    it("moves the watcher and reseeds when the key changes", async () => {
        const wire = fakeWire({ a: "first", b: "second" });
        const { result, rerender } = renderHook(wire.$wire, entangle<string>, {
            name: "a",
        });

        rerender({ name: "b" });

        expect(wire.activeWatchers("a")).toBe(0);
        expect(wire.activeWatchers("b")).toBe(1);
        expect(result.current[0]).toBe("second");

        act(() => wire.serverPush("a", "ignored"));
        expect(result.current[0]).toBe("second");

        act(() => result.current[1]("third"));
        await flush();

        expect(wire.$wire.$set).toHaveBeenCalledTimes(1);
        expect(wire.$wire.$set).toHaveBeenCalledWith("b", "third", false);
    });
});

describe("useErrorBag", () => {
    const errorBag = () => useErrorBag();

    it("reads the initial error bag from the snapshot", () => {
        const wire = fakeWire({}, { name: ["Required"] });
        const { result } = renderHook(wire.$wire, errorBag, {});

        expect(result.current).toEqual({ name: ["Required"] });
    });

    it("refreshes the bag once the new snapshot is synced", () => {
        const wire = fakeWire({}, {});
        const { result } = renderHook(wire.$wire, errorBag, {});

        act(() => wire.commit({ email: ["Invalid"] }));

        expect(result.current).toEqual({ email: ["Invalid"] });
    });

    it("leaves one interceptor after StrictMode's double mount, none after unmount", () => {
        const wire = fakeWire();
        const { unmount } = renderHook(wire.$wire, errorBag, {});

        expect(wire.$wire.$interceptMessage).toHaveBeenCalledTimes(2);
        expect(wire.activeInterceptors()).toBe(1);

        unmount();
        expect(wire.activeInterceptors()).toBe(0);
        expect(wire.uninterceptMessage).toHaveBeenCalledTimes(2);
    });
});

describe("useWireEvent", () => {
    type WireEventProps = { name: string; callback: (params: any) => void };
    const wireEvent = ({ name, callback }: WireEventProps) =>
        useWireEvent(name, callback);

    const dispatch = (el: HTMLElement, name: string, detail: any) =>
        el.dispatchEvent(new CustomEvent(name, { bubbles: true, detail }));

    it("calls the callback with the event's params, once per event", () => {
        const wire = fakeWire();
        const callback = vi.fn();
        renderHook(wire.$wire, wireEvent, { name: "saved", callback });

        // StrictMode mounted twice; only one listener may remain.
        dispatch(wire.$wire.$el, "saved", { id: 1 });

        expect(callback).toHaveBeenCalledTimes(1);
        expect(callback).toHaveBeenCalledWith({ id: 1 });
    });

    it("hears events bubbling up from inside the component", () => {
        const wire = fakeWire();
        const child = wire.$wire.$el.appendChild(document.createElement("span"));
        const callback = vi.fn();
        renderHook(wire.$wire, wireEvent, { name: "saved", callback });

        dispatch(child, "saved", ["a"]);

        expect(callback).toHaveBeenCalledWith(["a"]);
    });

    it("uses the latest callback without resubscribing", () => {
        const wire = fakeWire();
        const add = vi.spyOn(wire.$wire.$el, "addEventListener");
        const first = vi.fn();
        const second = vi.fn();
        const { rerender } = renderHook(wire.$wire, wireEvent, {
            name: "saved",
            callback: first,
        });
        const subscriptions = add.mock.calls.length;

        rerender({ name: "saved", callback: second });
        dispatch(wire.$wire.$el, "saved", {});

        expect(add).toHaveBeenCalledTimes(subscriptions);
        expect(first).not.toHaveBeenCalled();
        expect(second).toHaveBeenCalledTimes(1);
    });

    it("moves the listener when the event name changes", () => {
        const wire = fakeWire();
        const callback = vi.fn();
        const { rerender } = renderHook(wire.$wire, wireEvent, {
            name: "saved",
            callback,
        });

        rerender({ name: "deleted", callback });
        dispatch(wire.$wire.$el, "saved", {});
        dispatch(wire.$wire.$el, "deleted", {});

        expect(callback).toHaveBeenCalledTimes(1);
    });

    it("removes the listener on unmount", () => {
        const wire = fakeWire();
        const callback = vi.fn();
        const { unmount } = renderHook(wire.$wire, wireEvent, {
            name: "saved",
            callback,
        });

        unmount();
        dispatch(wire.$wire.$el, "saved", {});

        expect(callback).not.toHaveBeenCalled();
    });
});
