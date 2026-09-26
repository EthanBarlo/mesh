<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from "vue";
import { useWire } from "@mesh/vue";
import { Button, Eyebrow, Panel } from "@/components/ui";
import Sparkline from "@/components/demo/Wire/Sparkline.vue";

interface PriceWatcherProps {
    symbol: string;
    initialPrice: number;
}

const props = defineProps<PriceWatcherProps>();

const MAX_POINTS = 40;

const wire = useWire();

const history = ref<number[]>([props.initialPrice]);
const paused = ref(false);

// Inbound: the server owns `price` — every change it makes flows
// through $watch into local Vue state.
const unwatchPrice = wire.$watch("price", (value: number) => {
    history.value = [...history.value, value].slice(-MAX_POINTS);
});

// Outbound: all Vue does is schedule the next server-side tick.
// The interval is cleared on unmount (and while paused).
let intervalId: number | null = null;

const stopTicking = () => {
    if (intervalId !== null) {
        window.clearInterval(intervalId);
        intervalId = null;
    }
};

const startTicking = () => {
    stopTicking();
    intervalId = window.setInterval(() => {
        void wire.$call("tick");
    }, 2000);
};

onMounted(startTicking);
watch(paused, (isPaused) => (isPaused ? stopTicking() : startTicking()));

onUnmounted(() => {
    stopTicking();
    unwatchPrice();
});

const price = computed(() => history.value[history.value.length - 1]);
const previous = computed(() =>
    history.value.length > 1 ? history.value[history.value.length - 2] : null,
);
const direction = computed(() =>
    previous.value === null ? null : price.value >= previous.value ? "up" : "down",
);
const delta = computed(() => (previous.value === null ? 0 : price.value - previous.value));

const min = computed(() => Math.min(...history.value));
const max = computed(() => Math.max(...history.value));

const priceColor = computed(() =>
    direction.value === "up"
        ? "text-emerald-400"
        : direction.value === "down"
          ? "text-rose-400"
          : "text-white",
);
</script>

<template>
    <Panel>
        <div class="flex flex-wrap items-start justify-between gap-4">
            <div>
                <Eyebrow>{{ symbol }} · server-side random walk</Eyebrow>
                <div class="mt-1 flex items-baseline gap-3">
                    <!-- Key by history length so each server tick re-renders a fresh node -->
                    <span
                        :key="history.length"
                        :class="`text-4xl font-semibold tracking-tight tabular-nums transition-colors duration-300 ${priceColor}`"
                    >
                        ${{ price.toFixed(2) }}
                    </span>
                    <span
                        v-if="direction !== null"
                        :class="`text-sm font-semibold tabular-nums ${
                            direction === 'up' ? 'text-emerald-400' : 'text-rose-400'
                        }`"
                    >
                        {{ direction === "up" ? "▲" : "▼" }} {{ Math.abs(delta).toFixed(2) }}
                    </span>
                </div>
            </div>

            <Button
                variant="secondary"
                size="sm"
                :aria-pressed="paused"
                @click="paused = !paused"
            >
                {{ paused ? "Resume ticks" : "Pause ticks" }}
            </Button>
        </div>

        <Sparkline
            class="mt-4"
            :values="history"
            :direction="direction"
            :aria-label="`Sparkline of the last ${history.length} prices for ${symbol}`"
        />

        <div class="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs text-zinc-500">
            <span>
                Low <span class="text-zinc-300 tabular-nums">${{ min.toFixed(2) }}</span> · High
                <span class="text-zinc-300 tabular-nums">${{ max.toFixed(2) }}</span> · {{ history.length }} points
            </span>
            <span>
                <code class="font-mono text-zinc-400">wire.$call("tick")</code> every 2s ·
                <code class="font-mono text-zinc-400">wire.$watch("price", …)</code> streams it back
            </span>
        </div>
    </Panel>
</template>
