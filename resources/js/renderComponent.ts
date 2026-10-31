import { LivewireComponent, MeshRenderer, RenderedComponent } from "./types";
import { getProps, getSlots } from "./utils";
import { getMeshRoot, mountComponent } from "./slots";

// Mount a loaded component through its (already resolved) renderer, reading
// the initial props and slots from the Livewire component's DOM.
export default function renderComponent(
    livewireComponent: LivewireComponent,
    renderer: MeshRenderer<any>,
    component: any
): RenderedComponent {
    const props = getProps(livewireComponent.el);
    const slots = getSlots(livewireComponent.el);
    // Start from an empty root: a page restored by wire:navigate back/forward
    // still holds the markup the framework rendered last time, and some
    // renderers (Svelte's `mount`) append rather than replace.
    getMeshRoot(livewireComponent).replaceChildren();
    return mountComponent(renderer, livewireComponent, component, props, slots);
}
