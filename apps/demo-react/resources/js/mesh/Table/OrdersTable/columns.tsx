import React from "react";
import { createColumnHelper, type ColumnDef, type RowData } from "@tanstack/react-table";
import { Badge, Spinner, type BadgeColor } from "@/components/ui";

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

// Drafting tones from the UI kit: paid is inked, pending is sepia, the rest are muted.
// The accent stays free for flagged rows.
const statusColors: Record<OrderStatus, BadgeColor> = {
    pending: "blueline",
    paid: "ink",
    shipped: "muted",
    refunded: "muted",
};

const StatusBadge: React.FC<{ status: OrderStatus }> = ({ status }) => (
    <Badge color={statusColors[status]} dot className="capitalize">
        {status}
    </Badge>
);

/** A drawn pennant: an outline when clear, filled when flagged. */
const FlagIcon: React.FC<{ filled: boolean }> = ({ filled }) => (
    <svg
        className="w-3.5 h-3.5"
        viewBox="0 0 14 14"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.25"
        aria-hidden="true"
    >
        <path d="M2.5 13.5V1" />
        <path d="M2.5 1.5H11.5L9 5L11.5 8.5H2.5" fill={filled ? "currentColor" : "none"} />
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
        className="flag-btn"
        data-flagged={order.flagged || undefined}
    >
        {pending ? <Spinner className="w-3.5 h-3.5" /> : <FlagIcon filled={order.flagged} />}
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
            cell: (info) => <span className="bom__mono text-ink-3">#{info.getValue()}</span>,
        }),
        columnHelper.accessor("customer", {
            header: "Customer",
            cell: (info) => <span className="bom__strong">{info.getValue()}</span>,
        }),
        columnHelper.accessor("status", {
            header: "Status",
            cell: (info) => <StatusBadge status={info.getValue()} />,
        }),
        columnHelper.accessor("amount", {
            header: "Amount",
            meta: { headerClass: "text-right", cellClass: "text-right" },
            cell: (info) => (
                <span className="bom__mono text-ink">{formatAmount(info.getValue())}</span>
            ),
        }),
        columnHelper.accessor("date", {
            header: "Date",
            cell: (info) => <span className="bom__mono">{info.getValue()}</span>,
        }),
        columnHelper.display({
            id: "actions",
            header: () => <span className="sr-only">Actions</span>,
            meta: { headerClass: "text-right", cellClass: "text-right py-1.5" },
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
