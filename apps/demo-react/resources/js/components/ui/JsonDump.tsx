import React from "react";
import { cn } from "./cn";

interface JsonDumpProps {
    value: unknown;
    className?: string;
}

/** Pretty-printed JSON in a recessed mono block. Long lines wrap. */
const JsonDump: React.FC<JsonDumpProps> = ({ value, className }) => (
    <pre
        className={cn(
            "whitespace-pre-wrap border border-line-2 bg-paper-2 p-3 font-mono text-xs leading-relaxed text-ink-2 [overflow-wrap:anywhere]",
            className,
        )}
    >
        {JSON.stringify(value, null, 2)}
    </pre>
);

export default JsonDump;
