<script lang="ts">
    import { untrack } from "svelte";
    import type { HTMLAttributes } from "svelte/elements";
    import { cn } from "@/components/ui";

    interface Props extends HTMLAttributes<HTMLDivElement> {
        /** The value the server currently holds for the entangled property. */
        value: string;
        /** Whether the server value matches the local Svelte state. */
        synced: boolean;
        /** How the value travels: deferred (dashed wire) or live (the accent wire). */
        mode?: "deferred" | "live";
        /** The PHP property name, shown on the server readout, e.g. "$message". */
        property?: string;
    }

    let {
        value,
        synced,
        mode = "deferred",
        property,
        class: className,
        ...rest
    }: Props = $props();

    // Count server-side changes. The count keys the packet, restarting its
    // animation on every delivery.
    let previous = untrack(() => value);
    let deliveries = $state(0);

    $effect.pre(() => {
        if (value !== previous) {
            previous = value;
            deliveries = untrack(() => deliveries) + 1;
        }
    });
</script>

<!--
    The wire from local Svelte state down to the server, and the server's copy
    of the value. A packet drops down the wire each time the server value
    changes, so you can see exactly when a request delivered it.
-->
<div {...rest} class={cn(className)}>
    <div class="core-wire" data-line={mode === "live" ? "accent" : "dash"}>
        {#if deliveries > 0}
            {#key deliveries}
                <span class="core-wire__packet" aria-hidden="true"></span>
            {/key}
        {/if}
        {mode === "live" ? "sent on every keystroke" : "sent with the next request"}
    </div>

    <div class="border border-line-2 bg-paper-2 px-3 py-2.5">
        <div class="flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
            <span class="k k--caps text-ink-3">
                Server{#if property}<span class="normal-case"> · {property}</span>{/if}
            </span>
            <span class={cn("core-status", !synced && "core-status--ink")}>
                <span
                    class="core-dot"
                    data-state={synced ? "on" : "wait"}
                    aria-hidden="true"
                ></span>
                {synced ? "In sync" : "Behind"}
            </span>
        </div>
        <p class="mt-1 truncate font-mono text-sm text-ink">
            {#if value === ""}
                <span class="text-ink-3">(empty)</span>
            {:else}
                "{value}"
            {/if}
        </p>
    </div>
</div>
