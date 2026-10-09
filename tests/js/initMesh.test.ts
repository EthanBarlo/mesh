// @vitest-environment happy-dom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { MockInstance } from "vitest";
import initMesh from "../../resources/js/initMesh";
import type {
    GlobResult,
    LazyMeshRenderer,
    MeshRenderer,
} from "../../resources/js/types";

// A fake Livewire that records the hooks Mesh registers, so tests can drive
// `component.init` (and the cleanup Livewire runs on teardown) by hand.
function fakeLivewire() {
    const hooks: Record<string, (params: any) => any> = {};
    return {
        hook: (name: string, callback: (params: any) => any) => {
            hooks[name] = callback;
        },
        hooks,
    };
}

// A Mesh component's root as the Blade view renders it, plus the Livewire
// component object and its cleanup registry.
function island(id: string, livewireId: string) {
    const el = document.createElement("div");
    el.dataset.meshComponent = id;
    el.dataset.meshProps = JSON.stringify({ label: id });
    const root = document.createElement("div");
    root.className = "mesh-root";
    el.appendChild(root);
    document.body.appendChild(el);

    const cleanups: Array<() => void> = [];
    return {
        component: { id: livewireId, el },
        cleanup: (fn: () => void) => cleanups.push(fn),
        teardown: () => cleanups.forEach((fn) => fn()),
        root,
    };
}

// A renderer that writes the component's label into the root, with spies on
// mount and on the handle's cleanup.
function fakeRenderer(type = "fake"): MeshRenderer<string> & {
    unmount: ReturnType<typeof vi.fn>;
} {
    const unmount = vi.fn();
    return {
        type,
        renderSlot: (html) => html,
        mount: vi.fn(({ el, ctx }) => {
            el.textContent = "mounted " + ctx.props.label;
            return { update: vi.fn(), cleanup: unmount };
        }),
        unmount,
    };
}

const Component = { name: "Fake" };
const source = (...ids: string[]): GlobResult =>
    Object.fromEntries(
        ids.map((id) => [
            "/vendor/acme/resources/js/mesh/" + id + "/index.fake",
            () => Promise.resolve({ default: Component }),
        ])
    );

// Run Livewire's component.init for an island and wait for it to settle.
const init = (lw: ReturnType<typeof fakeLivewire>, i: ReturnType<typeof island>) =>
    lw.hooks["component.init"]({ component: i.component, cleanup: i.cleanup });

let error: MockInstance;
let warn: MockInstance;
beforeEach(() => {
    error = vi.spyOn(console, "error").mockImplementation(() => {});
    warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    document.body.innerHTML = "";
});
afterEach(() => {
    error.mockRestore();
    warn.mockRestore();
    window.Mesh = undefined;
});

describe("initMesh", () => {
    it("is synchronous and sets window.Mesh before returning", () => {
        const lw = fakeLivewire();

        const result = initMesh(lw, {
            renderers: [{ ...fakeRenderer(), extensions: ["fake"] }],
            sources: [source("Counter")],
        });

        expect(result).toBeUndefined();
        expect(Object.keys(window.Mesh!.registry)).toEqual(["Counter"]);
        expect(lw.hooks["component.init"]).toBeTypeOf("function");
        expect(lw.hooks["morph.updated"]).toBeTypeOf("function");
    });

    it("logs bad registry entries and still mounts the other islands", async () => {
        const lw = fakeLivewire();
        const renderer = { ...fakeRenderer(), extensions: ["fake"] };

        initMesh(lw, {
            renderers: [renderer],
            sources: [
                source("Counter"),
                // Duplicate id, outside a mesh directory, unknown extension.
                source("Counter"),
                { "/vendor/acme/resources/js/other/Chart/index.fake": () => Promise.resolve({}) },
                { "/vendor/acme/resources/js/mesh/Table/index.ts": () => Promise.resolve({}) },
            ],
        });

        const messages = error.mock.calls.map((c) => String(c[0]));
        expect(messages).toHaveLength(3);
        expect(messages[0]).toMatch(/^Mesh: duplicate component id "Counter"/);
        expect(messages[1]).toMatch(/^Mesh: source entry .* does not live under/);
        expect(messages[2]).toMatch(/^Mesh: cannot infer renderer .*unknown extension "ts"/);
        expect(window.Mesh).toBeDefined();

        const counter = island("Counter", "lw-1");
        await init(lw, counter);

        expect(counter.root.textContent).toBe("mounted Counter");
    });

    it("logs and skips an invalid renderer instead of throwing", () => {
        const lw = fakeLivewire();

        expect(() =>
            initMesh(lw, {
                renderers: [{ type: "broken" } as any, fakeRenderer()],
            })
        ).not.toThrow();

        expect(Object.keys(window.Mesh!.config.renderers)).toEqual(["fake"]);
        expect(String(error.mock.calls[0][0])).toMatch(/invalid renderer/);
    });

    it("removes the renderedComponents entry when the island is torn down", async () => {
        const lw = fakeLivewire();
        const renderer = { ...fakeRenderer(), extensions: ["fake"] };
        initMesh(lw, { renderers: [renderer], sources: [source("Counter")] });

        const counter = island("Counter", "lw-1");
        await init(lw, counter);
        expect(window.Mesh!.renderedComponents["lw-1"]).toBeDefined();

        counter.teardown();

        expect(window.Mesh!.renderedComponents["lw-1"]).toBeUndefined();
        expect(renderer.unmount).toHaveBeenCalledTimes(1);
    });

    it("never mounts an island torn down while its chunk loads", async () => {
        const lw = fakeLivewire();
        const renderer = { ...fakeRenderer(), extensions: ["fake"] };
        initMesh(lw, { renderers: [renderer], sources: [source("Counter")] });

        const counter = island("Counter", "lw-1");
        const pending = init(lw, counter);
        counter.teardown();
        await pending;

        expect(renderer.mount).not.toHaveBeenCalled();
        expect(window.Mesh!.renderedComponents["lw-1"]).toBeUndefined();
    });

    it("logs a missing renderer under the failed-render message", async () => {
        const lw = fakeLivewire();
        initMesh(lw, {
            renderers: [],
            sources: [
                {
                    "/vendor/acme/resources/js/mesh/Counter/index.vue": () =>
                        Promise.resolve({ default: Component }),
                },
            ],
        });

        await init(lw, island("Counter", "lw-1"));

        expect(error).toHaveBeenCalledWith(
            'Mesh: failed to render "Counter"',
            expect.objectContaining({
                message: 'Mesh renderer for "vue" not found',
            })
        );
    });
});

