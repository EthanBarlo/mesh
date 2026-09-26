<script lang="ts">
    import type { Snippet } from "svelte";
    import type { HTMLAttributes } from "svelte/elements";
    import { cn } from "./cn";

    /**
     * A flat mono card. The `glow` and `glowClassName` props are accepted for
     * backwards compatibility but are visual no-ops — no halo is rendered.
     */
    interface Props extends HTMLAttributes<HTMLDivElement> {
        /** @deprecated No-op — the mono design renders no halo. Kept so call sites compile. */
        glow?: string;
        /** @deprecated No-op — the mono design renders no halo. Kept so call sites compile. */
        glowClassName?: string;
        /** Classes for the inner card surface (padding, layout, …). */
        contentClassName?: string;
        children?: Snippet;
    }

    let {
        glow,
        glowClassName,
        contentClassName,
        children,
        class: className,
        ...rest
    }: Props = $props();
</script>

<div {...rest} class={cn("relative group", className)}>
    <div
        class={cn(
            "relative rounded-xl bg-white/[0.02] border border-white/5",
            contentClassName,
        )}
    >
        {@render children?.()}
    </div>
</div>
