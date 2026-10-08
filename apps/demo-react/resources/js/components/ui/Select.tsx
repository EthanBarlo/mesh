import React from "react";
import { cn } from "./cn";

/** A native select, drawn like the inputs. The arrow follows the color scheme. */
const Select = React.forwardRef<
    HTMLSelectElement,
    React.SelectHTMLAttributes<HTMLSelectElement>
>(({ className, ...rest }, ref) => (
    <select
        ref={ref}
        className={cn(
            "border border-line-2 bg-paper px-2.5 py-1.5 font-mono text-base tabular-nums text-ink outline-none transition-[border-color,box-shadow] duration-150 ease-(--ease-out) hover:border-line-3 focus:border-accent focus:ring-1 focus:ring-accent motion-reduce:transition-none sm:text-xs",
            className,
        )}
        {...rest}
    />
));
Select.displayName = "Select";

export default Select;
