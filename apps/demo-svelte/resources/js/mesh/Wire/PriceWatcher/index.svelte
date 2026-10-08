<script lang="ts">
    import { onDestroy } from "svelte";
    import { useWire } from "@mesh/svelte";
    import { BigNumber, Button, Panel } from "@/components/ui";
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
</script>

<Panel>
    <div class="flex flex-wrap items-start justify-between gap-4">
        <div>
            <p class="k k--caps text-ink-3">{symbol} · server-side random walk</p>
            <div class="mt-1 flex items-baseline gap-3">
                <!-- Key by history length so each server tick re-renders a fresh node -->
                {#key history.length}
                    <BigNumber class="text-4xl">${price.toFixed(2)}</BigNumber>
                {/key}
                {#if direction !== null}
                    <span class="font-mono text-sm tabular-nums text-ink-2">
                        <span aria-hidden="true">{direction === "up" ? "▲" : "▼"}</span><span class="sr-only">{direction === "up" ? "Up" : "Down"}</span>
                        {Math.abs(delta).toFixed(2)}
                    </span>
                {/if}
            </div>
        </div>

        <div class="flex items-center gap-4">
            <span class="core-status">
                <span
                    class="core-dot"
                    data-state={paused ? "off" : "live"}
                    aria-hidden="true"
                ></span>
                {paused ? "Paused" : "Every 2s"}
            </span>
            <Button
                variant="secondary"
                size="sm"
                aria-pressed={paused}
                onclick={() => (paused = !paused)}
            >
                {paused ? "Resume ticks" : "Pause ticks"}
            </Button>
        </div>
    </div>

    <Sparkline
        class="mt-6"
        values={history}
        {direction}
        ariaLabel={`Sparkline of the last ${history.length} prices for ${symbol}`}
    />

    <!-- Dimension line spanning the plot: how many ticks it holds. -->
    <div class="mt-2 pl-14">
        <div class="core-dim">
            <span>{history.length} of {MAX_POINTS} points</span>
        </div>
    </div>

    <p class="mt-4 text-xs leading-relaxed text-ink-3">
        <code class="core-code">wire.$call("tick")</code> every 2s.
        <code class="core-code">wire.$watch("price", …)</code> streams each
        change back.
    </p>
</Panel>
