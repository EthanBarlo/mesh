<script lang="ts">
    import type { Snippet } from "svelte";
    import type { HTMLAttributes } from "svelte/elements";
    import { cn } from "./cn";

    interface Props extends HTMLAttributes<HTMLSpanElement> {
        children?: Snippet;
    }

    let { children, class: className, ...rest }: Props = $props();
</script>

<!-- Tiny uppercase section label. -->
<span
    {...rest}
    class={cn(
        "text-xs font-medium uppercase tracking-widest text-zinc-500",
        className,
    )}
>
    {@render children?.()}
</span>
