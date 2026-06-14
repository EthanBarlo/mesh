import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import tailwindcss from "@tailwindcss/vite";
import vue from '@vitejs/plugin-vue';
import path from 'path';

export default defineConfig({
    plugins: [
        laravel({
            input: [
                'resources/css/app.css',
                'resources/js/app.ts',
            ],
            refresh: true,
        }),
        tailwindcss(),
        vue(),
    ],
    resolve: {
        alias: {
            '@': path.resolve(__dirname, 'resources/js'),
            '@mesh': path.resolve(__dirname, 'vendor/ethanbarlo/mesh/resources/js'),
        },
        // The @mesh alias resolves through the vendor symlink into the package
        // repo, which has its own node_modules/vue (devDep). Two Vue copies
        // break vnode/reactivity interop, so force a single resolution.
        dedupe: ['vue'],
    },
    server: {
        cors: true,
        watch: {
            ignored: ['**/storage/framework/views/**'],
        },
    },
});
