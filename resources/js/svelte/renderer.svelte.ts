// NOTE: the `.svelte.ts` suffix is required — it tells vite-plugin-svelte to
// compile this module so the `$state` rune below becomes real reactive state.
import { createRawSnippet, mount, unmount, type Snippet } from "svelte";
import { LivewireComponentKey } from "./context";
import { MeshRenderer, RenderContext } from "../types";

// A Mesh slot in Svelte is a snippet: a stable reference the core can hold
// onto across props-only updates, re-rendered by the component wherever it
// does `{@render ...}`.
export type SvelteSlot = Snippet;

// Slot content is mirrored as static HTML. A wrapper element is unavoidable
// (createRawSnippet must render a single root element); `display: contents`
// drops the wrapper box so it doesn't affect layout.
//
// Security: `html` is server-rendered slot content from Blade. Blade escapes
// `{{ }}` interpolation, so it is safe by default; only `{!! … !!}` (or other
// unescaped output) injects raw HTML, which is the caller's responsibility —
// never pass unsanitised user input through a slot.
export const renderSlotHtml = (html: string): SvelteSlot =>
    createRawSnippet(() => ({
        render: () => `<div style="display: contents">${html}</div>`,
    }));

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

// The core owns all slot/props bookkeeping; this renderer supplies only the
// two Svelte-specific pieces: HTML string -> snippet, and mount/update.
const svelteRenderer: MeshRenderer<SvelteSlot> = {
    type: "svelte",

    renderSlot: (html) => renderSlotHtml(html),

    mount: ({ el, livewireComponent, Component, ctx }) => {
        // Svelte mounts once and then mutates state: holding the flat props
        // in a `$state` object makes every prop read inside the component
        // reactive, so `update` only has to assign into this object.
        const props: Record<string, any> = $state(flattenContext(ctx));

        // Each island is its own Svelte component tree, so mount-level
        // context reaches every component inside it (see useLivewireComponent).
        const app = mount(Component, {
            target: el,
            props,
            context: new Map([[LivewireComponentKey, livewireComponent]]),
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

export default svelteRenderer;
export { svelteRenderer };
