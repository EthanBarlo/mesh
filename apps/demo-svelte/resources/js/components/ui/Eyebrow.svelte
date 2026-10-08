<script lang="ts">
    import type { Snippet } from "svelte";
    import type { HTMLAttributes } from "svelte/elements";
    import { cn } from "./cn";

    interface Props extends HTMLAttributes<HTMLSpanElement> {
        children?: Snippet;
    }

    let { children, class: className, ...rest }: Props = $props();
</script>

<!-- The annotation voice (`.k .k--caps`): 11px tracked mono caps. -->
<span
    {...rest}
    class={cn(
        "font-mono text-[0.6875rem] font-normal uppercase leading-normal tracking-[0.1em] text-ink-3",
        className,
    )}
>
    {@render children?.()}
</span>
