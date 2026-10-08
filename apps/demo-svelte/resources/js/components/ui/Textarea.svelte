<script module lang="ts">
    export interface TextareaProps {
        /** Switches the border and focus outline to the error treatment. */
        invalid?: boolean;
    }
</script>

<script lang="ts">
    import type { HTMLTextareaAttributes } from "svelte/elements";
    import { cn } from "./cn";

    interface Props
        extends TextareaProps,
            Omit<HTMLTextareaAttributes, "value"> {
        value?: string;
    }

    let {
        invalid = false,
        value = $bindable(),
        class: className,
        ...rest
    }: Props = $props();
</script>

<textarea
    {...rest}
    bind:value
    aria-invalid={invalid || undefined}
    class={cn(
        "block w-full resize-y border bg-paper px-3.5 py-3 text-base leading-relaxed text-ink outline-none transition-[border-color,box-shadow] duration-150 ease-(--ease-out) placeholder:text-ink-3 disabled:opacity-50 motion-reduce:transition-none sm:text-sm",
        invalid
            ? "border-danger focus:border-danger focus:ring-1 focus:ring-danger"
            : "border-line-2 hover:border-line-3 focus:border-accent focus:ring-1 focus:ring-accent",
        className,
    )}
></textarea>
