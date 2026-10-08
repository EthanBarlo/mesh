<script lang="ts">
    import type { HTMLAttributes } from "svelte/elements";
    import { cn } from "./cn";

    interface Props extends HTMLAttributes<HTMLDivElement> {
        label: string | number;
        value: string | number;
    }

    let { label, value, class: className, ...rest }: Props = $props();
</script>

<!-- A title-block cell: a mono label over the value. -->
<div
    {...rest}
    class={cn(
        "min-w-0 border border-line-2 bg-paper px-3 pt-2 pb-2.5",
        className,
    )}
>
    <p
        class="truncate font-mono text-[10px] uppercase leading-normal tracking-[0.1em] text-ink-3"
    >
        {label}
    </p>
    <p
        class="mt-0.5 truncate text-lg font-semibold leading-snug tracking-[-0.02em] tabular-nums text-ink"
        title={String(value)}
    >
        {value}
    </p>
</div>
