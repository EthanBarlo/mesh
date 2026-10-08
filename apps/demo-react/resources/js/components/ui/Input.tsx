import React from "react";
import { cn } from "./cn";

export interface InputProps
    extends React.InputHTMLAttributes<HTMLInputElement> {
    /** Switches the border and focus outline to the error treatment. */
    invalid?: boolean;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
    ({ invalid = false, className, type = "text", ...rest }, ref) => (
        <input
            ref={ref}
            type={type}
            aria-invalid={invalid || undefined}
            className={cn(
                // 16px on phones so iOS doesn't zoom on focus.
                "block w-full border bg-paper px-3.5 py-2.5 text-base text-ink outline-none transition-[border-color,box-shadow] duration-150 ease-(--ease-out) placeholder:text-ink-3 disabled:opacity-50 motion-reduce:transition-none sm:text-sm",
                invalid
                    ? "border-danger focus:border-danger focus:ring-1 focus:ring-danger"
                    : "border-line-2 hover:border-line-3 focus:border-accent focus:ring-1 focus:ring-accent",
                className,
            )}
            {...rest}
        />
    ),
);
Input.displayName = "Input";

export default Input;
