import { createRawSnippet } from "svelte";
import {
    createColumnHelper,
    type ColumnDef,
    type RowData,
} from "@tanstack/table-core";
import {
    renderComponent,
    renderSnippet,
} from "@/components/demo/Table/svelte-table.svelte";
import StatusBadge from "./StatusBadge.svelte";
import FlagButton from "./FlagButton.svelte";

declare module "@tanstack/table-core" {
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

const escapeHtml = (value: string): string =>
    value.replace(
        /[&<>"']/g,
        (ch) =>
            ({
                "&": "&amp;",
                "<": "&lt;",
                ">": "&gt;",
                '"': "&quot;",
                "'": "&#39;",
            })[ch]!,
    );

// Text wrapped in a styled span — the raw-snippet equivalent of the simple
// h("span", { class }, text) cells in the Vue version.
const spanCell = createRawSnippet<[{ class: string; text: string }]>(
    (getProps) => ({
        render: () => {
            const { class: className, text } = getProps();
            return `<span class="${className}">${escapeHtml(text)}</span>`;
        },
    }),
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
                renderSnippet(spanCell, {
                    class: "font-mono text-zinc-400",
                    text: `#${info.getValue()}`,
                }),
        }),
        columnHelper.accessor("customer", {
            header: "Customer",
            cell: (info) =>
                renderSnippet(spanCell, {
                    class: "font-medium text-white",
                    text: info.getValue(),
                }),
        }),
        columnHelper.accessor("status", {
            header: "Status",
            cell: (info) => renderComponent(StatusBadge, { status: info.getValue() }),
        }),
        columnHelper.accessor("amount", {
            header: "Amount",
            meta: { headerClass: "text-right", cellClass: "text-right" },
            cell: (info) =>
                renderSnippet(spanCell, {
                    class: "font-mono tabular-nums text-zinc-300",
                    text: formatAmount(info.getValue()),
                }),
        }),
        columnHelper.accessor("date", {
            header: "Date",
            cell: (info) =>
                renderSnippet(spanCell, {
                    class: "text-zinc-400",
                    text: info.getValue(),
                }),
        }),
        columnHelper.display({
            id: "actions",
            header: () =>
                renderSnippet(spanCell, { class: "sr-only", text: "Actions" }),
            meta: { headerClass: "text-right", cellClass: "text-right" },
            cell: ({ row }) =>
                renderComponent(FlagButton, {
                    order: row.original,
                    pending: pendingIds.has(row.original.id),
                    onFlag,
                }),
        }),
    ];
}
