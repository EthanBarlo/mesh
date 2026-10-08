<script lang="ts">
    import type { Snippet } from "svelte";
    import type { HTMLAttributes } from "svelte/elements";
    import { cn } from "./cn";

    interface Props extends HTMLAttributes<HTMLDivElement> {
        /** Registration marks on two corners, like a figure stage. */
        ticks?: boolean;
        children?: Snippet;
    }

    let {
        ticks = false,
        children,
        class: className,
        ...rest
    }: Props = $props();
</script>

<!-- The standard demo surface: paper, a hairline border, square corners. -->
<div
    {...rest}
    class={cn(
        "relative border border-line-2 bg-paper p-5",
        ticks && "ui-ticks",
        className,
    )}
>
    {@render children?.()}
</div>
