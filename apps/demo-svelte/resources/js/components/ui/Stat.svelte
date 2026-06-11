<script lang="ts">
    import type { HTMLAttributes } from "svelte/elements";
    import { cn } from "./cn";

    interface Props extends HTMLAttributes<HTMLDivElement> {
        label: string | number;
        value: string | number;
    }

    let { label, value, class: className, ...rest }: Props = $props();
</script>

<!-- Compact value-over-label stat tile. -->
<div
    {...rest}
    class={cn(
        "p-3 rounded-lg bg-white/[0.02] border border-white/5 text-center",
        className,
    )}
>
    <p
        class="text-lg font-semibold text-white tabular-nums truncate"
        title={String(value)}
    >
        {value}
    </p>
    <p class="mt-0.5 text-[11px] font-medium uppercase tracking-widest text-zinc-500">
        {label}
    </p>
</div>
