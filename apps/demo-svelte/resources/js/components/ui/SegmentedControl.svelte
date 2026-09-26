<script lang="ts" generics="T extends string">
    import type { HTMLAttributes } from "svelte/elements";
    import { cn } from "./cn";

    interface Props extends Omit<HTMLAttributes<HTMLDivElement>, "value"> {
        options: { value: T; label: string }[];
        value: T;
    }

    let {
        options,
        value = $bindable(),
        class: className,
        ...rest
    }: Props = $props();
</script>

<!-- Pill-shaped exclusive choice group with a solid white active segment. -->
<div
    {...rest}
    class={cn(
        "inline-flex items-center gap-1 p-1 rounded-lg bg-white/[0.02] border border-white/10",
        className,
    )}
    role="group"
>
    {#each options as option (option.value)}
        <button
            type="button"
            aria-pressed={option.value === value}
            class={cn(
                "px-4 py-1.5 rounded-md text-sm font-medium transition-colors duration-150 active:scale-95 focus:outline-none focus:ring-2 focus:ring-white/20 focus:ring-offset-2 focus:ring-offset-zinc-950",
                option.value === value
                    ? "bg-white text-zinc-950"
                    : "text-zinc-400 hover:text-white hover:bg-white/5",
            )}
            onclick={() => (value = option.value)}
        >
            {option.label}
        </button>
    {/each}
</div>
