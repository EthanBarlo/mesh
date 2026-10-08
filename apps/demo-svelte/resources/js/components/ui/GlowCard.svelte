<script lang="ts">
    import type { Snippet } from "svelte";
    import type { HTMLAttributes } from "svelte/elements";
    import { cn } from "./cn";

    /**
     * The featured card: a paper surface with a hairline border and
     * registration marks. `glow` and `glowClassName` are accepted for
     * backwards compatibility but are visual no-ops.
     */
    interface Props extends HTMLAttributes<HTMLDivElement> {
        /** @deprecated No-op — the drafting design renders no halo. Kept so call sites compile. */
        glow?: string;
        /** @deprecated No-op — the drafting design renders no halo. Kept so call sites compile. */
        glowClassName?: string;
        /** Classes for the inner card surface (padding, layout, …). */
        contentClassName?: string;
        /** Registration marks on two corners. On by default. */
        ticks?: boolean;
        children?: Snippet;
    }

    let {
        glow: _glow,
        glowClassName: _glowClassName,
        contentClassName,
        ticks = true,
        children,
        class: className,
        ...rest
    }: Props = $props();
</script>

<div {...rest} class={cn("relative group", className)}>
    <div
        class={cn(
            "relative border border-line-2 bg-paper",
            ticks && "ui-ticks",
            contentClassName,
        )}
    >
        {@render children?.()}
    </div>
</div>
