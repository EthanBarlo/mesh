<script lang="ts">
    import type { HTMLAttributes } from "svelte/elements";
    import { cn } from "@/components/ui";

    interface Props extends HTMLAttributes<HTMLParagraphElement> {
        /** The value the server currently holds for the entangled property. */
        value: string;
        /** Whether the server value matches the local Svelte state. */
        synced: boolean;
    }

    let { value, synced, class: className, ...rest }: Props = $props();
</script>

<!-- Sync-status line showing whether the server has caught up with local state. -->
<p {...rest} class={cn("flex items-baseline gap-2 text-xs", className)}>
    <span
        class={cn(
            "shrink-0 font-semibold uppercase tracking-wider",
            synced ? "text-emerald-400" : "text-amber-400",
        )}
    >
        {synced ? "Server in sync" : "Server behind"}
    </span>
    <span class="truncate text-zinc-500">
        server has:
        <span class="font-mono text-zinc-300">{value === "" ? "(empty)" : `"${value}"`}</span>
    </span>
</p>
