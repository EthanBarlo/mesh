<script lang="ts">
export interface Swatch {
    name: string;
    hex: string;
}

export interface Palette {
    label: string;
    accent: string;
    swatches: Swatch[];
}
</script>

<script setup lang="ts">
defineProps<{
    theme: string;
    palette: Palette;
}>();
</script>

<!-- Header dot + title + swatch grid for a server-computed palette prop. -->
<template>
    <div>
        <div class="flex items-center gap-2">
            <span
                class="w-3 h-3 rounded-full"
                :style="{ backgroundColor: palette.accent }"
                aria-hidden="true"
            />
            <h3 class="text-sm font-semibold text-white">
                {{ palette.label }} palette
            </h3>
            <code class="font-mono text-xs text-zinc-500">
                theme = "{{ theme }}"
            </code>
        </div>
        <p class="mt-1 text-xs text-zinc-500">
            Computed in <code class="font-mono">props()</code> on the server,
            delivered as a prop on every re-render.
        </p>
        <div class="mt-4 flex gap-3">
            <div
                v-for="swatch in palette.swatches"
                :key="swatch.name"
                class="text-center"
            >
                <div
                    class="w-14 h-14 rounded-xl border border-white/10"
                    :style="{ backgroundColor: swatch.hex }"
                    role="img"
                    :aria-label="`${palette.label} ${swatch.name}: ${swatch.hex}`"
                />
                <span
                    class="mt-1.5 block font-mono text-[10px] text-zinc-500"
                    >{{ swatch.hex }}</span
                >
            </div>
        </div>
    </div>
</template>
