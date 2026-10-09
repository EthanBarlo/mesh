import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

// Svelte 5 strips TypeScript types itself; vitePreprocess handles <style lang="…">
// (and, with { script: true }, TypeScript that emits code, such as enums).
export default {
    preprocess: vitePreprocess(),
};
