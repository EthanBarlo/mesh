import React from "react";
import { cn } from "./cn";

/** The standard demo surface: a faint mono panel with a hairline border. */
const Panel: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
    className,
    ...rest
}) => (
    <div
        className={cn(
            "p-5 rounded-xl bg-white/[0.02] border border-white/5",
            className,
        )}
        {...rest}
    />
);

export default Panel;
