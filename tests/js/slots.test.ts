import { describe, expect, it, vi } from "vitest";
import { getProps, stripFragmentMarkers } from "../../resources/js/utils";
import {
    assertNoReservedProps,
    mountComponent,
    prepareSlots,
} from "../../resources/js/slots";
import type {
    LivewireComponent,
    MeshRenderer,
    PreparedSlots,
    RenderContext,
} from "../../resources/js/types";

// Markers mirror Livewire's Slot::toHtml() output: a FRAGMENT opening comment
// and an ENDFRAGMENT closing comment wrap the slot content.
const open = (meta: string) => `<!--[if FRAGMENT:${meta}]><![endif]-->`;
const close = (meta: string) => `<!--[if ENDFRAGMENT:${meta}]><![endif]-->`;
const meta = "name=default|type=slot|id=abc|token=123|mode=morph";

describe("stripFragmentMarkers", () => {
    it("strips a wrapping FRAGMENT/ENDFRAGMENT pair, leaving the inner HTML", () => {
        const html = `${open(meta)}Hello <strong>x</strong>${close(meta)}`;

        expect(stripFragmentMarkers(html)).toBe("Hello <strong>x</strong>");
    });

    it("leaves HTML without markers untouched", () => {
        expect(stripFragmentMarkers("<p>plain</p>")).toBe("<p>plain</p>");
    });

    it("returns an empty string when only markers are present", () => {
        expect(stripFragmentMarkers(`${open(meta)}${close(meta)}`)).toBe("");
    });

    it("strips multiple marker pairs", () => {
        const titleMeta = "name=title|type=slot|id=abc|token=456|mode=morph";
        const html =
            `${open(titleMeta)}T${close(titleMeta)}` +
            `${open(meta)}body${close(meta)}`;

        expect(stripFragmentMarkers(html)).toBe("Tbody");
    });

    it("strips markers for named slots regardless of metadata", () => {
        const namedMeta = "name=footer|type=slot|id=xyz|token=789|mode=skip";
        const html = `${open(namedMeta)}<a href="#">link</a>${close(namedMeta)}`;

        expect(stripFragmentMarkers(html)).toBe('<a href="#">link</a>');
    });
});

describe("getProps", () => {
    // getProps only touches el.dataset.meshProps, so a stub object suffices.
    const el = (meshProps?: string) =>
        ({ dataset: { meshProps } } as unknown as HTMLElement);

    it("parses the data-mesh-props JSON", () => {
        expect(getProps(el('{"a":1}'))).toEqual({ a: 1 });
    });

    it("normalizes a missing attribute to {}", () => {
        expect(getProps(el(undefined))).toEqual({});
        expect(getProps(el(""))).toEqual({});
    });

    it("normalizes malformed JSON to {} (and logs)", () => {
        const error = vi
            .spyOn(console, "error")
            .mockImplementation(() => {});

        expect(getProps(el("{not json"))).toEqual({});
        expect(error).toHaveBeenCalled();

        error.mockRestore();
    });
});

// Stub slot renderer: returns a marker object so node identity and call order
// are assertable without a DOM or a framework.
const mark = (html: string, name: string) => ({ html, name });

