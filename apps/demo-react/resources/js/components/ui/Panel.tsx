import React from "react";
import { cn } from "./cn";

/** The standard demo surface: a soft slate panel with a hairline border. */
const Panel: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
    className,
    ...rest
}) => (
    <div
        className={cn(
            "p-5 rounded-2xl bg-slate-800/60 border border-white/10",
            className,
        )}
        {...rest}
    />
);

export default Panel;
