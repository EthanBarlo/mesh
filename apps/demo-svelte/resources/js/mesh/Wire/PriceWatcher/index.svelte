<script lang="ts">
    import { onDestroy } from "svelte";
    import { useWire } from "@mesh/svelte";
    import { Button, Eyebrow, Panel } from "@/components/ui";
    import Sparkline from "@/components/demo/Wire/Sparkline.svelte";

    interface PriceWatcherProps {
        symbol: string;
        initialPrice: number;
    }

    let { symbol, initialPrice }: PriceWatcherProps = $props();

    const MAX_POINTS = 40;

    const wire = useWire();

    let history = $state<number[]>([initialPrice]);
    let paused = $state(false);

    // Inbound: the server owns `price` — every change it makes flows
    // through $watch into local Svelte state.
    const unwatchPrice = wire.$watch("price", (value: number) => {
        history = [...history, value].slice(-MAX_POINTS);
    });

    // Outbound: all Svelte does is schedule the next server-side tick.
    // The interval is cleared on destroy (and while paused).
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

    $effect(() => {
        if (paused) {
            stopTicking();
        } else {
            startTicking();
        }
    });

    onDestroy(() => {
        stopTicking();
        unwatchPrice();
    });

    const price = $derived(history[history.length - 1]);
    const previous = $derived(
        history.length > 1 ? history[history.length - 2] : null,
    );
    const direction = $derived(
        previous === null ? null : price >= previous ? "up" : "down",
    );
    const delta = $derived(previous === null ? 0 : price - previous);

    const min = $derived(Math.min(...history));
    const max = $derived(Math.max(...history));

    const priceColor = $derived(
        direction === "up"
            ? "text-emerald-400"
            : direction === "down"
              ? "text-rose-400"
              : "text-white",
    );
</script>

<Panel>
    <div class="flex flex-wrap items-start justify-between gap-4">
        <div>
            <Eyebrow>{symbol} · server-side random walk</Eyebrow>
            <div class="mt-1 flex items-baseline gap-3">
                <!-- Key by history length so each server tick re-renders a fresh node -->
                {#key history.length}
                    <span
                        class={`text-4xl font-semibold tracking-tight tabular-nums transition-colors duration-300 ${priceColor}`}
                    >
                        ${price.toFixed(2)}
                    </span>
                {/key}
                {#if direction !== null}
                    <span
                        class={`text-sm font-semibold tabular-nums ${
                            direction === "up" ? "text-emerald-400" : "text-rose-400"
                        }`}
                    >
                        {direction === "up" ? "▲" : "▼"} {Math.abs(delta).toFixed(2)}
                    </span>
                {/if}
            </div>
        </div>

        <Button
            variant="secondary"
            size="sm"
            aria-pressed={paused}
            onclick={() => (paused = !paused)}
        >
            {paused ? "Resume ticks" : "Pause ticks"}
        </Button>
    </div>

    <Sparkline
        class="mt-4"
        values={history}
        {direction}
        ariaLabel={`Sparkline of the last ${history.length} prices for ${symbol}`}
    />

    <div class="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs text-zinc-500">
        <span>
            Low <span class="text-zinc-300 tabular-nums">${min.toFixed(2)}</span> · High
            <span class="text-zinc-300 tabular-nums">${max.toFixed(2)}</span> · {history.length} points
        </span>
        <span>
            <code class="font-mono text-zinc-400">wire.$call("tick")</code> every 2s ·
            <code class="font-mono text-zinc-400">wire.$watch("price", …)</code> streams it back
        </span>
    </div>
</Panel>
