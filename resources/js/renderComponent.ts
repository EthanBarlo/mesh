import { LivewireComponent, RenderedComponent } from "./types";
import { getProps, getRenderer, getSlots } from "./utils";
import { mountComponent } from "./slots";

export default function renderComponent(
    livewireComponent: LivewireComponent,
    id: string,
    component: any
): RenderedComponent {
    const entry = window.Mesh?.registry[id];
    if (!entry) {
        throw new Error("Mesh: component \"" + id + "\" is not in the registry");
    }

    const renderer = getRenderer(entry.renderer);

    const props = getProps(livewireComponent.el);
    const slots = getSlots(livewireComponent.el);
    return mountComponent(renderer, livewireComponent, component, props, slots);
}
