import React from "react";
import { cn } from "@/components/ui";

export interface ServerValueProps {
    /** The value the server currently holds for the entangled property. */
    value: string;
    /** Whether the server value matches the local React state. */
    synced: boolean;
    className?: string;
}

/** Sync-status line showing whether the server has caught up with local state. */
const ServerValue: React.FC<ServerValueProps> = ({
    value,
    synced,
    className,
}) => (
    <p className={cn("flex items-baseline gap-2 text-xs", className)}>
        <span
            className={`shrink-0 font-semibold uppercase tracking-wider ${
                synced ? "text-emerald-400" : "text-amber-400"
            }`}
        >
            {synced ? "Server in sync" : "Server behind"}
        </span>
        <span className="truncate text-slate-400">
            server has:{" "}
            <span className="font-mono text-slate-300">
                {value === "" ? "(empty)" : `"${value}"`}
            </span>
        </span>
    </p>
);

export default ServerValue;
