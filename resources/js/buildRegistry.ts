import { ComponentRegistry, GlobResult, MeshSource } from "./types";

// The hardcoded directory (relative to the host app root) that auto-discovered
// Mesh components live under, and the path marker id derivation starts from in
// extra-source entries. This must stay byte-identical to the PHP side.
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

// Normalize a MeshSource to its wrapped form. A bare import.meta.glob result
// maps file paths to loader *functions*, so an object-valued `modules` key can
// only mean the wrapped form.
function normalizeSource(source: MeshSource): {
    modules: GlobResult;
    prefix?: string;
} {
    if ("modules" in source && typeof source.modules === "object") {
        return source as { modules: GlobResult; prefix?: string };
    }

    return { modules: source as GlobResult };
}

// Add one glob result's entries to the registry. Throws on a duplicate id.
// The host app's own glob pattern guarantees the MESH_BASE marker, so
// non-matching keys are skipped; extra sources are host-authored globs where a
// non-matching key means a misconfigured pattern, so those throw instead.
function addEntries(
    registry: ComponentRegistry,
    globbed: GlobResult,
    options: { prefix?: string; requireMatch?: boolean } = {}
): void {
    for (const key in globbed) {
        const derived = deriveId(key);
        if (derived === null) {
            if (options.requireMatch) {
                throw new Error(
                    "Mesh: source entry \"" +
                        key +
                        "\" does not live under a \"" +
                        MESH_BASE +
                        "/\" directory, so no component id can be derived. " +
                        "Move the entry under one (e.g. \"<package>/resources/js/mesh/<Name>/index.tsx\") or adjust the glob."
                );
            }
            continue;
        }

        const id = options.prefix ? options.prefix + "/" + derived : derived;

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
}

// Build the central component registry from the host app's import.meta.glob
// result plus any extra sources (see MeshSource). Each entry becomes
// registry[id] = { renderer, load }. Throws on a duplicate id.
export function buildRegistry(
    globbed: GlobResult,
    sources: MeshSource[] = []
): ComponentRegistry {
    const registry: ComponentRegistry = {};

    addEntries(registry, globbed);

    for (const source of sources) {
        const { modules, prefix } = normalizeSource(source);
        addEntries(registry, modules, { prefix, requireMatch: true });
    }

    return registry;
}
