import { LivewireComponent, RenderedComponent } from "./types";
import { getProps, getRenderer } from "./utils";

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
    return render(id, livewireComponent, component, props);
}
