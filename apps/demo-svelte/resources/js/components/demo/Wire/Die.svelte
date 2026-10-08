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
        class?: string;
    }
</script>

<script lang="ts">
    import { cn } from "@/components/ui";

    let { value, class: className }: DieProps = $props();
</script>

<!-- A single die face: a square drawn in ink with pips on a 3x3 grid. -->
<div
    class={cn(
        "grid size-14 grid-cols-3 grid-rows-3 border border-ink bg-paper p-2.5",
        className,
    )}
    role="img"
    aria-label={`Die showing ${value}`}
>
    {#each Array.from({ length: 9 }) as _, i (i)}
        <span class="flex items-center justify-center">
            {#if (PIPS[value] ?? []).includes(i)}
                <span class="size-2 rounded-full bg-ink"></span>
            {/if}
        </span>
    {/each}
</div>
