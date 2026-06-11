<script module lang="ts">
    export type BadgeColor =
        | "rose"
        | "orange"
        | "amber"
        | "emerald"
        | "cyan"
        | "blue"
        | "violet"
        | "slate";

    // Semantic colors (rose/amber/emerald) keep a restrained text accent on a
    // mono chip; decorative colors all collapse to the plain mono chip.
    const mono = { badge: "bg-white/5 text-zinc-300 border-white/10", dot: "bg-zinc-500" };

    const colors: Record<BadgeColor, { badge: string; dot: string }> = {
        rose: { badge: "bg-white/5 text-rose-400 border-white/10", dot: "bg-rose-500" },
        orange: mono,
        amber: { badge: "bg-white/5 text-amber-400 border-white/10", dot: "bg-amber-400" },
        emerald: { badge: "bg-white/5 text-emerald-400 border-white/10", dot: "bg-emerald-400" },
        cyan: mono,
        blue: mono,
        violet: mono,
        slate: mono,
    };
</script>

<script lang="ts">
    import type { Snippet } from "svelte";
    import type { HTMLAttributes } from "svelte/elements";
    import { cn } from "./cn";

    interface Props extends HTMLAttributes<HTMLSpanElement> {
        color?: BadgeColor;
        /** Renders a small status dot before the label. */
        dot?: boolean;
        children?: Snippet;
    }

    let {
        color = "slate",
        dot = false,
        children,
        class: className,
        ...rest
    }: Props = $props();
</script>

<span
    {...rest}
    class={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border text-xs font-medium",
        colors[color].badge,
        className,
    )}
>
    {#if dot}
        <span
            class={cn("w-1.5 h-1.5 rounded-full", colors[color].dot)}
            aria-hidden="true"
        ></span>
    {/if}
    {@render children?.()}
</span>
