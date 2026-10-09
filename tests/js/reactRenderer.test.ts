// @vitest-environment happy-dom
import { describe, expect, it, vi } from "vitest";
import { act, createElement as h, type ReactNode } from "react";
import reactRendererDescriptor, {
    createReactRenderer,
    reactRenderer,
} from "../../resources/js/react";
import defaultRenderer, {
    buildReactRenderer,
} from "../../resources/js/react/renderer";
import { useLivewireComponent } from "../../resources/js/react/context";
import { mountComponent } from "../../resources/js/slots";
import type { LivewireComponent, MeshRenderer } from "../../resources/js/types";

// Tell React this is a test environment, so act() flushes without warnings.
(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;

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

function mount(
    renderer: MeshRenderer<ReactNode>,
    Component: any,
    props: Record<string, any> = {},
    slots: Record<string, string> = {}
) {
    const lw = fakeLivewire();
    let rc!: ReturnType<typeof mountComponent>;
    act(() => {
        rc = mountComponent(renderer, lw, Component, props, slots);
    });
    return { lw, rc };
}

describe("reactRenderer", () => {
    it("mounts a component with props and slots", () => {
        const Comp = ({ label, children, slots }: any) =>
            h("section", null, [
                h("p", { key: "p" }, `hello ${label}`),
                h("header", { key: "h" }, slots.title),
                h("main", { key: "m" }, children),
            ]);

        const { lw, rc } = mount(defaultRenderer, Comp, { label: "react" }, {
            default: "<strong>blade</strong>",
            title: "T",
        });

        expect(meshRoot(lw).querySelector("p")!.textContent).toBe("hello react");
        expect(meshRoot(lw).querySelector("header")!.textContent).toBe("T");
        expect(meshRoot(lw).querySelector("main > div")!.innerHTML).toBe(
            "<strong>blade</strong>"
        );
        act(() => rc.cleanup());
        expect(meshRoot(lw).innerHTML).toBe("");
    });

    it("provides the livewire component to useLivewireComponent", () => {
        let injected: unknown;
        const Comp = () => {
            injected = useLivewireComponent();
            return null;
        };

        const { lw, rc } = mount(defaultRenderer, Comp);

        expect(injected).toBe(lw);
        act(() => rc.cleanup());
    });

    it("renders in StrictMode by default", () => {
        // Development StrictMode renders each component twice.
        const render = vi.fn(() => null);

        const { rc } = mount(buildReactRenderer(), render);

        expect(render).toHaveBeenCalledTimes(2);
        act(() => rc.cleanup());
    });

    it("skips StrictMode with strictMode: false", () => {
        const render = vi.fn(() => null);

        const { rc } = mount(buildReactRenderer({ strictMode: false }), render);

        expect(render).toHaveBeenCalledTimes(1);
        act(() => rc.cleanup());
    });

    it("wraps every island with `wrap`, inside the Livewire context", () => {
        const seen: unknown[] = [];
        const Provider = ({ children }: { children: ReactNode }) => {
            // The wrapper can use the Mesh hooks.
            seen.push(useLivewireComponent());
            return h("div", { className: "provider" }, children);
        };
        const wrap = vi.fn((node: ReactNode) => h(Provider, null, node));
        const Comp = ({ n }: { n: number }) => h("p", null, String(n));

        const { lw, rc } = mount(
            buildReactRenderer({ wrap, strictMode: false }),
            Comp,
            { n: 1 }
        );

        expect(meshRoot(lw).querySelector(".provider > p")!.textContent).toBe(
            "1"
        );
        expect(wrap).toHaveBeenCalledWith(expect.anything(), {
            livewireComponent: lw,
        });
        expect(seen).toEqual([lw]);

        // Runs again on every render.
        act(() => rc.updateProps({ n: 2 }));
        expect(meshRoot(lw).querySelector(".provider > p")!.textContent).toBe(
            "2"
        );
        expect(wrap).toHaveBeenCalledTimes(2);
        act(() => rc.cleanup());
    });
});

describe("@mesh/react exports", () => {
    it("exports a lazy descriptor as the default and named renderer", () => {
        expect(reactRendererDescriptor).toBe(reactRenderer);
        expect(reactRendererDescriptor.type).toBe("react");
        expect(reactRendererDescriptor.load).toBeTypeOf("function");
        expect("mount" in reactRendererDescriptor).toBe(false);
    });

    it("createReactRenderer's load() builds a renderer with the options", async () => {
        const wrap = vi.fn((node: ReactNode) => h("div", { className: "w" }, node));
        const descriptor = createReactRenderer({ wrap, strictMode: false });

        const renderer = await descriptor.load();
        expect(renderer.type).toBe("react");

        const render = vi.fn(() => h("p", null, "x"));
        const { lw, rc } = mount(renderer, render);

        expect(meshRoot(lw).querySelector(".w > p")!.textContent).toBe("x");
        expect(render).toHaveBeenCalledTimes(1);
        act(() => rc.cleanup());
    });
});
