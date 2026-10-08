import React from "react";
import { cn } from "./cn";

/** The annotation voice (`.k .k--caps`): 11px tracked mono caps. */
const Eyebrow: React.FC<React.HTMLAttributes<HTMLSpanElement>> = ({
    className,
    ...rest
}) => (
    <span
        className={cn(
            "font-mono text-[0.6875rem] font-normal uppercase leading-normal tracking-[0.1em] text-ink-3",
            className,
        )}
        {...rest}
    />
);

export default Eyebrow;
