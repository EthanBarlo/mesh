<script lang="ts">
    import type { Snippet } from "svelte";
    import type { HTMLSelectAttributes } from "svelte/elements";
    import { cn } from "./cn";

    interface Props extends Omit<HTMLSelectAttributes, "value"> {
        value?: string | number;
        children?: Snippet;
    }

    let {
        value = $bindable(),
        children,
        class: className,
        ...rest
    }: Props = $props();
</script>

<select
    {...rest}
    bind:value
    class={cn(
        "px-2.5 py-1.5 rounded-lg bg-white/[0.02] border border-white/10 text-sm text-white transition-colors duration-150 focus:outline-none focus:border-white/20 focus:ring-2 focus:ring-white/20",
        className,
    )}
>
    {@render children?.()}
</select>
