import React from "react";
import { cn } from "./cn";

const Kbd: React.FC<React.HTMLAttributes<HTMLElement>> = ({
    className,
    ...rest
}) => (
    <kbd
        className={cn(
            "px-1.5 py-0.5 rounded-md bg-white/5 border border-white/10 font-mono text-zinc-300",
            className,
        )}
        {...rest}
    />
);

export default Kbd;
