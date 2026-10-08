import React from "react";
import { cn } from "./cn";

interface PanelProps extends React.HTMLAttributes<HTMLDivElement> {
    /** Registration marks on two corners, like a figure stage. */
    ticks?: boolean;
}

/** The standard demo surface: paper, a hairline border, square corners. */
const Panel: React.FC<PanelProps> = ({ ticks = false, className, ...rest }) => (
    <div
        className={cn(
            "relative border border-line-2 bg-paper p-5",
            ticks && "ui-ticks",
            className,
        )}
        {...rest}
    />
);

export default Panel;
