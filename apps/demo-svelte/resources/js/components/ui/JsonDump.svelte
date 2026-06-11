<script lang="ts">
    import type { HTMLAttributes } from "svelte/elements";
    import { cn } from "./cn";

    interface Props extends HTMLAttributes<HTMLPreElement> {
        value: unknown;
    }

    let { value, class: className, ...rest }: Props = $props();

    const formatted = $derived(JSON.stringify(value, null, 2));
</script>

<!-- Pretty-printed JSON in the demo's terminal-style block. -->
<pre
    {...rest}
    class={cn(
        "overflow-x-auto rounded-lg bg-black/30 p-3 font-mono text-xs leading-relaxed text-zinc-400",
        className,
    )}>{formatted}</pre>
