import React from "react";
import { Input, cn } from "@/components/ui";

export interface FilterInputProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    ariaLabel?: string;
    className?: string;
}

/** Search input with a drawn magnifier, for client-side table filtering. */
const FilterInput: React.FC<FilterInputProps> = ({
    value,
    onChange,
    placeholder,
    ariaLabel,
    className,
}) => (
    <div className={cn("relative w-full sm:w-64", className)}>
        <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-ink-3 pointer-events-none"
            viewBox="0 0 16 16"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.25"
            aria-hidden="true"
        >
            <circle cx="6.5" cy="6.5" r="5" />
            <path d="M10.25 10.25L15 15" />
        </svg>
        <Input
            value={value}
            onChange={(event) => onChange(event.target.value)}
            placeholder={placeholder}
            aria-label={ariaLabel}
            className="w-full pl-9 pr-3"
        />
    </div>
);

export default FilterInput;
