<script module lang="ts">
    type Tone = "ink" | "accent" | "blueline" | "danger" | "muted";

    /**
     * The five drafting tones, plus the older palette names, which map onto
     * them so existing call sites keep compiling: rose → danger, orange →
     * accent, emerald → ink, amber/cyan/blue/violet → blueline, slate → muted.
     */
    export type BadgeColor =
        | Tone
        | "rose"
        | "orange"
        | "amber"
        | "emerald"
        | "cyan"
        | "blue"
        | "violet"
        | "slate";

    const toneOf: Record<BadgeColor, Tone> = {
        ink: "ink",
        accent: "accent",
        blueline: "blueline",
        danger: "danger",
        muted: "muted",
        rose: "danger",
        orange: "accent",
        amber: "blueline",
        emerald: "ink",
        cyan: "blueline",
        blue: "blueline",
        violet: "blueline",
        slate: "muted",
    };

    const tones: Record<Tone, { badge: string; dot: string }> = {
        ink: { badge: "border-ink bg-paper text-ink", dot: "bg-current" },
        accent: { badge: "border-accent bg-accent-wash text-accent-ink", dot: "bg-current" },
        blueline: { badge: "border-blueline bg-paper text-blueline", dot: "bg-current" },
        danger: { badge: "border-danger bg-danger-wash text-danger", dot: "bg-current" },
        // Muted gets a hollow dot: present, but not calling for attention.
        muted: { badge: "border-line-2 bg-paper text-ink-3", dot: "border border-current" },
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
        color = "muted",
        dot = false,
        children,
        class: className,
        ...rest
    }: Props = $props();

    const t = $derived(tones[toneOf[color]]);
</script>

<!-- A square mono tag. -->
<span
    {...rest}
    class={cn(
        "inline-flex h-[22px] items-center gap-1.5 whitespace-nowrap border px-2 font-mono text-[10.5px] font-normal uppercase leading-none tracking-[0.08em] tabular-nums",
        t.badge,
        className,
    )}
>
    {#if dot}
        <span
            class={cn("size-1.5 shrink-0 rounded-full", t.dot)}
            aria-hidden="true"
        ></span>
    {/if}
    {@render children?.()}
</span>
