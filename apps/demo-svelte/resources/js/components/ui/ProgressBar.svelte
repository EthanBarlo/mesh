<script lang="ts">
    import type { HTMLAttributes } from "svelte/elements";
    import { cn } from "./cn";

    interface Props extends HTMLAttributes<HTMLDivElement> {
        /** Percentage, 0–100. */
        value: number;
        /** The fill: the accent (default) or ink. */
        tone?: "accent" | "ink";
    }

    let {
        value,
        tone = "accent",
        class: className,
        ...rest
    }: Props = $props();
</script>

<!-- A ruler: a hairline baseline with quarter ticks and a filled bar along it. -->
<div
    {...rest}
    class={cn("relative h-2.5", className)}
    role="progressbar"
    aria-valuenow={value}
    aria-valuemin={0}
    aria-valuemax={100}
>
    <span
        aria-hidden="true"
        class="ui-progress__ticks absolute inset-x-0 bottom-0 h-[5px]"
    ></span>
    <span
        aria-hidden="true"
        class="absolute inset-x-0 bottom-0 h-px bg-line-3"
    ></span>
    <span
        aria-hidden="true"
        class={cn(
            "absolute bottom-0 left-0 h-1 transition-[width] duration-200 ease-(--ease-out) motion-reduce:transition-none",
            tone === "ink" ? "bg-ink" : "bg-accent",
        )}
        style:width="{Math.min(100, Math.max(0, value))}%"
    ></span>
</div>
