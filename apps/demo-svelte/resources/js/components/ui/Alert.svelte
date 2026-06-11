<script module lang="ts">
    type Tone = "error" | "success";

    const tones: Record<
        Tone,
        { panel: string; title: string; body: string; icon: string }
    > = {
        error: {
            panel: "border-white/10 bg-white/[0.02]",
            title: "text-rose-400",
            body: "text-zinc-400",
            icon: "text-rose-400",
        },
        success: {
            panel: "border-white/10 bg-white/[0.02]",
            title: "text-emerald-400",
            body: "text-zinc-400",
            icon: "text-emerald-400",
        },
    };
</script>

<script lang="ts">
    import type { Snippet } from "svelte";
    import type { HTMLAttributes } from "svelte/elements";
    import { cn } from "./cn";

    interface Props extends Omit<HTMLAttributes<HTMLDivElement>, "title"> {
        tone?: Tone;
        /** Plain-text title — pass a snippet for rich content. */
        title?: string | Snippet;
        icon?: Snippet;
        action?: Snippet;
        children?: Snippet;
    }

    let {
        tone = "error",
        title,
        icon,
        action,
        children,
        class: className,
        ...rest
    }: Props = $props();

    const t = $derived(tones[tone]);
</script>

<div
    {...rest}
    class={cn(
        "flex items-start justify-between gap-4 rounded-xl border p-5",
        t.panel,
        className,
    )}
>
    <div class="flex min-w-0 items-start gap-3">
        {#if icon}
            <span class={cn("mt-0.5 shrink-0", t.icon)}>
                {@render icon()}
            </span>
        {/if}
        <div class="min-w-0">
            <p class={cn("font-medium", t.title)}>
                {#if typeof title === "function"}{@render title()}{:else}{title}{/if}
            </p>
            {#if children}
                <div class={cn("mt-0.5 text-sm", t.body)}>
                    {@render children()}
                </div>
            {/if}
        </div>
    </div>
    <!-- Rendered on the trailing edge, e.g. a retry button. -->
    {#if action}
        <div class="shrink-0">
            {@render action()}
        </div>
    {/if}
</div>
