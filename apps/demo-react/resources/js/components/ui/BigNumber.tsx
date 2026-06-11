import React from "react";
import { cn } from "./cn";

/** Large numeral — size it at the call site (text-5xl, text-7xl, …). */
const BigNumber: React.FC<React.HTMLAttributes<HTMLSpanElement>> = ({
    className,
    ...rest
}) => (
    <span
        className={cn(
            "font-semibold tracking-tight tabular-nums text-white",
            className,
        )}
        {...rest}
    />
);

export default BigNumber;
