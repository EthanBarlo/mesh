<script lang="ts">
    import type { HTMLAttributes } from "svelte/elements";
    import { cn } from "./cn";

    interface Props extends HTMLAttributes<HTMLPreElement> {
        value: unknown;
    }

    let { value, class: className, ...rest }: Props = $props();

    const formatted = $derived(JSON.stringify(value, null, 2));
</script>

<!-- Pretty-printed JSON in a recessed mono block. Long lines wrap. -->
<pre
    {...rest}
    class={cn(
        "whitespace-pre-wrap border border-line-2 bg-paper-2 p-3 font-mono text-xs leading-relaxed text-ink-2 [overflow-wrap:anywhere]",
        className,
    )}>{formatted}</pre>
