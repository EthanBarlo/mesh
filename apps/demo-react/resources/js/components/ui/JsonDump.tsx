import React from "react";
import { cn } from "./cn";

interface JsonDumpProps {
    value: unknown;
    className?: string;
}

/** Pretty-printed JSON in the demo's terminal-style block. */
const JsonDump: React.FC<JsonDumpProps> = ({ value, className }) => (
    <pre
        className={cn(
            "overflow-x-auto rounded-lg bg-black/30 p-3 font-mono text-xs leading-relaxed text-zinc-400",
            className,
        )}
    >
        {JSON.stringify(value, null, 2)}
    </pre>
);

export default JsonDump;
