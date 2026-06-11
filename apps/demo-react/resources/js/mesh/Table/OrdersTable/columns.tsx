import React from "react";
import { createColumnHelper, type ColumnDef, type RowData } from "@tanstack/react-table";
import { Badge, Spinner, cn, type BadgeColor } from "@/components/ui";

declare module "@tanstack/react-table" {
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

const StatusBadge: React.FC<{ status: OrderStatus }> = ({ status }) => (
    <Badge color={statusColors[status]} dot className="capitalize">
        {status}
    </Badge>
);

const FlagIcon: React.FC<{ filled: boolean }> = ({ filled }) => (
    <svg
        className="w-4 h-4"
        viewBox="0 0 24 24"
        fill={filled ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
    >
        <path d="M4 21V4a1 1 0 011-1h11.5a.5.5 0 01.4.8L14 8l2.9 4.2a.5.5 0 01-.4.8H5" />
    </svg>
);

const FlagButton: React.FC<{
    order: Order;
    pending: boolean;
    onFlag: (id: number) => void;
}> = ({ order, pending, onFlag }) => (
    <button
        type="button"
        onClick={() => onFlag(order.id)}
        disabled={pending}
        aria-label={
            order.flagged ? `Unflag order ${order.id}` : `Flag order ${order.id}`
        }
        title={order.flagged ? "Unflag (server call)" : "Flag (server call)"}
        className={cn(
            "inline-flex items-center justify-center w-8 h-8 rounded-lg border transition-colors duration-150 active:scale-95 focus:outline-none focus:ring-2 focus:ring-white/20 focus:ring-offset-2 focus:ring-offset-zinc-950 disabled:cursor-wait",
            order.flagged
                ? "bg-rose-500/10 border-rose-400/30 text-rose-400 hover:bg-rose-500/15"
                : "bg-white/5 border-white/10 text-zinc-500 hover:text-white hover:border-white/20",
        )}
    >
        {pending ? <Spinner /> : <FlagIcon filled={order.flagged} />}
    </button>
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
            cell: (info) => (
                <span className="font-mono text-zinc-400">#{info.getValue()}</span>
            ),
        }),
        columnHelper.accessor("customer", {
            header: "Customer",
            cell: (info) => (
                <span className="font-medium text-white">{info.getValue()}</span>
            ),
        }),
        columnHelper.accessor("status", {
            header: "Status",
            cell: (info) => <StatusBadge status={info.getValue()} />,
        }),
        columnHelper.accessor("amount", {
            header: "Amount",
            meta: { headerClass: "text-right", cellClass: "text-right" },
            cell: (info) => (
                <span className="font-mono tabular-nums text-zinc-300">
                    {formatAmount(info.getValue())}
                </span>
            ),
        }),
        columnHelper.accessor("date", {
            header: "Date",
            cell: (info) => <span className="text-zinc-400">{info.getValue()}</span>,
        }),
        columnHelper.display({
            id: "actions",
            header: () => <span className="sr-only">Actions</span>,
            meta: { headerClass: "text-right", cellClass: "text-right" },
            cell: ({ row }) => (
                <FlagButton
                    order={row.original}
                    pending={pendingIds.has(row.original.id)}
                    onFlag={onFlag}
                />
            ),
        }),
    ];
}
