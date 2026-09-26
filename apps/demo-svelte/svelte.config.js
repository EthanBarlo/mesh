import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

// vitePreprocess enables lang="ts" in .svelte files.
export default {
    preprocess: vitePreprocess(),
};
