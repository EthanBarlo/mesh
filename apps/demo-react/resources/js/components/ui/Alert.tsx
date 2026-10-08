import React from "react";
import { cn } from "./cn";

type Tone = "error" | "success" | "info";

const tones: Record<
    Tone,
    { panel: string; mark: string; label: string; text: string }
> = {
    error: {
        panel: "border-l-danger bg-danger-wash",
        mark: "text-danger",
        label: "text-danger",
        text: "Error",
    },
    success: {
        panel: "border-l-ink bg-paper",
        mark: "text-ink",
        label: "text-ink-3",
        text: "Done",
    },
    info: {
        panel: "border-l-blueline bg-paper",
        mark: "text-blueline",
        label: "text-ink-3",
        text: "Note",
    },
};

/** The drawn marks, after the docs callouts: triangle, circle, box. */
const Mark: React.FC<{ tone: Tone }> = ({ tone }) => {
    if (tone === "error") {
        return (
            <svg viewBox="0 0 28 26" width="22" height="20" aria-hidden="true">
                <path d="M14 2 26 24H2Z" fill="none" stroke="currentColor" strokeWidth="1.25" />
                <path d="M14 10v7" stroke="currentColor" strokeWidth="1.5" />
                <circle cx="14" cy="20.25" r="1.1" fill="currentColor" />
            </svg>
        );
    }

    if (tone === "success") {
        return (
            <svg viewBox="0 0 22 22" width="20" height="20" aria-hidden="true">
                <circle cx="11" cy="11" r="9.5" fill="none" stroke="currentColor" strokeWidth="1.25" />
                <path d="m6.75 11.25 2.9 2.9 5.6-5.9" fill="none" stroke="currentColor" strokeWidth="1.5" />
            </svg>
        );
    }

    return (
        <svg viewBox="0 0 22 22" width="20" height="20" aria-hidden="true">
            <rect x="1.5" y="1.5" width="19" height="19" fill="none" stroke="currentColor" strokeWidth="1.25" />
            <path d="M11 9.5v7" stroke="currentColor" strokeWidth="1.5" />
            <circle cx="11" cy="6.25" r="1.1" fill="currentColor" />
        </svg>
    );
};

interface AlertProps {
    tone?: Tone;
    title: React.ReactNode;
    /** Replaces the drawn mark. Usually best left out. */
    icon?: React.ReactNode;
    /** The mono label before the title. Defaults to Error / Done / Note. */
    label?: React.ReactNode;
    /** Rendered on the trailing edge, e.g. a retry button. */
    action?: React.ReactNode;
    className?: string;
    children?: React.ReactNode;
}

/** A note on the sheet: a drawn mark, a mono label and title, then the body. */
const Alert: React.FC<AlertProps> = ({
    tone = "error",
    title,
    icon,
    label,
    action,
    className,
    children,
}) => {
    const t = tones[tone];

    return (
        <div
            role={tone === "error" ? "alert" : "status"}
            className={cn(
                "grid grid-cols-[auto_minmax(0,1fr)] items-start gap-x-3.5 border border-l-2 border-line-2 py-3.5 pr-4 pl-3.5",
                action && "sm:grid-cols-[auto_minmax(0,1fr)_auto]",
                t.panel,
                className,
            )}
        >
            <span className={cn("flex pt-px", t.mark)}>
                {icon ?? <Mark tone={tone} />}
            </span>
            <div className="min-w-0">
                <p className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                    <span
                        className={cn(
                            "font-mono text-[0.6875rem] uppercase tracking-[0.1em]",
                            t.label,
                        )}
                    >
                        {label ?? t.text}
                    </span>
                    <span className="text-sm font-semibold tracking-[-0.005em] text-ink">
                        {title}
                    </span>
                </p>
                {children && (
                    <div className="mt-1 text-sm leading-relaxed text-ink-2">
                        {children}
                    </div>
                )}
            </div>
            {action && (
                <div className="col-start-2 mt-3 sm:col-start-3 sm:row-start-1 sm:mt-0 sm:self-center">
                    {action}
                </div>
            )}
        </div>
    );
};

export default Alert;
