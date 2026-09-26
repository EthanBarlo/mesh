import { Wire } from "../../types";
import { useLivewireComponent } from "../context";

export default function useWire<T = {}>() {
    const { $wire } = useLivewireComponent();
    return $wire as Wire & T;
}
