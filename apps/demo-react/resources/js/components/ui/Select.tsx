import React from "react";
import { cn } from "./cn";

const Select = React.forwardRef<
    HTMLSelectElement,
    React.SelectHTMLAttributes<HTMLSelectElement>
>(({ className, ...rest }, ref) => (
    <select
        ref={ref}
        className={cn(
            "px-2.5 py-1.5 rounded-lg bg-white/[0.02] border border-white/10 text-sm text-white transition-colors duration-150 focus:outline-none focus:border-white/20 focus:ring-2 focus:ring-white/20",
            className,
        )}
        {...rest}
    />
));
Select.displayName = "Select";

export default Select;
