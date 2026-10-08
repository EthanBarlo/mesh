<script lang="ts">
    import type { HTMLAttributes } from "svelte/elements";
    import { Input, cn } from "@/components/ui";

    /** Search input with a drawn magnifier, for client-side table filtering. */
    interface Props extends HTMLAttributes<HTMLDivElement> {
        placeholder?: string;
        ariaLabel?: string;
        value?: string;
    }

    let {
        placeholder,
        ariaLabel,
        value = $bindable(""),
        class: className,
        ...rest
    }: Props = $props();
</script>

<div {...rest} class={cn("relative w-full sm:w-64", className)}>
    <svg
        class="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-ink-3 pointer-events-none"
        viewBox="0 0 16 16"
        fill="none"
        stroke="currentColor"
        stroke-width="1.25"
        aria-hidden="true"
    >
        <circle cx="6.5" cy="6.5" r="5" />
        <path d="M10.25 10.25L15 15" />
    </svg>
    <Input bind:value {placeholder} aria-label={ariaLabel} class="w-full pl-9 pr-3" />
</div>
