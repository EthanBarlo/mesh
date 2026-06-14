import { h, type FunctionalComponent, type VNode } from "vue";
import { createColumnHelper, type ColumnDef, type RowData } from "@tanstack/vue-table";
import { Badge, Spinner, cn, type BadgeColor } from "@/components/ui";

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

const statusColors: Record<OrderStatus, BadgeColor> = {
    pending: "amber",
    paid: "emerald",
    shipped: "slate",
    refunded: "slate",
};

const StatusBadge: FunctionalComponent<{ status: OrderStatus }> = ({ status }) =>
    h(Badge, { color: statusColors[status], dot: true, class: "capitalize" }, () => status);

const flagIcon = (filled: boolean): VNode =>
    h(
        "svg",
        {
            class: "w-4 h-4",
            viewBox: "0 0 24 24",
            fill: filled ? "currentColor" : "none",
            stroke: "currentColor",
            "stroke-width": "2",
            "stroke-linecap": "round",
            "stroke-linejoin": "round",
            "aria-hidden": "true",
        },
        [h("path", { d: "M4 21V4a1 1 0 011-1h11.5a.5.5 0 01.4.8L14 8l2.9 4.2a.5.5 0 01-.4.8H5" })],
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
            class: cn(
                "inline-flex items-center justify-center w-8 h-8 rounded-lg border transition-colors duration-150 active:scale-95 focus:outline-none focus:ring-2 focus:ring-white/20 focus:ring-offset-2 focus:ring-offset-zinc-950 disabled:cursor-wait",
                order.flagged
                    ? "bg-rose-500/10 border-rose-400/30 text-rose-400 hover:bg-rose-500/15"
                    : "bg-white/5 border-white/10 text-zinc-500 hover:text-white hover:border-white/20",
            ),
        },
        pending ? [h(Spinner)] : [flagIcon(order.flagged)],
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
            cell: (info) =>
                h("span", { class: "font-mono text-zinc-400" }, `#${info.getValue()}`),
        }),
        columnHelper.accessor("customer", {
            header: "Customer",
            cell: (info) =>
                h("span", { class: "font-medium text-white" }, info.getValue()),
        }),
        columnHelper.accessor("status", {
            header: "Status",
            cell: (info) => h(StatusBadge, { status: info.getValue() }),
        }),
        columnHelper.accessor("amount", {
            header: "Amount",
            meta: { headerClass: "text-right", cellClass: "text-right" },
            cell: (info) =>
                h(
                    "span",
                    { class: "font-mono tabular-nums text-zinc-300" },
                    formatAmount(info.getValue()),
                ),
        }),
        columnHelper.accessor("date", {
            header: "Date",
            cell: (info) => h("span", { class: "text-zinc-400" }, info.getValue()),
        }),
        columnHelper.display({
            id: "actions",
            header: () => h("span", { class: "sr-only" }, "Actions"),
            meta: { headerClass: "text-right", cellClass: "text-right" },
            cell: ({ row }) =>
                h(FlagButton, {
                    order: row.original,
                    pending: pendingIds.has(row.original.id),
                    onFlag,
                }),
        }),
    ];
}
