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
                "w-full rounded-lg bg-white/[0.02] border px-4 py-2.5 text-sm text-white placeholder-zinc-600 transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-zinc-950",
                invalid
                    ? "border-rose-400/40 focus:border-rose-400/60 focus:ring-rose-400/30"
                    : "border-white/10 focus:border-white/20 focus:ring-white/20",
                className,
            )}
            {...rest}
        />
    ),
);
Input.displayName = "Input";

export default Input;
