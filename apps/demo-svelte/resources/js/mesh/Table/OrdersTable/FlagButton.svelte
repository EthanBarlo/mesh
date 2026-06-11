<script lang="ts">
    import { Spinner, cn } from "@/components/ui";
    import type { Order } from "./columns";

    interface Props {
        order: Order;
        pending: boolean;
        onFlag: (id: number) => void;
    }

    let { order, pending, onFlag }: Props = $props();
</script>

<button
    type="button"
    onclick={() => onFlag(order.id)}
    disabled={pending}
    aria-label={order.flagged
        ? `Unflag order ${order.id}`
        : `Flag order ${order.id}`}
    title={order.flagged ? "Unflag (server call)" : "Flag (server call)"}
    class={cn(
        "inline-flex items-center justify-center w-8 h-8 rounded-lg border transition-colors duration-150 active:scale-95 focus:outline-none focus:ring-2 focus:ring-white/20 focus:ring-offset-2 focus:ring-offset-zinc-950 disabled:cursor-wait",
        order.flagged
            ? "bg-rose-500/10 border-rose-400/30 text-rose-400 hover:bg-rose-500/15"
            : "bg-white/5 border-white/10 text-zinc-500 hover:text-white hover:border-white/20",
    )}
>
    {#if pending}
        <Spinner />
    {:else}
        <svg
            class="w-4 h-4"
            viewBox="0 0 24 24"
            fill={order.flagged ? "currentColor" : "none"}
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            aria-hidden="true"
        >
            <path
                d="M4 21V4a1 1 0 011-1h11.5a.5.5 0 01.4.8L14 8l2.9 4.2a.5.5 0 01-.4.8H5"
            />
        </svg>
    {/if}
</button>
