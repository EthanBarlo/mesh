import React from "react";
import { cn } from "./cn";
import Spinner from "./Spinner";

type Variant = "primary" | "accent" | "secondary" | "ghost";
type Size = "xs" | "sm" | "md" | "icon";

const variants: Record<Variant, string> = {
    primary:
        "bg-gradient-to-br from-rose-500 to-orange-500 text-white font-semibold hover:from-rose-600 hover:to-orange-600 shadow-lg shadow-rose-500/25 focus:ring-rose-500",
    accent: "bg-gradient-to-br from-cyan-500 to-blue-500 text-white font-semibold hover:from-cyan-600 hover:to-blue-600 shadow-lg shadow-cyan-500/25 focus:ring-cyan-500",
    secondary:
        "bg-slate-700/50 border border-white/10 text-white font-medium hover:bg-slate-700 hover:border-white/20 focus:ring-rose-500",
    ghost: "bg-slate-700/30 border border-white/5 text-slate-400 font-medium hover:bg-slate-700/50 hover:text-slate-300 focus:ring-cyan-500",
};

const sizes: Record<Size, string> = {
    xs: "px-3.5 py-1.5 text-sm rounded-xl",
    sm: "px-4 h-10 text-sm rounded-xl",
    md: "px-5 h-11 text-sm rounded-xl",
    icon: "w-14 h-14 text-2xl rounded-xl",
};

export interface ButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: Variant;
    size?: Size;
    /** Shows a spinner and disables the button. */
    loading?: boolean;
}

const Button: React.FC<ButtonProps> = ({
    variant = "primary",
    size = "md",
    loading = false,
    className,
    children,
    disabled,
    type = "button",
    ...rest
}) => (
    <button
        type={type}
        disabled={disabled || loading}
        className={cn(
            "inline-flex items-center justify-center gap-2 transition-all duration-150 active:scale-95 disabled:opacity-50 disabled:pointer-events-none focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900",
            variants[variant],
            sizes[size],
            className,
        )}
        {...rest}
    >
        {loading && <Spinner />}
        {children}
    </button>
);

export default Button;
