import { debugLog } from "./utils";

export default function registerComponent(
    renderer: string,
    name: string,
    component: any
) {
    debugLog("registering component", { renderer, name, component });

    if (!window.Mesh) {
        throw new Error("Mesh is not initialized");
    }

    window.Mesh.components[name] = {
        renderer,
        component,
    };
}
