// @vitest-environment happy-dom
import { describe, expect, it } from "vitest";
import { flushSync, mount, unmount } from "svelte";
import svelteRenderer from "../../resources/js/svelte/renderer.svelte";
import { useLivewireComponent } from "../../resources/js/svelte/context";
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
