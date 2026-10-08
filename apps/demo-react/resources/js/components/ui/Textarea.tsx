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
                "block w-full resize-y border bg-paper px-3.5 py-3 text-base leading-relaxed text-ink outline-none transition-[border-color,box-shadow] duration-150 ease-(--ease-out) placeholder:text-ink-3 disabled:opacity-50 motion-reduce:transition-none sm:text-sm",
                invalid
                    ? "border-danger focus:border-danger focus:ring-1 focus:ring-danger"
                    : "border-line-2 hover:border-line-3 focus:border-accent focus:ring-1 focus:ring-accent",
                className,
            )}
            {...rest}
        />
    ),
);
Textarea.displayName = "Textarea";

export default Textarea;
