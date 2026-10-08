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

<!-- A mono label, the control, then the first validation message. -->
<div {...rest} class={cn(className)}>
    <div class="mb-1.5 flex items-baseline justify-between gap-3">
        <label
            for={htmlFor}
            class="block font-mono text-[0.6875rem] uppercase leading-normal tracking-[0.1em] text-ink-2"
        >
            {label}
        </label>
        {@render corner?.()}
    </div>
    {@render children?.()}
    {#if error && error.length > 0}
        <p
            class="mt-1.5 flex items-start gap-1.5 text-xs leading-snug text-danger"
            role="alert"
        >
            <svg
                class="mt-[2px] size-2.5 shrink-0"
                viewBox="0 0 10 10"
                aria-hidden="true"
            >
                <path d="M5 .8 9.4 9.2H.6Z" fill="currentColor" />
            </svg>
            <span>{error[0]}</span>
        </p>
    {/if}
    {#if hint}
        <p class="mt-1.5 text-xs text-ink-3">{hint}</p>
    {/if}
</div>
