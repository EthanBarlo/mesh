<script lang="ts">
    import { Spinner } from "@/components/ui";
    import type { Order } from "./columns";

    interface Props {
        order: Order;
        pending: boolean;
        onFlag: (id: number) => void;
    }

    let { order, pending, onFlag }: Props = $props();
</script>

<!-- A square stamp; the shared `.flag-btn` class draws it (ecosystem.css). -->
<button
    type="button"
    onclick={() => onFlag(order.id)}
    disabled={pending}
    aria-label={order.flagged ? `Unflag order ${order.id}` : `Flag order ${order.id}`}
    title={order.flagged ? "Unflag (server call)" : "Flag (server call)"}
    class="flag-btn"
    data-flagged={order.flagged || undefined}
>
    {#if pending}
        <Spinner class="w-3.5 h-3.5" />
    {:else}
        <!-- A drawn pennant: an outline when clear, filled when flagged. -->
        <svg
            class="w-3.5 h-3.5"
            viewBox="0 0 14 14"
            fill="none"
            stroke="currentColor"
            stroke-width="1.25"
            aria-hidden="true"
        >
            <path d="M2.5 13.5V1" />
            <path
                d="M2.5 1.5H11.5L9 5L11.5 8.5H2.5"
                fill={order.flagged ? "currentColor" : "none"}
            />
        </svg>
    {/if}
</button>
