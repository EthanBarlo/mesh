import { createApp, h, shallowReactive, type VNodeChild } from "vue";
import { LivewireComponentKey } from "./context";
import { MeshRenderer, RenderContext } from "../types";

// A Mesh slot in Vue is a slot function: a stable closure the core can hold
// onto across props-only updates, returning a fresh vnode per render (vnodes
// are single-use, the closure is not).
export type VueSlot = () => VNodeChild;

// Slot content is mirrored as static HTML. A wrapper element is unavoidable
// (innerHTML needs a host element); `display: contents` drops the wrapper box
// so it doesn't affect layout.
//
// Security: `html` is server-rendered slot content from Blade. Blade escapes
// `{{ }}` interpolation, so it is safe by default; only `{!! … !!}` (or other
// unescaped output) injects raw HTML, which is the caller's responsibility —
// never pass unsanitised user input through a slot.
export const renderSlotHtml = (html: string): VueSlot => () =>
    h("div", { style: "display: contents", innerHTML: html });

// The core owns all slot/props bookkeeping; this renderer supplies only the
// two Vue-specific pieces: HTML string -> slot function, and mount/update.
//
// Unlike the React renderer (which passes named slots as a `slots` prop),
// Mesh slots map onto Vue's native slot system: components receive them as
// `<slot />` / `<slot name="…" />`.
const vueRenderer: MeshRenderer<VueSlot> = {
    type: "vue",

    renderSlot: (html) => renderSlotHtml(html),

    mount: ({ el, livewireComponent, Component, ctx }) => {
        // The core replaces the whole props/slots objects on update, so a
        // shallow reactive wrapper is enough to re-render — and server props
        // are not needlessly deep-proxied.
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

export default vueRenderer;
