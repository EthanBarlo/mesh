import { h, type FunctionalComponent, type VNode } from "vue";
import { createColumnHelper, type ColumnDef, type RowData } from "@tanstack/vue-table";
import { Badge, Spinner, type BadgeColor } from "@/components/ui";

declare module "@tanstack/vue-table" {
    // Per-column styling hooks consumed by the DataTable renderer for th/td.
    interface ColumnMeta<TData extends RowData, TValue> {
        headerClass?: string;
        cellClass?: string;
    }
}

export type OrderStatus = "pending" | "paid" | "shipped" | "refunded";

export interface Order {
    id: number;
    customer: string;
    status: OrderStatus;
    /** Amount in cents. */
    amount: number;
    /** ISO date string (Y-m-d). */
    date: string;
    flagged: boolean;
}

const currency = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
});

export const formatAmount = (cents: number): string => currency.format(cents / 100);

// Drafting tones from the UI kit: paid is inked, pending is sepia, the rest are muted.
// The accent stays free for flagged rows.
const statusColors: Record<OrderStatus, BadgeColor> = {
    pending: "blueline",
    paid: "ink",
    shipped: "muted",
    refunded: "muted",
};

const StatusBadge: FunctionalComponent<{ status: OrderStatus }> = ({ status }) =>
    h(Badge, { color: statusColors[status], dot: true, class: "capitalize" }, () => status);

/** A drawn pennant: an outline when clear, filled when flagged. */
const flagIcon = (filled: boolean): VNode =>
    h(
        "svg",
        {
            class: "w-3.5 h-3.5",
            viewBox: "0 0 14 14",
            fill: "none",
            stroke: "currentColor",
            "stroke-width": "1.25",
            "aria-hidden": "true",
        },
        [
            h("path", { d: "M2.5 13.5V1" }),
            h("path", {
                d: "M2.5 1.5H11.5L9 5L11.5 8.5H2.5",
                fill: filled ? "currentColor" : "none",
            }),
        ],
    );

const FlagButton: FunctionalComponent<{
    order: Order;
    pending: boolean;
    onFlag: (id: number) => void;
}> = ({ order, pending, onFlag }) =>
    h(
        "button",
        {
            type: "button",
            onClick: () => onFlag(order.id),
            disabled: pending,
            "aria-label": order.flagged
                ? `Unflag order ${order.id}`
                : `Flag order ${order.id}`,
            title: order.flagged ? "Unflag (server call)" : "Flag (server call)",
            class: "flag-btn",
            // Vue keeps `false` as the string "false"; undefined drops the attribute.
            "data-flagged": order.flagged || undefined,
        },
        pending ? [h(Spinner, { class: "w-3.5 h-3.5" })] : [flagIcon(order.flagged)],
    );

const columnHelper = createColumnHelper<Order>();

export function buildColumns(options: {
    onFlag: (id: number) => void;
    pendingIds: Set<number>;
}): ColumnDef<Order, any>[] {
    const { onFlag, pendingIds } = options;

    return [
        columnHelper.accessor("id", {
            header: "Order",
            cell: (info) => h("span", { class: "bom__mono text-ink-3" }, `#${info.getValue()}`),
        }),
        columnHelper.accessor("customer", {
            header: "Customer",
            cell: (info) => h("span", { class: "bom__strong" }, info.getValue()),
        }),
        columnHelper.accessor("status", {
            header: "Status",
            cell: (info) => h(StatusBadge, { status: info.getValue() }),
        }),
        columnHelper.accessor("amount", {
            header: "Amount",
            meta: { headerClass: "text-right", cellClass: "text-right" },
            cell: (info) =>
                h("span", { class: "bom__mono text-ink" }, formatAmount(info.getValue())),
        }),
        columnHelper.accessor("date", {
            header: "Date",
            cell: (info) => h("span", { class: "bom__mono" }, info.getValue()),
        }),
        columnHelper.display({
            id: "actions",
            header: () => h("span", { class: "sr-only" }, "Actions"),
            meta: { headerClass: "text-right", cellClass: "text-right py-1.5" },
            cell: ({ row }) =>
                h(FlagButton, {
                    order: row.original,
                    pending: pendingIds.has(row.original.id),
                    onFlag,
                }),
        }),
    ];
}
