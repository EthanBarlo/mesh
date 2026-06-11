import React from "react";
import { cn } from "./cn";

export interface InputProps
    extends React.InputHTMLAttributes<HTMLInputElement> {
    /** Switches the border and focus ring to the error treatment. */
    invalid?: boolean;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
    ({ invalid = false, className, type = "text", ...rest }, ref) => (
        <input
            ref={ref}
            type={type}
            aria-invalid={invalid || undefined}
            className={cn(
                "w-full rounded-xl bg-slate-900/60 border px-4 py-2.5 text-sm text-white placeholder-slate-500 transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900",
                invalid
                    ? "border-red-500/60 focus:border-red-400 focus:ring-red-500/60"
                    : "border-white/10 focus:border-rose-400/50 focus:ring-rose-500/60",
                className,
            )}
            {...rest}
        />
    ),
);
Input.displayName = "Input";

export default Input;
