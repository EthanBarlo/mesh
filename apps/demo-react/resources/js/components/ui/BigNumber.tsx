import React from "react";
import { cn } from "./cn";

/** Large gradient numeral — size it at the call site (text-5xl, text-7xl, …). */
const BigNumber: React.FC<React.HTMLAttributes<HTMLSpanElement>> = ({
    className,
    ...rest
}) => (
    <span
        className={cn(
            "font-bold tabular-nums text-transparent bg-clip-text bg-gradient-to-b from-white to-slate-400",
            className,
        )}
        {...rest}
    />
);

export default BigNumber;
