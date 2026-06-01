import { LivewireComponent, RenderedComponent } from "./types";
import { getProps, getRenderer, getSlots } from "./utils";

export default function renderComponent(
    livewireComponent: LivewireComponent,
    id: string,
    component: any
): RenderedComponent {
    const entry = window.Mesh?.registry[id];
    if (!entry) {
        throw new Error("Mesh: component \"" + id + "\" is not in the registry");
    }

    const render = getRenderer(entry.renderer);

    const props = getProps(livewireComponent.el);
    const slots = getSlots(livewireComponent.el);
    return render(id, livewireComponent, component, props, slots);
}
