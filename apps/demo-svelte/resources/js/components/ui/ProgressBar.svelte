<script lang="ts">
    import type { HTMLAttributes } from "svelte/elements";
    import { cn } from "./cn";

    interface Props extends HTMLAttributes<HTMLDivElement> {
        /** Percentage, 0–100. */
        value: number;
    }

    let { value, class: className, ...rest }: Props = $props();
</script>

<div
    {...rest}
    class={cn("h-2.5 overflow-hidden rounded-full bg-white/5", className)}
    role="progressbar"
    aria-valuenow={value}
    aria-valuemin={0}
    aria-valuemax={100}
>
    <div
        class="h-full rounded-full bg-white transition-[width] duration-200"
        style:width="{value}%"
    ></div>
</div>
