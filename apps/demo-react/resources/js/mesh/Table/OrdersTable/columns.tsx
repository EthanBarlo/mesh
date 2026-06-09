import React from "react";
import { createColumnHelper, type ColumnDef, type RowData } from "@tanstack/react-table";

declare module "@tanstack/react-table" {
    // Per-column styling hooks consumed by index.tsx when rendering th/td.
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

const statusStyles: Record<OrderStatus, { badge: string; dot: string }> = {
    pending: {
        badge: "bg-amber-500/10 text-amber-300 border-amber-500/30",
        dot: "bg-amber-400",
    },
    paid: {
        badge: "bg-emerald-500/10 text-emerald-300 border-emerald-500/30",
        dot: "bg-emerald-400",
    },
    shipped: {
        badge: "bg-cyan-500/10 text-cyan-300 border-cyan-500/30",
        dot: "bg-cyan-400",
    },
    refunded: {
        badge: "bg-slate-500/10 text-slate-300 border-slate-500/30",
        dot: "bg-slate-400",
    },
};

const StatusBadge: React.FC<{ status: OrderStatus }> = ({ status }) => {
    const styles = statusStyles[status];

    return (
        <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border text-xs font-medium capitalize ${styles.badge}`}
        >
            <span className={`w-1.5 h-1.5 rounded-full ${styles.dot}`} aria-hidden="true" />
            {status}
        </span>
    );
};

const Spinner: React.FC = () => (
    <svg
        className="w-4 h-4 animate-spin"
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden="true"
    >
        <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
        />
        <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
        />
    </svg>
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
        className={`inline-flex items-center justify-center w-8 h-8 rounded-lg border transition-all duration-150 active:scale-95 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:ring-offset-2 focus:ring-offset-slate-900 disabled:cursor-wait ${
            order.flagged
                ? "bg-rose-500/15 border-rose-500/30 text-rose-400 hover:bg-rose-500/25"
                : "bg-white/5 border-white/10 text-slate-500 hover:text-slate-200 hover:border-white/20"
        }`}
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
                <span className="font-mono text-slate-400">#{info.getValue()}</span>
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
                <span className="font-mono tabular-nums text-slate-200">
                    {formatAmount(info.getValue())}
                </span>
            ),
        }),
        columnHelper.accessor("date", {
            header: "Date",
            cell: (info) => <span className="text-slate-400">{info.getValue()}</span>,
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
