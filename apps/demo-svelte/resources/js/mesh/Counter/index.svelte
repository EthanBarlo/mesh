<script lang="ts">
    import { useEntangle } from "@mesh/svelte";
    import { BigNumber, Button, Eyebrow, GlowCard } from "@/components/ui";

    interface Props {
        initialCount: number;
    }

    let { initialCount }: Props = $props();

    // Deferred (lazy) entangle: clicks write to the shared client-side
    // Livewire store, so the Alpine card follows instantly with zero
    // network requests — the server hears about it piggybacked on the
    // next Livewire round-trip (e.g. the Pure Livewire card's buttons).
    const count = useEntangle<number>("count");
</script>

<GlowCard contentClassName="p-8">
    <div class="text-center">
        <Eyebrow class="mb-4 block">Svelte Counter</Eyebrow>

        <div class="my-6">
            <BigNumber class="text-7xl">{count.value}</BigNumber>
        </div>

        <div class="flex items-center justify-center gap-3">
            <Button
                variant="secondary"
                size="icon"
                aria-label="Decrement counter"
                onclick={() => (count.value = count.value - 1)}
            >
                -
            </Button>

            <Button
                variant="ghost"
                class="px-5 h-14"
                aria-label="Reset counter"
                onclick={() => (count.value = initialCount)}
            >
                Reset
            </Button>

            <Button
                variant="primary"
                size="icon"
                aria-label="Increment counter"
                onclick={() => (count.value = count.value + 1)}
            >
                +
            </Button>
        </div>
    </div>
</GlowCard>
