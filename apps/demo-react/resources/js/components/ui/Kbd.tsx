import React from "react";
import { cn } from "./cn";

/** A mono keycap: hairline sides, a heavier bottom edge. */
const Kbd: React.FC<React.HTMLAttributes<HTMLElement>> = ({
    className,
    ...rest
}) => (
    <kbd
        className={cn(
            "inline-flex min-w-[1.75em] items-center justify-center border border-b-2 border-line-3 bg-paper px-1.5 py-px font-mono text-[0.85em] leading-[1.4] text-ink",
            className,
        )}
        {...rest}
    />
);

export default Kbd;
