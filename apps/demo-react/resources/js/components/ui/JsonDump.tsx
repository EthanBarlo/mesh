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
            "overflow-x-auto rounded-xl border border-white/10 bg-slate-950/60 p-3 text-xs leading-relaxed text-slate-300",
            className,
        )}
    >
        {JSON.stringify(value, null, 2)}
    </pre>
);

export default JsonDump;
