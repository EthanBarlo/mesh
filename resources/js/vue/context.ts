import { inject, type InjectionKey } from "vue";
import type { LivewireComponent } from "../types";

// Each Mesh island is its own Vue app, so the renderer provides the owning
// Livewire component app-wide via this key.
export const LivewireComponentKey: InjectionKey<LivewireComponent> =
    Symbol("mesh-livewire-component");

export function useLivewireComponent(): LivewireComponent {
    const livewire = inject(LivewireComponentKey, null);
    if (!livewire) {
        throw new Error("useLivewireComponent must be used within a Mesh component");
    }

    return livewire;
}
