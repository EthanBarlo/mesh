<script module lang="ts">
    export interface InputProps {
        /** Switches the border and focus ring to the error treatment. */
        invalid?: boolean;
        type?: string;
    }
</script>

<script lang="ts">
    import type { HTMLInputAttributes } from "svelte/elements";
    import { cn } from "./cn";

    interface Props
        extends InputProps,
            Omit<HTMLInputAttributes, keyof InputProps | "value"> {
        value?: string | number;
    }

    let {
        invalid = false,
        type = "text",
        value = $bindable(),
        class: className,
        ...rest
    }: Props = $props();
</script>

<!--
    `type` is applied via the spread: Svelte requires a static `type`
    attribute on inputs with two-way binding, but spreads bypass that check.
-->
<input
    {...{ ...rest, type }}
    bind:value
    aria-invalid={invalid || undefined}
    class={cn(
        "w-full rounded-lg bg-white/[0.02] border px-4 py-2.5 text-sm text-white placeholder-zinc-600 transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-zinc-950",
        invalid
            ? "border-rose-400/40 focus:border-rose-400/60 focus:ring-rose-400/30"
            : "border-white/10 focus:border-white/20 focus:ring-white/20",
        className,
    )}
/>