describe("lazy renderers", () => {
    function lazy(renderer = fakeRenderer()) {
        const descriptor: LazyMeshRenderer = {
            type: renderer.type,
            extensions: ["fake"],
            load: vi.fn(() => Promise.resolve(renderer)),
        };
        return { descriptor, renderer };
    }

    it("does not load the renderer until an island of its type mounts", () => {
        const { descriptor } = lazy();

        initMesh(fakeLivewire(), {
            renderers: [descriptor],
            sources: [source("Counter")],
        });

        expect(descriptor.load).not.toHaveBeenCalled();
    });

    it("loads once, before the first mount, and shares it across islands", async () => {
        const { descriptor, renderer } = lazy();
        const lw = fakeLivewire();
        initMesh(lw, {
            renderers: [descriptor],
            sources: [source("Counter", "Chart")],
        });

        const counter = island("Counter", "lw-1");
        const chart = island("Chart", "lw-2");
        await Promise.all([init(lw, counter), init(lw, chart)]);

        expect(descriptor.load).toHaveBeenCalledTimes(1);
        expect(renderer.mount).toHaveBeenCalledTimes(2);
        expect(
            (descriptor.load as any).mock.invocationCallOrder[0]
        ).toBeLessThan((renderer.mount as any).mock.invocationCallOrder[0]);
        expect(counter.root.textContent).toBe("mounted Counter");
        expect(chart.root.textContent).toBe("mounted Chart");

        // A later island reuses the loaded renderer.
        await init(lw, island("Counter", "lw-3"));
        expect(descriptor.load).toHaveBeenCalledTimes(1);
        expect(renderer.mount).toHaveBeenCalledTimes(3);
    });

    it("logs a failed load and retries it for the next island", async () => {
        const renderer = fakeRenderer();
        const descriptor: LazyMeshRenderer = {
            type: "fake",
            extensions: ["fake"],
            load: vi
                .fn<() => Promise<MeshRenderer<any>>>()
                .mockRejectedValueOnce(new Error("offline"))
                .mockResolvedValue(renderer),
        };
        const lw = fakeLivewire();
        initMesh(lw, { renderers: [descriptor], sources: [source("Counter")] });

        const first = island("Counter", "lw-1");
        await init(lw, first);
        expect(error).toHaveBeenCalledWith(
            'Mesh: failed to render "Counter"',
            expect.objectContaining({ message: "offline" })
        );
        expect(first.root.textContent).toBe("");

        const second = island("Counter", "lw-2");
        await init(lw, second);
        expect(descriptor.load).toHaveBeenCalledTimes(2);
        expect(second.root.textContent).toBe("mounted Counter");
    });

    it("rejects a load() that does not resolve to a renderer", async () => {
        const descriptor: LazyMeshRenderer = {
            type: "fake",
            extensions: ["fake"],
            load: () => Promise.resolve({} as any),
        };
        const lw = fakeLivewire();
        initMesh(lw, { renderers: [descriptor], sources: [source("Counter")] });

        await init(lw, island("Counter", "lw-1"));

        expect(error).toHaveBeenCalledWith(
            'Mesh: failed to render "Counter"',
            expect.objectContaining({
                message: expect.stringMatching(/did not resolve to a renderer/),
            })
        );
    });
});
