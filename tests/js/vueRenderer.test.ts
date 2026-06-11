// @vitest-environment happy-dom
import { describe, expect, it } from "vitest";
import { createApp, defineComponent, h, nextTick } from "vue";
import vueRenderer from "../../resources/js/vue/renderer";
import { useLivewireComponent } from "../../resources/js/vue/context";
import { mountComponent } from "../../resources/js/slots";
import type { LivewireComponent } from "../../resources/js/types";

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

describe("vueRenderer", () => {
    it("mounts a component with props", () => {
        const lw = fakeLivewire();
        const Comp = defineComponent({
            props: { label: { type: String, required: true } },
            setup: (props) => () => h("p", `hello ${props.label}`),
        });

        const rc = mountComponent(vueRenderer, lw, Comp, { label: "vue" }, {});

        expect(meshRoot(lw).textContent).toBe("hello vue");
        rc.cleanup();
    });

    it("renders the default slot HTML inside a display:contents wrapper", () => {
        const lw = fakeLivewire();
        const Comp = defineComponent({
            setup: (_, { slots }) => () => h("section", slots.default?.()),
        });

        const rc = mountComponent(vueRenderer, lw, Comp, {}, {
            default: "<strong>blade</strong>",
        });

        const wrapper = meshRoot(lw).querySelector<HTMLElement>("section > div")!;
        expect(wrapper.style.display).toBe("contents");
        expect(wrapper.innerHTML).toBe("<strong>blade</strong>");
        rc.cleanup();
    });

    it("exposes named slots as native Vue slots", () => {
        const lw = fakeLivewire();
        const Comp = defineComponent({
            setup: (_, { slots }) => () =>
                h("div", [
                    h("header", slots.header?.()),
                    h("main", slots.default?.()),
                ]),
        });

        const rc = mountComponent(vueRenderer, lw, Comp, {}, {
            default: "body",
            header: "<em>title</em>",
        });

        expect(meshRoot(lw).querySelector("header")!.textContent).toBe("title");
        expect(meshRoot(lw).querySelector("main")!.textContent).toBe("body");
        rc.cleanup();
    });

    it("re-renders in place on prop updates (no remount)", async () => {
        const lw = fakeLivewire();
        let setups = 0;
        const Comp = defineComponent({
            props: { n: { type: Number, required: true } },
            setup(props) {
                setups++;
                return () => h("p", String(props.n));
            },
        });

        const rc = mountComponent(vueRenderer, lw, Comp, { n: 1 }, {});
        rc.updateProps({ n: 2 });
        await nextTick();

        expect(meshRoot(lw).textContent).toBe("2");
        expect(setups).toBe(1);
        rc.cleanup();
    });

    it("swaps slot content on slot updates", async () => {
        const lw = fakeLivewire();
        const Comp = defineComponent({
            setup: (_, { slots }) => () => h("div", slots.default?.()),
        });

        const rc = mountComponent(vueRenderer, lw, Comp, {}, { default: "one" });
        rc.updateSlots({ default: "two" });
        await nextTick();

        expect(meshRoot(lw).textContent).toBe("two");
        rc.cleanup();
    });

    it("unmounts the app on cleanup", () => {
        const lw = fakeLivewire();
        const Comp = defineComponent({ setup: () => () => h("p", "x") });

        const rc = mountComponent(vueRenderer, lw, Comp, {}, {});
        expect(meshRoot(lw).textContent).toBe("x");

        rc.cleanup();
        expect(meshRoot(lw).textContent).toBe("");
    });

    it("provides the livewire component to useLivewireComponent", () => {
        const lw = fakeLivewire();
        let injected: unknown;
        const Comp = defineComponent({
            setup() {
                injected = useLivewireComponent();
                return () => h("p");
            },
        });

        const rc = mountComponent(vueRenderer, lw, Comp, {}, {});

        expect(injected).toBe(lw);
        rc.cleanup();
    });

    it("throws from useLivewireComponent outside a Mesh island", () => {
        const Comp = defineComponent({
            setup() {
                useLivewireComponent();
                return () => h("p");
            },
        });

        expect(() => {
            // Mount outside the Mesh renderer: nothing provides the key.
            const app = createApp(Comp);
            app.config.warnHandler = () => {};
            app.mount(document.createElement("div"));
        }).toThrow("useLivewireComponent must be used within a Mesh component");
    });
});
