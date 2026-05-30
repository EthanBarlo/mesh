import { createContext, useContext } from "react";
import useWire from "./hooks/useWire";
import { useEntangle } from "./hooks/useEntangle";
import { useErrorBag } from "./hooks/useErrorBag";
import { LivewireComponent } from "../types";

const LivewireContext = createContext<LivewireComponent | null>(null);

export default LivewireContext;

export function useLivewireComponent() {
    const livewire = useContext(LivewireContext);
    if (!livewire) {
        throw new Error("useLivewireComponent must be used within a Mesh component");
    }

    return livewire;
}

export { useWire, useEntangle, useErrorBag };
