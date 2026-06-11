import React from "react";
import { Input, cn } from "@/components/ui";

export interface FilterInputProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    ariaLabel?: string;
    className?: string;
}

/** Search input with a magnifier icon, for client-side table filtering. */
const FilterInput: React.FC<FilterInputProps> = ({
    value,
    onChange,
    placeholder,
    ariaLabel,
    className,
}) => (
    <div className={cn("relative", className)}>
        <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
        >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
        </svg>
        <Input
            value={value}
            onChange={(event) => onChange(event.target.value)}
            placeholder={placeholder}
            aria-label={ariaLabel}
            className="w-64 pl-9 pr-3 py-2 bg-slate-800/80 transition-all focus:border-transparent focus:ring-rose-500 focus:ring-offset-0"
        />
    </div>
);

export default FilterInput;
