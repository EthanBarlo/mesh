<script module lang="ts">
    import type { BadgeColor } from "@/components/ui";
    import type { OrderStatus } from "./columns";

    // Drafting tones from the UI kit: paid is inked, pending is blueline, the
    // rest are muted. The accent stays free for flagged rows.
    const statusColors: Record<OrderStatus, BadgeColor> = {
        pending: "blueline",
        paid: "ink",
        shipped: "muted",
        refunded: "muted",
    };
</script>

<script lang="ts">
    import { Badge } from "@/components/ui";

    let { status }: { status: OrderStatus } = $props();
</script>

<Badge color={statusColors[status]} dot class="capitalize">{status}</Badge>
