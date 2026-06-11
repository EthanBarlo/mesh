import { svelte } from "@sveltejs/vite-plugin-svelte";
import { defineConfig } from "vitest/config";

export default defineConfig({
    // Compiles the .svelte test fixtures and the package's .svelte.ts runes.
    plugins: [svelte()],

    // Svelte 5's `mount()` only exists in its client build; under Vitest the
    // default (node) conditions would resolve the server build instead. The
    // VITEST guard keeps this from leaking into other consumers of this config
    // (e.g. a plain `vite build`); the React and Vue suites are unaffected as
    // both ship browser-safe builds under this condition.
    resolve: process.env.VITEST ? { conditions: ["browser"] } : undefined,

    test: {
        include: ["tests/js/**/*.test.ts"],
    },
});
