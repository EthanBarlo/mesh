import React from "react";
import { cn } from "./cn";

const Select = React.forwardRef<
    HTMLSelectElement,
    React.SelectHTMLAttributes<HTMLSelectElement>
>(({ className, ...rest }, ref) => (
    <select
        ref={ref}
        className={cn(
            "px-2.5 py-1.5 rounded-lg bg-slate-800/80 border border-white/10 text-sm text-white focus:outline-none focus:ring-2 focus:ring-rose-500",
            className,
        )}
        {...rest}
    />
));
Select.displayName = "Select";

export default Select;
