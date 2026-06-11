import { getContext } from "svelte";
import type { LivewireComponent } from "../types";

// Each Mesh island is its own Svelte component tree, so the renderer provides
// the owning Livewire component via mount()'s context Map under this key.
export const LivewireComponentKey = Symbol("mesh-livewire-component");

export function useLivewireComponent(): LivewireComponent {
    const livewire = getContext<LivewireComponent | undefined>(
        LivewireComponentKey
    );
    if (!livewire) {
        throw new Error("useLivewireComponent must be used within a Mesh component");
    }

    return livewire;
}
