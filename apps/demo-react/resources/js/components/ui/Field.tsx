import React from "react";
import { cn } from "./cn";

interface FieldProps {
    label: React.ReactNode;
    htmlFor?: string;
    /** Small annotation rendered to the right of the label. */
    corner?: React.ReactNode;
    /** Error bag entry for this field — the first message is shown. */
    error?: string[] | null;
    hint?: React.ReactNode;
    className?: string;
    children: React.ReactNode;
}

/** Label + control + first validation message, in the demo's form rhythm. */
const Field: React.FC<FieldProps> = ({
    label,
    htmlFor,
    corner,
    error,
    hint,
    className,
    children,
}) => (
    <div className={cn(className)}>
        <div className="flex items-baseline justify-between mb-1.5">
            <label
                htmlFor={htmlFor}
                className="block text-sm font-medium text-zinc-300"
            >
                {label}
            </label>
            {corner}
        </div>
        {children}
        {error && error.length > 0 && (
            <p className="mt-1.5 text-xs text-rose-400" role="alert">
                {error[0]}
            </p>
        )}
        {hint && <p className="mt-1.5 text-xs text-zinc-500">{hint}</p>}
    </div>
);

export default Field;
