import React from "react";
import { cn } from "./cn";

export interface TextareaProps
    extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
    invalid?: boolean;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
    ({ invalid = false, className, ...rest }, ref) => (
        <textarea
            ref={ref}
            aria-invalid={invalid || undefined}
            className={cn(
                "w-full rounded-xl bg-slate-900/60 border px-4 py-3 text-sm text-white placeholder-slate-500 transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900",
                invalid
                    ? "border-red-500/60 focus:border-red-400 focus:ring-red-500/60"
                    : "border-white/10 focus:border-rose-400/50 focus:ring-rose-500/60",
                className,
            )}
            {...rest}
        />
    ),
);
Textarea.displayName = "Textarea";

export default Textarea;
