import { ComponentRegistry, GlobResult, MeshSource } from "./types";

// The hardcoded directory (relative to the host app root) that auto-discovered
// Mesh components live under, and the path marker id derivation starts from in
// extra-source entries. This must stay byte-identical to the PHP side.
export const MESH_BASE = "resources/js/mesh";

// The extensions every app gets without configuration. A configured renderer
// can claim more (or take one of these over) through its `extensions`.
const BUILT_IN_EXTENSIONS: Record<string, string> = {
    tsx: "react",
    jsx: "react",
    vue: "vue",
    svelte: "svelte",
};

// The part of a renderer (full or lazy) that extension inference reads.
type ExtensionClaim = { type: string; extensions?: string[] };

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

    // Remove the file extension (whatever it is: custom renderers can claim
    // their own) from the last path segment.
    path = path.replace(/\.[^./]+$/, "");

    // Remove a trailing "/index".
    path = path.replace(/\/index$/, "");

    if (path.length === 0) {
        return null;
    }

    return path;
}

// Infer the renderer type from the entry file's extension: the built-in
// mappings, plus any `extensions` the given renderers claim (a configured
// renderer wins over a built-in mapping; among configured renderers, the last
// one listed wins). Throws on an unknown extension (no silent default).
export function inferRenderer(
    key: string,
    renderers: ExtensionClaim[] = []
): string {
    const lastDot = key.lastIndexOf(".");
    const ext = lastDot === -1 ? "" : key.slice(lastDot + 1).toLowerCase();

    const map = extensionMap(renderers);
    if (Object.prototype.hasOwnProperty.call(map, ext)) {
        return map[ext];
    }

    throw new Error(
        "Mesh: cannot infer renderer for component entry \"" +
            key +
            "\" (unknown extension \"" +
            ext +
            "\")."
    );
}

function extensionMap(renderers: ExtensionClaim[]): Record<string, string> {
    const map = { ...BUILT_IN_EXTENSIONS };
    for (const renderer of renderers) {
        for (const ext of renderer.extensions ?? []) {
            map[ext.replace(/^\./, "").toLowerCase()] = renderer.type;
        }
    }
    return map;
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

// Add one glob result's entries to the registry. A bad entry is logged and
// skipped, never thrown, so one mistake can't stop every other island from
// mounting. The host app's own glob pattern guarantees the MESH_BASE marker,
// so non-matching keys are skipped silently; extra sources are host-authored
// globs where a non-matching key means a misconfigured pattern, so those are
// reported.
function addEntries(
    registry: ComponentRegistry,
    globbed: GlobResult,
    renderers: ExtensionClaim[],
    options: { prefix?: string; requireMatch?: boolean } = {}
): void {
    for (const key in globbed) {
        const derived = deriveId(key);
        if (derived === null) {
            if (options.requireMatch) {
                console.error(
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

        let renderer: string;
        try {
            renderer = inferRenderer(key, renderers);
        } catch (e) {
            console.error((e as Error).message);
            continue;
        }

        const id = options.prefix ? options.prefix + "/" + derived : derived;

        // The first registration of an id wins.
        if (registry[id]) {
            console.error(
                "Mesh: duplicate component id \"" +
                    id +
                    "\" derived from \"" +
                    key +
                    "\"."
            );
            continue;
        }

        registry[id] = {
            renderer,
            load: globbed[key],
        };
    }
}

// Build the central component registry from the host app's import.meta.glob
// result plus any extra sources (see MeshSource). Each entry becomes
// registry[id] = { renderer, load }. `renderers` supplies extra extension
// mappings (see inferRenderer). Bad entries (a duplicate id, an unknown
// extension, a source entry outside a mesh directory) are logged with
// console.error and skipped; this never throws.
export function buildRegistry(
    globbed: GlobResult,
    sources: MeshSource[] = [],
    renderers: ExtensionClaim[] = []
): ComponentRegistry {
    const registry: ComponentRegistry = {};

    addEntries(registry, globbed, renderers);

    for (const source of sources) {
        const { modules, prefix } = normalizeSource(source);
        addEntries(registry, modules, renderers, {
            prefix,
            requireMatch: true,
        });
    }

    return registry;
}