describe("prepareSlots", () => {
    it("renders the default slot into children", () => {
        const p = prepareSlots({ default: "<p>hi</p>" }, mark);

        expect(p.children).toEqual({ html: "<p>hi</p>", name: "default" });
        expect(p.named).toEqual({});
        expect(p.hasNamed).toBe(false);
    });

    it("drops an empty default slot (children undefined)", () => {
        expect(prepareSlots({ default: "" }, mark).children).toBeUndefined();
    });

    it("returns undefined children when no default key is present", () => {
        expect(prepareSlots({ title: "T" }, mark).children).toBeUndefined();
    });

    it("keeps named slots even when empty (not filtered)", () => {
        const p = prepareSlots({ title: "", footer: "f" }, mark);

        expect(p.named).toEqual({
            title: { html: "", name: "title" },
            footer: { html: "f", name: "footer" },
        });
        expect(p.hasNamed).toBe(true);
    });

    it("derives hasNamed from the count of named entries, ignoring default", () => {
        expect(prepareSlots({ default: "x" }, mark).hasNamed).toBe(false);
        expect(prepareSlots({}, mark).hasNamed).toBe(false);
        expect(prepareSlots({ a: "1" }, mark).hasNamed).toBe(true);
    });

    it("calls renderSlot once per slot with (html, name)", () => {
        const spy = vi.fn(mark);

        prepareSlots({ default: "d", title: "t" }, spy);

        expect(spy).toHaveBeenCalledTimes(2);
        expect(spy).toHaveBeenCalledWith("d", "default");
        expect(spy).toHaveBeenCalledWith("t", "title");
    });

    it("does not call renderSlot for an empty default", () => {
        const spy = vi.fn(mark);

        prepareSlots({ default: "" }, spy);

        expect(spy).not.toHaveBeenCalled();
    });
});

describe("assertNoReservedProps", () => {
    const prep = (over: Partial<PreparedSlots<unknown>> = {}): PreparedSlots<unknown> => ({
        children: undefined,
        named: {},
        hasNamed: false,
        ...over,
    });

    it("does nothing when no slots are present", () => {
        expect(() =>
            assertNoReservedProps({ children: 1, slots: 2 }, prep())
        ).not.toThrow();
    });

    it("throws the children message when a default slot collides with a `children` prop", () => {
        expect(() =>
            assertNoReservedProps({ children: 1 }, prep({ children: mark("d", "default") }))
        ).toThrow(
            "Mesh: `children` is reserved for slot content — rename the prop from props()."
        );
    });

    it("throws the children message when named slots collide with a `children` prop", () => {
        expect(() =>
            assertNoReservedProps({ children: 1 }, prep({ hasNamed: true }))
        ).toThrow("`children` is reserved for slot content");
    });

    it("throws the slots message when named slots collide with a `slots` prop", () => {
        expect(() =>
            assertNoReservedProps({ slots: 1 }, prep({ hasNamed: true }))
        ).toThrow(
            "Mesh: `slots` is reserved for named slot content — rename the prop from props()."
        );
    });

    it("does not throw on a `slots` prop when only the default slot is present", () => {
        expect(() =>
            assertNoReservedProps({ slots: 1 }, prep({ children: mark("d", "default") }))
        ).not.toThrow();
    });

    it("checks `children` before `slots` when both collide", () => {
        expect(() =>
            assertNoReservedProps({ children: 1, slots: 1 }, prep({ hasNamed: true }))
        ).toThrow("`children` is reserved");
    });
});

