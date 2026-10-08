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

<!-- A native select, drawn like the inputs. The arrow follows the color scheme. -->
<select
    {...rest}
    bind:value
    class={cn(
        "border border-line-2 bg-paper px-2.5 py-1.5 font-mono text-base tabular-nums text-ink outline-none transition-[border-color,box-shadow] duration-150 ease-(--ease-out) hover:border-line-3 focus:border-accent focus:ring-1 focus:ring-accent motion-reduce:transition-none sm:text-xs",
        className,
    )}
>
    {@render children?.()}
</select>
