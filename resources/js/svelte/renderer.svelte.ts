// NOTE: the `.svelte.ts` suffix is required — it tells vite-plugin-svelte to
// compile this module so the `$state` rune below becomes real reactive state.
import { mount, unmount } from "svelte";
import { LivewireComponentKey } from "./context";
import { renderSlotHtml, type SvelteSlot } from "./slot";
import type { SvelteRendererOptions } from "./factory";
import { MeshRenderer, RenderContext } from "../types";

// Svelte components receive everything as props, so the context is flattened
// into a single props object. Like the React renderer (and unlike Vue's
// native-slot mapping), the default slot is passed as `children` and named
// slots as a `slots` record — both reserved names the core already guards.
const flattenContext = (
    ctx: RenderContext<SvelteSlot>
): Record<string, any> => ({
    ...ctx.props,
    ...(ctx.slots.children ? { children: ctx.slots.children } : {}),
    ...(ctx.slots.hasNamed ? { slots: ctx.slots.named } : {}),
});

// The full (eager) Svelte renderer. Apps normally get it through the lazy
// descriptor in ./factory, which imports this module on the first mount.
//
// The core owns all slot/props bookkeeping; this renderer supplies only the
// two Svelte-specific pieces: HTML string -> snippet, and mount/update.
export function buildSvelteRenderer(
    options: SvelteRendererOptions = {}
): MeshRenderer<SvelteSlot> {
    const { context } = options;

    return {
        type: "svelte",

        renderSlot: (html) => renderSlotHtml(html),

        mount: ({ el, livewireComponent, Component, ctx }) => {
            // Svelte mounts once and then mutates state: holding the flat
            // props in a `$state` object makes every prop read inside the
            // component reactive, so `update` only has to assign into it.
            const props: Record<string, any> = $state(flattenContext(ctx));

            // Each island is its own Svelte component tree, so mount-level
            // context reaches every component inside it (see
            // useLivewireComponent). The app's own context is merged in
            // first, so it can't shadow the Livewire component.
            const app = mount(Component, {
                target: el,
                props,
                context: new Map<any, any>([
                    ...(context?.({ livewireComponent }) ?? []),
                    [LivewireComponentKey, livewireComponent],
                ]),
            });

            return {
                update: (ctx: RenderContext<SvelteSlot>) => {
                    const next = flattenContext(ctx);

                    // Drop keys that vanished (e.g. a slot emptied out), then
                    // assign the rest — both are tracked by the `$state` proxy.
                    for (const key of Object.keys(props)) {
                        if (!(key in next)) {
                            delete props[key];
                        }
                    }
                    Object.assign(props, next);
                },
                cleanup: () => unmount(app),
            };
        },
    };
}

const svelteRenderer = /* @__PURE__ */ buildSvelteRenderer();

export default svelteRenderer;
export { svelteRenderer, renderSlotHtml, type SvelteSlot };
