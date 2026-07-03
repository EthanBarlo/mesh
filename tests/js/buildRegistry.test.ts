import { describe, expect, it } from "vitest";
import {
    buildRegistry,
    deriveId,
    inferRenderer,
} from "../../resources/js/buildRegistry";
import { ComponentLoader, GlobResult } from "../../resources/js/types";

const loader: ComponentLoader = () => Promise.resolve({ default: {} });

describe("deriveId", () => {
    it("derives a flat id", () => {
        expect(deriveId("/resources/js/mesh/Counter/index.tsx")).toBe(
            "Counter"
        );
    });

    it("derives a nested id", () => {
        expect(deriveId("/resources/js/mesh/Forms/Input/index.tsx")).toBe(
            "Forms/Input"
        );
    });

    it("returns null for a key outside the base", () => {
        expect(deriveId("/resources/js/other/Counter/index.tsx")).toBe(null);
    });
});

describe("inferRenderer", () => {
    it("maps tsx to react", () => {
        expect(inferRenderer("/resources/js/mesh/Counter/index.tsx")).toBe(
            "react"
        );
    });

    it("maps jsx to react", () => {
        expect(inferRenderer("/resources/js/mesh/Counter/index.jsx")).toBe(
            "react"
        );
    });

    it("throws on an unknown extension", () => {
        expect(() =>
            inferRenderer("/resources/js/mesh/Counter/index.ts")
        ).toThrow();
    });
});

describe("buildRegistry", () => {
    it("builds ids and renderers from two entries", () => {
        const globbed: GlobResult = {
            "/resources/js/mesh/Counter/index.tsx": loader,
            "/resources/js/mesh/Forms/Input/index.tsx": loader,
        };

        const registry = buildRegistry(globbed);

        expect(Object.keys(registry).sort()).toEqual([
            "Counter",
            "Forms/Input",
        ]);
        expect(registry["Counter"].renderer).toBe("react");
        expect(registry["Forms/Input"].renderer).toBe("react");
    });

    it("throws when two keys derive the same id", () => {
        const globbed: GlobResult = {
            "/resources/js/mesh/Counter/index.tsx": loader,
            "./resources/js/mesh/Counter/index.tsx": loader,
        };

        expect(() => buildRegistry(globbed)).toThrow();
    });
});

describe("buildRegistry sources", () => {
    const hostGlob: GlobResult = {
        "/resources/js/mesh/Counter/index.tsx": loader,
    };

    it("merges a bare glob-result source", () => {
        const source: GlobResult = {
            "/vendor/acme/widgets/resources/js/mesh/Chart/index.tsx": loader,
        };

        const registry = buildRegistry(hostGlob, [source]);

        expect(Object.keys(registry).sort()).toEqual(["Chart", "Counter"]);
        expect(registry["Chart"].renderer).toBe("react");
    });

    it("derives nested ids from a source entry", () => {
        const source: GlobResult = {
            "/vendor/acme/widgets/resources/js/mesh/Forms/Input/index.tsx":
                loader,
        };

        const registry = buildRegistry(hostGlob, [source]);

        expect(registry["Forms/Input"]).toBeDefined();
    });

    it("prefixes every id from a wrapped source", () => {
        const registry = buildRegistry(hostGlob, [
            {
                modules: {
                    "/vendor/acme/widgets/resources/js/mesh/Chart/index.tsx":
                        loader,
                    "/vendor/acme/widgets/resources/js/mesh/Forms/Input/index.tsx":
                        loader,
                },
                prefix: "Acme",
            },
        ]);

        expect(Object.keys(registry).sort()).toEqual([
            "Acme/Chart",
            "Acme/Forms/Input",
            "Counter",
        ]);
    });

    it("throws on an id collision between host and source", () => {
        const source: GlobResult = {
            "/vendor/acme/widgets/resources/js/mesh/Counter/index.tsx": loader,
        };

        expect(() => buildRegistry(hostGlob, [source])).toThrow(
            /duplicate component id "Counter"/
        );
    });

    it("a prefix avoids the collision", () => {
        const registry = buildRegistry(hostGlob, [
            {
                modules: {
                    "/vendor/acme/widgets/resources/js/mesh/Counter/index.tsx":
                        loader,
                },
                prefix: "Acme",
            },
        ]);

        expect(Object.keys(registry).sort()).toEqual([
            "Acme/Counter",
            "Counter",
        ]);
    });

    it("throws when a source entry is not under a mesh directory", () => {
        const source: GlobResult = {
            "/vendor/acme/widgets/resources/js/other/Chart/index.tsx": loader,
        };

        expect(() => buildRegistry(hostGlob, [source])).toThrow(
            /does not live under/
        );
    });

    it("infers non-react renderers for source entries", () => {
        const source: GlobResult = {
            "/vendor/acme/widgets/resources/js/mesh/Chart/index.vue": loader,
        };

        const registry = buildRegistry(hostGlob, [source]);

        expect(registry["Chart"].renderer).toBe("vue");
    });
});
