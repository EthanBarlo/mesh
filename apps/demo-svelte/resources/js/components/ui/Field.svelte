<script lang="ts">
    import type { Snippet } from "svelte";
    import type { HTMLAttributes } from "svelte/elements";
    import { cn } from "./cn";

    interface Props extends HTMLAttributes<HTMLDivElement> {
        label: string;
        htmlFor?: string;
        /** Error bag entry for this field — the first message is shown. */
        error?: string[] | null;
        hint?: string;
        /** Small annotation rendered to the right of the label. */
        corner?: Snippet;
        children?: Snippet;
    }

    let {
        label,
        htmlFor,
        error,
        hint,
        corner,
        children,
        class: className,
        ...rest
    }: Props = $props();
</script>

<!-- Label + control + first validation message, in the demo's form rhythm. -->
<div {...rest} class={className}>
    <div class="flex items-baseline justify-between mb-1.5">
        <label for={htmlFor} class="block text-sm font-medium text-zinc-300">
            {label}
        </label>
        <!-- Small annotation rendered to the right of the label. -->
        {@render corner?.()}
    </div>
    {@render children?.()}
    {#if error && error.length > 0}
        <p class="mt-1.5 text-xs text-rose-400" role="alert">
            {error[0]}
        </p>
    {/if}
    {#if hint}
        <p class="mt-1.5 text-xs text-zinc-500">{hint}</p>
    {/if}
</div>
