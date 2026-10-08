<script lang="ts">
    import type { Snippet } from "svelte";
    import type { HTMLAttributes } from "svelte/elements";
    import { cn } from "./cn";

    interface Props extends HTMLAttributes<HTMLElement> {
        children?: Snippet;
    }

    let { children, class: className, ...rest }: Props = $props();
</script>

<!-- A mono keycap: hairline sides, a heavier bottom edge. -->
<kbd
    {...rest}
    class={cn(
        "inline-flex min-w-[1.75em] items-center justify-center border border-b-2 border-line-3 bg-paper px-1.5 py-px font-mono text-[0.85em] leading-[1.4] text-ink",
        className,
    )}
>
    {@render children?.()}
</kbd>
