import React from "react";
import { cn } from "./cn";

type Tone = "error" | "success";

const tones: Record<
    Tone,
    { panel: string; title: string; body: string; icon: string }
> = {
    error: {
        panel: "border-rose-500/30 bg-rose-500/10",
        title: "text-rose-300",
        body: "text-rose-200/80",
        icon: "text-rose-400",
    },
    success: {
        panel: "border-emerald-500/30 bg-emerald-500/10",
        title: "text-emerald-300",
        body: "text-emerald-200/90",
        icon: "text-emerald-400",
    },
};

interface AlertProps {
    tone?: Tone;
    title: React.ReactNode;
    icon?: React.ReactNode;
    /** Rendered on the trailing edge, e.g. a retry button. */
    action?: React.ReactNode;
    className?: string;
    children?: React.ReactNode;
}

const Alert: React.FC<AlertProps> = ({
    tone = "error",
    title,
    icon,
    action,
    className,
    children,
}) => {
    const t = tones[tone];

    return (
        <div
            className={cn(
                "flex items-start justify-between gap-4 rounded-2xl border p-5",
                t.panel,
                className,
            )}
        >
            <div className="flex min-w-0 items-start gap-3">
                {icon && (
                    <span className={cn("mt-0.5 shrink-0", t.icon)}>{icon}</span>
                )}
                <div className="min-w-0">
                    <p className={cn("font-medium", t.title)}>{title}</p>
                    {children && (
                        <div className={cn("mt-0.5 text-sm", t.body)}>
                            {children}
                        </div>
                    )}
                </div>
            </div>
            {action && <div className="shrink-0">{action}</div>}
        </div>
    );
};

export default Alert;
