<script module lang="ts">
    import type { BadgeColor } from "@/components/ui";
    import type { OrderStatus } from "./columns";

    const statusColors: Record<OrderStatus, BadgeColor> = {
        pending: "amber",
        paid: "emerald",
        shipped: "slate",
        refunded: "slate",
    };
</script>

<script lang="ts">
    import { Badge } from "@/components/ui";

    let { status }: { status: OrderStatus } = $props();
</script>

<Badge color={statusColors[status]} dot class="capitalize">{status}</Badge>
