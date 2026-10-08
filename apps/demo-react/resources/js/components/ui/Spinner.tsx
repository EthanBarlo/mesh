import React from "react";
import { cn } from "./cn";

/**
 * A line-drawn square with a short stroke tracing its edge. Inherits the
 * text color; size it with `w-*`/`h-*`.
 */
const Spinner: React.FC<{ className?: string }> = ({ className }) => (
    <svg
        className={cn("ui-spinner w-4 h-4 shrink-0", className)}
        viewBox="0 0 16 16"
        fill="none"
        aria-hidden="true"
    >
        <rect
            x="1.5"
            y="1.5"
            width="13"
            height="13"
            stroke="currentColor"
            strokeOpacity="0.28"
        />
        <rect
            className="ui-spinner__run"
            x="1.5"
            y="1.5"
            width="13"
            height="13"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="square"
            pathLength={100}
            strokeDasharray="24 76"
        />
    </svg>
);

export default Spinner;
