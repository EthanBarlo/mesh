import { createApp, h, shallowReactive } from "vue";
import { LivewireComponentKey } from "./context";
import { renderSlotHtml, type VueSlot } from "./slot";
import type { VueRendererOptions } from "./factory";
import { MeshRenderer, RenderContext } from "../types";

// The full (eager) Vue renderer. Apps normally get it through the lazy
// descriptor in ./factory, which imports this module on the first mount.
//
// The core owns all slot/props bookkeeping; this renderer supplies only the
// two Vue-specific pieces: HTML string -> slot function, and mount/update.
//
// Unlike the React renderer (which passes named slots as a `slots` prop),
// Mesh slots map onto Vue's native slot system: components receive them as
// `<slot />` / `<slot name="…" />`.
export function buildVueRenderer(
    options: VueRendererOptions = {}
): MeshRenderer<VueSlot> {
    const { setup } = options;

    return {
        type: "vue",
        nativeSlots: true,

        renderSlot: (html) => renderSlotHtml(html),

        mount: ({ el, livewireComponent, Component, ctx }) => {
            // The core replaces the whole props/slots objects on update, so a
            // shallow reactive wrapper is enough to re-render — and server
            // props are not needlessly deep-proxied.
            const state = shallowReactive<RenderContext<VueSlot>>({
                props: ctx.props,
                slots: ctx.slots,
            });

            const app = createApp({
                render: () =>
                    h(
                        Component,
                        { ...state.props },
                        {
                            ...(state.slots.children
                                ? { default: state.slots.children }
                                : {}),
                            ...state.slots.named,
                        }
                    ),
            });

            // Each island is its own Vue app, so an app-level provide reaches
            // every component inside it (see useLivewireComponent).
            app.provide(LivewireComponentKey, livewireComponent);
            setup?.(app, { livewireComponent });
            app.mount(el);

            return {
                update: (ctx: RenderContext<VueSlot>) => {
                    state.props = ctx.props;
                    state.slots = ctx.slots;
                },
                cleanup: () => app.unmount(),
            };
        },
    };
}

const vueRenderer = /* @__PURE__ */ buildVueRenderer();

export default vueRenderer;
export { renderSlotHtml, type VueSlot };
