<script setup lang="ts">
import { onMounted, onUnmounted, ref } from "vue";
import { Eyebrow, Panel } from "@/components/ui";
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
    <Panel class="p-6">
        <div class="flex flex-col sm:flex-row sm:items-start gap-6">
            <!-- Server-computed palette prop -->
            <PaletteSwatches :theme="theme" :palette="palette" class="grow" />

            <!-- Local Vue state that survives prop updates -->
            <div
                class="shrink-0 sm:w-56 p-4 rounded-xl bg-white/[0.02] border border-white/5 text-center"
            >
                <Eyebrow>Mounted for</Eyebrow>
                <p
                    class="my-2 text-4xl font-semibold tracking-tight tabular-nums"
                    :style="{ color: palette.accent }"
                >
                    {{ seconds }}s
                </p>
                <p class="text-xs text-zinc-500 leading-relaxed">
                    Local state survives server re-renders — this component
                    never remounts.
                </p>
            </div>
        </div>
    </Panel>
</template>
