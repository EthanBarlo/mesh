<script setup lang="ts">
import { onMounted, onUnmounted, ref } from "vue";
import { BigNumber, Panel } from "@/components/ui";
import PaletteSwatches, {
    type Palette,
} from "@/components/demo/State/PaletteSwatches.vue";

defineProps<{
    theme: string;
    palette: Palette;
}>();

// Plain local Vue state — never touches the server.
const seconds = ref(0);
let intervalId: number | undefined;

onMounted(() => {
    intervalId = window.setInterval(() => {
        seconds.value += 1;
    }, 1000);
});

onUnmounted(() => {
    window.clearInterval(intervalId);
});
</script>

<template>
    <Panel>
        <div class="flex flex-col gap-6 sm:flex-row sm:items-stretch">
            <!-- Server-computed palette prop -->
            <PaletteSwatches :theme="theme" :palette="palette" class="grow" />

            <!-- Local Vue state that survives prop updates -->
            <div class="shrink-0 border border-line-2 bg-paper-2 p-4 sm:w-52">
                <p class="k k--caps text-ink-3">Client state</p>
                <p class="mt-1.5 font-mono text-xs text-ink-3">Mounted for</p>
                <BigNumber class="mt-1 block text-4xl leading-none">
                    {{ seconds }}<span class="ml-1 text-lg font-normal text-ink-3">s</span>
                </BigNumber>
                <p class="mt-3 text-xs leading-relaxed text-ink-3">
                    A plain local <code class="core-code">ref</code>. It
                    survives every prop update because the component never
                    remounts.
                </p>
            </div>
        </div>
    </Panel>
</template>