describe("mountComponent", () => {
    type Mark = { html: string; name: string };

    // Fake livewire component: the driver only needs `.el` to resolve
    // `.mesh-root`, so a stubbed querySelector suffices — no DOM required.
    const meshRoot = {} as HTMLElement;
    const livewire = {
        el: { querySelector: () => meshRoot },
    } as unknown as LivewireComponent;

    // Fake renderer recording every mount/update context.
    const fakeRenderer = () => {
        const mounts: any[] = [];
        const contexts: RenderContext<Mark>[] = [];
        const cleanup = vi.fn();
        const renderer: MeshRenderer<Mark> = {
            type: "fake",
            renderSlot: mark,
            mount: (args) => {
                mounts.push(args);
                contexts.push(args.ctx);
                return { update: (ctx) => contexts.push(ctx), cleanup };
            },
        };
        return { renderer, mounts, contexts, cleanup };
    };

    it("mounts once with the resolved root and initial context, then updates", () => {
        const { renderer, mounts, contexts } = fakeRenderer();
        const rc = mountComponent(renderer, livewire, "C", { a: 1 }, { default: "d" });

        expect(mounts).toHaveLength(1);
        expect(mounts[0].el).toBe(meshRoot);
        expect(mounts[0].livewireComponent).toBe(livewire);
        expect(mounts[0].Component).toBe("C");
        expect(contexts[0].props).toEqual({ a: 1 });
        expect(contexts[0].slots.children).toEqual({ html: "d", name: "default" });

        rc.updateProps({ a: 2 });
        rc.updateSlots({ default: "d", title: "t" });

        expect(mounts).toHaveLength(1); // never re-mounted
        expect(contexts).toHaveLength(3);
    });

    it("dirty-checks props: an unchanged props object is a no-op", () => {
        const { renderer, contexts } = fakeRenderer();
        const rc = mountComponent(renderer, livewire, "C", { a: 1 }, {});

        rc.updateProps({ a: 1 }); // same value, different object

        expect(contexts).toHaveLength(1); // mount only, no update
    });

    it("keeps stable slot references across a props-only update", () => {
        const { renderer, contexts } = fakeRenderer();
        const rc = mountComponent(renderer, livewire, "C", { a: 1 }, { default: "d" });

        rc.updateProps({ a: 2 });

        // updateProps must NOT re-prepare slots: same node reference is reused.
        expect(contexts[1].slots.children).toBe(contexts[0].slots.children);
        expect(contexts[1].props).toEqual({ a: 2 });
    });

    it("re-prepares slots on updateSlots", () => {
        const { renderer, contexts } = fakeRenderer();
        const rc = mountComponent(renderer, livewire, "C", {}, { default: "d" });

        rc.updateSlots({ default: "d2" });

        expect(contexts[1].slots.children).toEqual({ html: "d2", name: "default" });
        expect(contexts[1].slots.children).not.toBe(contexts[0].slots.children);
    });

    it("runs the reserved-prop guard on mount and on every update", () => {
        expect(() =>
            mountComponent(fakeRenderer().renderer, livewire, "C", { children: 9 }, { default: "d" })
        ).toThrow("`children` is reserved");

        const rc = mountComponent(fakeRenderer().renderer, livewire, "C", {}, { default: "d" });
        expect(() => rc.updateProps({ children: 9 })).toThrow(
            "`children` is reserved"
        );
    });

    it("runs the guard on updateSlots when slots newly collide with a prop", () => {
        // A `children` prop is fine while there are no slots…
        const rc = mountComponent(fakeRenderer().renderer, livewire, "C", { children: 9 }, {});

        // …but a later slot update introducing a default slot must throw.
        expect(() => rc.updateSlots({ default: "d" })).toThrow(
            "`children` is reserved"
        );
    });

    it("does not commit state from a failed update (retries are not dirty-checked away)", () => {
        const { renderer, contexts } = fakeRenderer();
        const rc = mountComponent(renderer, livewire, "C", { a: 1 }, { default: "d" });

        expect(() => rc.updateProps({ children: 9 })).toThrow();
        // The bad props were NOT adopted as the dirty-check baseline:
        // the identical retry throws again instead of silently no-oping.
        expect(() => rc.updateProps({ children: 9 })).toThrow();

        // A failed updateSlots keeps the previously rendered slots, so a
        // following props-only update does not render never-applied slots.
        const failing = mountComponent(fakeRenderer().renderer, livewire, "C", { children: 9 }, {});
        expect(() => failing.updateSlots({ default: "d" })).toThrow();

        rc.updateProps({ a: 2 });
        expect(contexts.at(-1)!.slots.children).toBe(contexts[0].slots.children);
    });

    it("throws when no .mesh-root element exists", () => {
        const rootless = {
            el: { querySelector: () => null },
        } as unknown as LivewireComponent;

        expect(() =>
            mountComponent(fakeRenderer().renderer, rootless, "C", {}, {})
        ).toThrow("Mesh root element not found");
    });

    it("delegates cleanup to the renderer handle", () => {
        const { renderer, cleanup } = fakeRenderer();
        const rc = mountComponent(renderer, livewire, "C", {}, {});

        rc.cleanup();

        expect(cleanup).toHaveBeenCalledTimes(1);
    });
});
