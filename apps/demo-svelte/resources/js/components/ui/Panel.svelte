<script lang="ts">
    import type { Snippet } from "svelte";
    import type { HTMLAttributes } from "svelte/elements";
    import { cn } from "./cn";

    interface Props extends HTMLAttributes<HTMLDivElement> {
        children?: Snippet;
    }

    let { children, class: className, ...rest }: Props = $props();
</script>

<!-- The standard demo surface: a faint mono panel with a hairline border. -->
<div
    {...rest}
    class={cn("p-5 rounded-xl bg-white/[0.02] border border-white/5", className)}
>
    {@render children?.()}
</div>
