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

    const active = $derived(
        options.findIndex((option) => option.value === value),
    );
</script>

<!--
    An exclusive choice drawn like the docs' renderer switch: an ink frame of
    equal mono cells, with a solid ink block that slides to the active one.
-->
<div
    {...rest}
    class={cn(
        "relative isolate inline-grid auto-cols-fr grid-flow-col border border-ink bg-paper",
        className,
    )}
    role="group"
>
    <span
        aria-hidden="true"
        class={cn(
            "absolute inset-y-0 left-0 -z-10 bg-ink transition-transform duration-320 ease-(--ease-spring) motion-reduce:transition-none",
            active < 0 && "opacity-0",
        )}
        style:width="{100 / Math.max(options.length, 1)}%"
        style:transform="translateX({Math.max(active, 0) * 100}%)"
    ></span>
    {#each options as option, index (option.value)}
        <button
            type="button"
            aria-pressed={index === active}
            class={cn(
                "min-h-10 whitespace-nowrap px-3 font-mono text-[11px] uppercase tracking-[0.06em] transition-colors duration-240 focus-visible:outline-2 focus-visible:-outline-offset-4 focus-visible:outline-accent motion-reduce:transition-none sm:min-h-8",
                index === active ? "text-paper" : "text-ink-2 hover:text-ink",
            )}
            onclick={() => (value = option.value)}
        >
            {option.label}
        </button>
    {/each}
</div>
