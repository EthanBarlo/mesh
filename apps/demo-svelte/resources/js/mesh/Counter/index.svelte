<script lang="ts">
    import { useEntangle } from "@mesh/svelte";

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

<!--
    Card C on the home page. It shares the `.ctr` drafting card markup
    (home.css) with the two Livewire cards, so all three read as one drawing.
-->
<div class="ctr ctr--mesh" data-kind="mesh">
    <div class="ctr__head">
        <span class="tag ctr__tag">C</span>
        <p class="ctr__title">
            <span class="ctr__name">Mesh + Svelte</span>
            <span class="ctr__via">useEntangle('count')</span>
        </p>
    </div>

    <div class="ctr__body">
        <span class="ctr__value">{count.value}</span>
        <span class="ctr__k k k--caps">$count</span>
    </div>

    <div class="ctr__actions">
        <button
            type="button"
            class="btn btn--line ctr__btn"
            onclick={() => (count.value = count.value - 1)}
            aria-label="Decrement counter"
        >
            −
        </button>

        <button
            type="button"
            class="btn ctr__reset"
            onclick={() => (count.value = initialCount)}
            aria-label="Reset counter"
        >
            Reset
        </button>

        <button
            type="button"
            class="btn btn--solid ctr__btn"
            onclick={() => (count.value = count.value + 1)}
            aria-label="Increment counter"
        >
            +
        </button>
    </div>
</div>
