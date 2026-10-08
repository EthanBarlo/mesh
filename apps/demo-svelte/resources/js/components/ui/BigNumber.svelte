<script lang="ts">
    import type { Snippet } from "svelte";
    import type { HTMLAttributes } from "svelte/elements";
    import { cn } from "./cn";

    interface Props extends HTMLAttributes<HTMLSpanElement> {
        children?: Snippet;
    }

    let { children, class: className, ...rest }: Props = $props();
</script>

<!-- Large numeral — size it at the call site (text-5xl, text-7xl, …). -->
<span
    {...rest}
    class={cn(
        "font-sans font-semibold tracking-[-0.045em] tabular-nums text-ink",
        className,
    )}
>
    {@render children?.()}
</span>
