<script setup lang="ts">
import { onMounted, onUnmounted, ref } from "vue";
import { BigNumber, Eyebrow, GlowCard } from "@/components/ui";

/**
 * A deliberately tiny component. Its only job is to prove it just mounted:
 * the ticker starts at 0.0s the moment the chunk arrives and the component
 * renders for the first time.
 */
defineProps<{
    greeting: string;
    chunkNote: string;
}>();

const mountedAt = Date.now();
const elapsed = ref(0);

let intervalId: number | undefined;

onMounted(() => {
    intervalId = window.setInterval(() => {
        elapsed.value = (Date.now() - mountedAt) / 1000;
    }, 100);
});

onUnmounted(() => {
    window.clearInterval(intervalId);
});
</script>

<template>
    <GlowCard content-class-name="p-6 flex flex-col sm:flex-row sm:items-center gap-5">
        <div class="flex-1">
            <Eyebrow>Architecture/HelloIsland</Eyebrow>
            <h3 class="mt-1 text-xl font-semibold tracking-tight text-white">{{ greeting }}</h3>
            <p class="mt-1 text-sm text-zinc-400 leading-relaxed">{{ chunkNote }}</p>
        </div>

        <div class="shrink-0 px-5 py-4 rounded-xl bg-white/[0.02] border border-white/5 text-center">
            <BigNumber class="text-3xl">{{ elapsed.toFixed(1) }}s</BigNumber>
            <div class="mt-1 text-[11px] font-medium uppercase tracking-widest text-zinc-500">
                since mount
            </div>
        </div>
    </GlowCard>
</template>
