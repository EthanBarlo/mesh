import React, { useState } from "react";
import { cn } from "@/components/ui";

export interface ServerValueProps {
    /** The value the server currently holds for the entangled property. */
    value: string;
    /** Whether the server value matches the local React state. */
    synced: boolean;
    /** How the value travels: deferred (dashed wire) or live (the accent wire). */
    mode?: "deferred" | "live";
    /** The PHP property name, shown on the server readout, e.g. "$message". */
    property?: string;
    className?: string;
}

/**
 * The wire from local React state down to the server, and the server's copy
 * of the value. A packet drops down the wire each time the server value
 * changes, so you can see exactly when a request delivered it.
 */
const ServerValue: React.FC<ServerValueProps> = ({
    value,
    synced,
    mode = "deferred",
    property,
    className,
}) => {
    // Count server-side changes (render-time, so StrictMode-safe). The count
    // keys the packet, restarting its animation on every delivery.
    const [previous, setPrevious] = useState(value);
    const [deliveries, setDeliveries] = useState(0);
    if (value !== previous) {
        setPrevious(value);
        setDeliveries((n) => n + 1);
    }

    return (
        <div className={cn(className)}>
            <div
                className="core-wire"
                data-line={mode === "live" ? "accent" : "dash"}
            >
                {deliveries > 0 && (
                    <span
                        key={deliveries}
                        className="core-wire__packet"
                        aria-hidden="true"
                    />
                )}
                {mode === "live"
                    ? "sent on every keystroke"
                    : "sent with the next request"}
            </div>

            <div className="border border-line-2 bg-paper-2 px-3 py-2.5">
                <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
                    <span className="k k--caps text-ink-3">
                        Server
                        {property && (
                            <span className="normal-case"> · {property}</span>
                        )}
                    </span>
                    <span
                        className={cn(
                            "core-status",
                            !synced && "core-status--ink",
                        )}
                    >
                        <span
                            className="core-dot"
                            data-state={synced ? "on" : "wait"}
                            aria-hidden="true"
                        />
                        {synced ? "In sync" : "Behind"}
                    </span>
                </div>
                <p className="mt-1 truncate font-mono text-sm text-ink">
                    {value === "" ? (
                        <span className="text-ink-3">(empty)</span>
                    ) : (
                        `"${value}"`
                    )}
                </p>
            </div>
        </div>
    );
};

export default ServerValue;
