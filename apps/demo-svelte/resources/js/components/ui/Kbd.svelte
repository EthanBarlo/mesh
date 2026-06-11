<script lang="ts">
    import type { Snippet } from "svelte";
    import type { HTMLAttributes } from "svelte/elements";
    import { cn } from "./cn";

    interface Props extends HTMLAttributes<HTMLElement> {
        children?: Snippet;
    }

    let { children, class: className, ...rest }: Props = $props();
</script>

<kbd
    {...rest}
    class={cn(
        "px-1.5 py-0.5 rounded-md bg-white/5 border border-white/10 font-mono text-zinc-300",
        className,
    )}
>
    {@render children?.()}
</kbd>
