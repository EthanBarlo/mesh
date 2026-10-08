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

/** A mono label, the control, then the first validation message. */
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
        <div className="mb-1.5 flex items-baseline justify-between gap-3">
            <label
                htmlFor={htmlFor}
                className="block font-mono text-[0.6875rem] uppercase leading-normal tracking-[0.1em] text-ink-2"
            >
                {label}
            </label>
            {corner}
        </div>
        {children}
        {error && error.length > 0 && (
            <p
                className="mt-1.5 flex items-start gap-1.5 text-xs leading-snug text-danger"
                role="alert"
            >
                <svg
                    className="mt-[2px] size-2.5 shrink-0"
                    viewBox="0 0 10 10"
                    aria-hidden="true"
                >
                    <path d="M5 .8 9.4 9.2H.6Z" fill="currentColor" />
                </svg>
                <span>{error[0]}</span>
            </p>
        )}
        {hint && <p className="mt-1.5 text-xs text-ink-3">{hint}</p>}
    </div>
);

export default Field;
