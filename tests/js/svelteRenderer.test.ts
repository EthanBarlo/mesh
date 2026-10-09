// @vitest-environment happy-dom
import { describe, expect, it, vi } from "vitest";
import { flushSync, getContext, mount, unmount } from "svelte";
import svelteRenderer, {
    buildSvelteRenderer,
} from "../../resources/js/svelte/renderer.svelte";
import svelteDescriptor, {
    createSvelteRenderer,
    svelteRenderer as namedSvelteDescriptor,
} from "../../resources/js/svelte";
import {
    LivewireComponentKey,
    useLivewireComponent,
} from "../../resources/js/svelte/context";
import { mountComponent } from "../../resources/js/slots";
import type { LivewireComponent } from "../../resources/js/types";
import PropsEcho from "./fixtures/PropsEcho.svelte";
import SlotEcho from "./fixtures/SlotEcho.svelte";
import NamedSlots from "./fixtures/NamedSlots.svelte";
import Harness from "./fixtures/Harness.svelte";

// Real DOM fixture: the driver resolves `.mesh-root` from the component el.
function fakeLivewire(): LivewireComponent {
    const el = document.createElement("div");
    const root = document.createElement("div");
    root.className = "mesh-root";
    el.appendChild(root);
    document.body.appendChild(el);

    return { el, $wire: { marker: "wire" } } as unknown as LivewireComponent;
}

const meshRoot = (lw: LivewireComponent) =>
    lw.el.querySelector<HTMLElement>(".mesh-root")!;

describe("svelteRenderer", () => {
    it("mounts a component with props", () => {
        const lw = fakeLivewire();

        const rc = mountComponent(
            svelteRenderer,
            lw,
            PropsEcho,
            { label: "svelte" },
            {}
        );
        flushSync();

        expect(meshRoot(lw).textContent).toBe("hello svelte");
        rc.cleanup();
    });

    it("renders the default slot HTML inside a display:contents wrapper", () => {
        const lw = fakeLivewire();

        const rc = mountComponent(svelteRenderer, lw, SlotEcho, {}, {
            default: "<strong>blade</strong>",
        });
        flushSync();

        const wrapper = meshRoot(lw).querySelector<HTMLElement>("section > div")!;
        expect(wrapper.style.display).toBe("contents");
        expect(wrapper.innerHTML).toBe("<strong>blade</strong>");
        rc.cleanup();
    });

    it("exposes named slots via the slots prop", () => {
        const lw = fakeLivewire();

        const rc = mountComponent(svelteRenderer, lw, NamedSlots, {}, {
            default: "body",
            header: "<em>title</em>",
        });
        flushSync();

        expect(meshRoot(lw).querySelector("header")!.textContent).toBe("title");
        expect(meshRoot(lw).querySelector("main")!.textContent).toBe("body");
        rc.cleanup();
    });

    it("passes no children snippet when the default slot is whitespace-only", () => {
        const lw = fakeLivewire();

        const rc = mountComponent(svelteRenderer, lw, NamedSlots, {}, {
            default: "\n  \n",
            header: "T",
        });
        flushSync();

        expect(meshRoot(lw).querySelector("header")!.textContent).toBe("T");
        expect(meshRoot(lw).querySelector("main")!.children).toHaveLength(0);
        rc.cleanup();
    });

    it("re-renders in place on prop updates (no remount)", () => {
        const lw = fakeLivewire();
        let inits = 0;

        const rc = mountComponent(
            svelteRenderer,
            lw,
            PropsEcho,
            { label: "one", onInit: () => inits++ },
            {}
        );
        rc.updateProps({ label: "two", onInit: () => inits++ });
        flushSync();

        expect(meshRoot(lw).textContent).toBe("hello two");
        expect(inits).toBe(1);
        rc.cleanup();
    });

    it("swaps slot content on slot updates", () => {
        const lw = fakeLivewire();

        const rc = mountComponent(svelteRenderer, lw, SlotEcho, {}, {
            default: "one",
        });
        rc.updateSlots({ default: "two" });
        flushSync();

        expect(meshRoot(lw).textContent).toBe("two");
        rc.cleanup();
    });

    it("unmounts the component on cleanup", () => {
        const lw = fakeLivewire();

        const rc = mountComponent(
            svelteRenderer,
            lw,
            PropsEcho,
            { label: "x" },
            {}
        );
        flushSync();
        expect(meshRoot(lw).textContent).toBe("hello x");

        rc.cleanup();
        expect(meshRoot(lw).textContent).toBe("");
    });

    it("provides the livewire component to useLivewireComponent", () => {
        const lw = fakeLivewire();
        let injected: unknown;

        const rc = mountComponent(
            svelteRenderer,
            lw,
            Harness,
            { run: () => (injected = useLivewireComponent()) },
            {}
        );

        expect(injected).toBe(lw);
        rc.cleanup();
    });

    it("throws from useLivewireComponent outside a Mesh island", () => {
        expect(() => {
            // Mount outside the Mesh renderer: nothing provides the key.
            const app = mount(Harness, {
                target: document.createElement("div"),
                props: { run: () => useLivewireComponent() },
            });
            unmount(app);
        }).toThrow("useLivewireComponent must be used within a Mesh component");
    });
});

describe("svelte renderer options", () => {
    it("merges `context` into each island's mount context", () => {
        const lw = fakeLivewire();
        const context = vi.fn(() => new Map([["theme", "dark"]]));
        let theme: unknown;
        let injected: unknown;

        const rc = mountComponent(
            buildSvelteRenderer({ context }),
            lw,
            Harness,
            {
                run: () => {
                    theme = getContext("theme");
                    injected = useLivewireComponent();
                },
            },
            {}
        );

        expect(context).toHaveBeenCalledWith({ livewireComponent: lw });
        expect(theme).toBe("dark");
        expect(injected).toBe(lw);
        rc.cleanup();
    });

    it("keeps the Livewire component even if `context` reuses its key", () => {
        const lw = fakeLivewire();
        let injected: unknown;

        const rc = mountComponent(
            buildSvelteRenderer({
                // Simulates a clash; the Mesh key must still win.
                context: () => new Map([[LivewireComponentKey, "other"]]),
            }),
            lw,
            Harness,
            { run: () => (injected = useLivewireComponent()) },
            {}
        );

        expect(injected).toBe(lw);
        rc.cleanup();
    });

    it("exports a lazy descriptor as the default and named renderer", () => {
        expect(svelteDescriptor).toBe(namedSvelteDescriptor);
        expect(svelteDescriptor.type).toBe("svelte");
        expect("mount" in svelteDescriptor).toBe(false);
    });

    it("createSvelteRenderer's load() builds a renderer with the options", async () => {
        const lw = fakeLivewire();
        let theme: unknown;

        const renderer = await createSvelteRenderer({
            context: () => new Map([["theme", "light"]]),
        }).load();
        expect(renderer.type).toBe("svelte");

        const rc = mountComponent(
            renderer,
            lw,
            Harness,
            { run: () => (theme = getContext("theme")) },
            {}
        );

        expect(theme).toBe("light");
        rc.cleanup();
    });
});
