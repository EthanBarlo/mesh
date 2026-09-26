<script module lang="ts">
    // Pip positions on a 3x3 grid for each die face.
    const PIPS: Record<number, number[]> = {
        1: [4],
        2: [2, 6],
        3: [2, 4, 6],
        4: [0, 2, 6, 8],
        5: [0, 2, 4, 6, 8],
        6: [0, 2, 3, 5, 6, 8],
    };

    export interface DieProps {
        value: number;
    }
</script>

<script lang="ts">
    let { value }: DieProps = $props();
</script>

<!-- A single die face rendered as pips on a 3x3 grid. -->
<div
    class="w-14 h-14 rounded-xl bg-white/5 border border-white/10 grid grid-cols-3 grid-rows-3 p-2.5"
    role="img"
    aria-label={`Die showing ${value}`}
>
    {#each Array.from({ length: 9 }) as _, i (i)}
        <span class="flex items-center justify-center">
            {#if (PIPS[value] ?? []).includes(i)}
                <span class="w-2 h-2 rounded-full bg-white"></span>
            {/if}
        </span>
    {/each}
</div>
