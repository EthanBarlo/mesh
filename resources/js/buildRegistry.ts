import { ComponentRegistry, GlobResult } from "./types";

// The single, hardcoded directory (relative to the host app root) that every
// Mesh component must live under. This must stay byte-identical to the PHP side.
export const MESH_BASE = "resources/js/mesh";

// Derive a component's simple ID from an import.meta.glob key.
//
// Example: "/resources/js/mesh/Forms/Input/index.tsx" -> "Forms/Input"
// Returns null when the key is not under MESH_BASE or the result is empty.
export function deriveId(key: string): string | null {
    let path = key;

    // Remove a leading "./" if present.
    if (path.indexOf("./") === 0) {
        path = path.slice(2);
    }

    // Find the base marker and take everything after it.
    const marker = MESH_BASE + "/";
    const markerIndex = path.indexOf(marker);
    if (markerIndex === -1) {
        return null;
    }
    path = path.slice(markerIndex + marker.length);

    // Remove a trailing file extension among the supported ones.
    path = path.replace(/\.(tsx|jsx|vue|svelte)$/, "");

    // Remove a trailing "/index".
    path = path.replace(/\/index$/, "");

    if (path.length === 0) {
        return null;
    }

    return path;
}

// Infer the renderer type from the entry file's extension.
// Throws on an unknown extension (no silent default).
export function inferRenderer(key: string): string {
    const lastDot = key.lastIndexOf(".");
    const ext = lastDot === -1 ? "" : key.slice(lastDot + 1).toLowerCase();

    if (ext === "tsx" || ext === "jsx") {
        return "react";
    }
    if (ext === "vue") {
        return "vue";
    }
    if (ext === "svelte") {
        return "svelte";
    }

    throw new Error(
        "Mesh: cannot infer renderer for component entry \"" +
            key +
            "\" (unknown extension \"" +
            ext +
            "\")."
    );
}

// Build the central component registry from an import.meta.glob result.
// Each entry becomes registry[id] = { renderer, load }. Throws on a duplicate id.
export function buildRegistry(globbed: GlobResult): ComponentRegistry {
    const registry: ComponentRegistry = {};

    for (const key in globbed) {
        const id = deriveId(key);
        if (id === null) {
            continue;
        }

        if (registry[id]) {
            throw new Error(
                "Mesh: duplicate component id \"" +
                    id +
                    "\" derived from \"" +
                    key +
                    "\"."
            );
        }

        registry[id] = {
            renderer: inferRenderer(key),
            load: globbed[key],
        };
    }

    return registry;
}
