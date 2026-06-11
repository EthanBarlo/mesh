<script lang="ts">
    import type { HTMLAttributes } from "svelte/elements";
    import { Input, cn } from "@/components/ui";

    /** Search input with a magnifier icon, for client-side table filtering. */
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

<div {...rest} class={cn("relative", className)}>
    <svg
        class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 pointer-events-none"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
        aria-hidden="true"
    >
        <circle cx="11" cy="11" r="8" />
        <path d="m21 21-4.35-4.35" />
    </svg>
    <Input
        bind:value
        {placeholder}
        aria-label={ariaLabel}
        class="w-64 pl-9 pr-3 py-2"
    />
</div>
