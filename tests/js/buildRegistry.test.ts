import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { MockInstance } from "vitest";
import {
    buildRegistry,
    deriveId,
    inferRenderer,
} from "../../resources/js/buildRegistry";
import { ComponentLoader, GlobResult } from "../../resources/js/types";

const loader: ComponentLoader = () => Promise.resolve({ default: {} });

// Bad entries are logged, never thrown: capture console.error per test.
let error: MockInstance;
beforeEach(() => {
    error = vi.spyOn(console, "error").mockImplementation(() => {});
});
afterEach(() => {
    error.mockRestore();
});

const logged = () => error.mock.calls.map((call) => String(call[0]));

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

    it("strips any final extension, not only the built-in ones", () => {
        expect(deriveId("/resources/js/mesh/Counter/index.marko")).toBe(
            "Counter"
        );
        expect(deriveId("/resources/js/mesh/Forms/Input/index.ts")).toBe(
            "Forms/Input"
        );
    });

    it("only strips the extension from the last path segment", () => {
        expect(deriveId("/resources/js/mesh/v1.2/Chart/index.tsx")).toBe(
            "v1.2/Chart"
        );
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

    it("maps vue and svelte to their renderers", () => {
        expect(inferRenderer("/resources/js/mesh/Counter/index.vue")).toBe(
            "vue"
        );
        expect(inferRenderer("/resources/js/mesh/Counter/index.svelte")).toBe(
            "svelte"
        );
    });

    it("throws on an unknown extension", () => {
        expect(() =>
            inferRenderer("/resources/js/mesh/Counter/index.ts")
        ).toThrow(/unknown extension "ts"/);
    });

    it("maps an extension a configured renderer claims", () => {
        expect(
            inferRenderer("/resources/js/mesh/Counter/index.marko", [
                { type: "marko", extensions: ["marko"] },
            ])
        ).toBe("marko");
    });

    it("accepts claimed extensions with a leading dot, in any case", () => {
        expect(
            inferRenderer("/resources/js/mesh/Counter/index.riot", [
                { type: "riot", extensions: [".RIOT"] },
            ])
        ).toBe("riot");
    });

    it("lets a configured renderer win over a built-in mapping", () => {
        expect(
            inferRenderer("/resources/js/mesh/Counter/index.tsx", [
                { type: "solid", extensions: ["tsx"] },
            ])
        ).toBe("solid");

        // ...but only for the extensions it claims.
        expect(
            inferRenderer("/resources/js/mesh/Counter/index.jsx", [
                { type: "solid", extensions: ["tsx"] },
            ])
        ).toBe("react");
    });

    it("ignores renderers that claim no extensions", () => {
        expect(() =>
            inferRenderer("/resources/js/mesh/Counter/index.marko", [
                { type: "marko" },
            ])
        ).toThrow(/unknown extension "marko"/);
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
        expect(error).not.toHaveBeenCalled();
    });

    it("logs and skips a duplicate id; the first entry wins", () => {
        const first: ComponentLoader = () => Promise.resolve({ default: 1 });
        const second: ComponentLoader = () => Promise.resolve({ default: 2 });
        const globbed: GlobResult = {
            "/resources/js/mesh/Counter/index.tsx": first,
            "/resources/js/mesh/Counter/index.vue": second,
            "/resources/js/mesh/Other/index.tsx": loader,
        };

        const registry = buildRegistry(globbed);

        expect(Object.keys(registry).sort()).toEqual(["Counter", "Other"]);
        expect(registry["Counter"].load).toBe(first);
        expect(registry["Counter"].renderer).toBe("react");
        expect(logged()).toEqual([
            'Mesh: duplicate component id "Counter" derived from "/resources/js/mesh/Counter/index.vue".',
        ]);
    });

    it("maps entries with an extension a configured renderer claims", () => {
        const registry = buildRegistry(
            {},
            [{ "/resources/js/mesh/Counter/index.marko": loader }],
            [{ type: "marko", extensions: ["marko"] }]
        );

        expect(registry["Counter"].renderer).toBe("marko");
        expect(error).not.toHaveBeenCalled();
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

    it("logs an id collision between host and source, keeping the host entry", () => {
        const sourceLoader: ComponentLoader = () =>
            Promise.resolve({ default: {} });
        const source: GlobResult = {
            "/vendor/acme/widgets/resources/js/mesh/Counter/index.tsx":
                sourceLoader,
        };

        const registry = buildRegistry(hostGlob, [source]);

        expect(Object.keys(registry)).toEqual(["Counter"]);
        expect(registry["Counter"].load).toBe(
            hostGlob["/resources/js/mesh/Counter/index.tsx"]
        );
        expect(logged()).toHaveLength(1);
        expect(logged()[0]).toMatch(/duplicate component id "Counter"/);
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

    it("logs and skips a source entry that is not under a mesh directory", () => {
        const source: GlobResult = {
            "/vendor/acme/widgets/resources/js/other/Chart/index.tsx": loader,
            "/vendor/acme/widgets/resources/js/mesh/Table/index.tsx": loader,
        };

        const registry = buildRegistry(hostGlob, [source]);

        expect(Object.keys(registry).sort()).toEqual(["Counter", "Table"]);
        expect(logged()).toHaveLength(1);
        expect(logged()[0]).toMatch(/does not live under/);
    });

    it("logs and skips a source entry with an unknown extension", () => {
        const source: GlobResult = {
            "/vendor/acme/widgets/resources/js/mesh/Chart/index.ts": loader,
            "/vendor/acme/widgets/resources/js/mesh/Table/index.vue": loader,
        };

        const registry = buildRegistry(hostGlob, [source]);

        expect(Object.keys(registry).sort()).toEqual(["Counter", "Table"]);
        expect(logged()).toEqual([
            'Mesh: cannot infer renderer for component entry "/vendor/acme/widgets/resources/js/mesh/Chart/index.ts" (unknown extension "ts").',
        ]);
    });

    it("does not let a skipped entry claim its id", () => {
        // The unknown-extension entry comes first but is skipped, so the
        // valid entry with the same id is registered without a duplicate.
        const registry = buildRegistry({}, [
            {
                "/vendor/a/resources/js/mesh/Chart/index.ts": loader,
                "/vendor/a/resources/js/mesh/Chart/index.tsx": loader,
            },
        ]);

        expect(registry["Chart"].renderer).toBe("react");
        expect(logged()).toHaveLength(1);
        expect(logged()[0]).toMatch(/unknown extension "ts"/);
    });

    it("infers non-react renderers for source entries", () => {
        const source: GlobResult = {
            "/vendor/acme/widgets/resources/js/mesh/Chart/index.vue": loader,
        };

        const registry = buildRegistry(hostGlob, [source]);

        expect(registry["Chart"].renderer).toBe("vue");
    });
});
