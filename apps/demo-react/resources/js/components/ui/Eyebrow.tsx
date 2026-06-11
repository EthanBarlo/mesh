import React from "react";
import { cn } from "./cn";

/** Tiny uppercase section label. */
const Eyebrow: React.FC<React.HTMLAttributes<HTMLSpanElement>> = ({
    className,
    ...rest
}) => (
    <span
        className={cn(
            "text-xs font-medium uppercase tracking-widest text-zinc-500",
            className,
        )}
        {...rest}
    />
);

export default Eyebrow;
