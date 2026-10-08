<script module lang="ts">
    export interface InputProps {
        /** Switches the border and focus outline to the error treatment. */
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
        // 16px on phones so iOS doesn't zoom on focus.
        "block w-full border bg-paper px-3.5 py-2.5 text-base text-ink outline-none transition-[border-color,box-shadow] duration-150 ease-(--ease-out) placeholder:text-ink-3 disabled:opacity-50 motion-reduce:transition-none sm:text-sm",
        invalid
            ? "border-danger focus:border-danger focus:ring-1 focus:ring-danger"
            : "border-line-2 hover:border-line-3 focus:border-accent focus:ring-1 focus:ring-accent",
        className,
    )}
/>
