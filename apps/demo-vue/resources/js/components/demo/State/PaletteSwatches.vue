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

<!--
    Header chip + title + swatch schedule for a server-computed palette prop.
    The swatch colours are data from props(), so they stay real hex values.
-->
<template>
    <div>
        <p class="k k--caps text-ink-3">Server props</p>
        <div class="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1">
            <span
                class="size-3 shrink-0 border border-line-3"
                :style="{ backgroundColor: palette.accent }"
                aria-hidden="true"
            />
            <h3 class="text-sm font-semibold text-ink">
                {{ palette.label }} palette
            </h3>
            <code class="font-mono text-xs text-ink-3">
                theme = "{{ theme }}"
            </code>
        </div>
        <p class="mt-1 text-xs leading-relaxed text-ink-3">
            Computed in <code class="core-code">props()</code> on the
            server and delivered as a prop on every render.
        </p>
        <ul class="mt-4 flex flex-wrap gap-3">
            <li v-for="swatch in palette.swatches" :key="swatch.name" class="w-14">
                <div
                    class="size-14 border border-line-3"
                    :style="{ backgroundColor: swatch.hex }"
                    role="img"
                    :aria-label="`${palette.label} ${swatch.name}: ${swatch.hex}`"
                />
                <span class="mt-1.5 block font-mono text-[11px] leading-tight text-ink-2 tabular-nums">
                    {{ swatch.name }}
                </span>
                <span class="block font-mono text-[10px] leading-tight text-ink-3">
                    {{ swatch.hex }}
                </span>
            </li>
        </ul>
    </div>
</template>
