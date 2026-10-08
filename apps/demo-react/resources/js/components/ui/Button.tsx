import React from "react";
import { cn } from "./cn";
import Spinner from "./Spinner";

type Variant = "primary" | "accent" | "secondary" | "ghost";
type Size = "xs" | "sm" | "md" | "icon";

// The drafting `.btn` primitive, written as utilities so call sites can
// override sizes and spacing through `className`.
const base =
    "relative inline-flex shrink-0 select-none items-center justify-center gap-2 whitespace-nowrap border font-medium transition duration-150 ease-(--ease-out) active:scale-[0.97] disabled:pointer-events-none disabled:opacity-45 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-ink motion-reduce:transition-none motion-reduce:active:scale-100";

const variants: Record<Variant, string> = {
    // Solid ink with the accent corner square (.btn--solid).
    primary:
        "border-ink bg-ink text-paper hover:bg-[color-mix(in_srgb,var(--ink)_85%,var(--accent))] after:pointer-events-none after:absolute after:-right-[5px] after:-bottom-[5px] after:size-2 after:bg-accent after:content-[''] after:transition-transform after:duration-240 after:ease-(--ease-spring) hover:after:translate-x-0.5 hover:after:translate-y-0.5 motion-reduce:after:transition-none",
    // The one key action on a screen: an accent line on the accent wash.
    accent: "border-accent bg-accent-wash text-accent-ink hover:border-accent-ink hover:bg-accent-ink hover:text-paper",
    // Ink line (.btn--line); fills with ink on hover.
    secondary: "border-ink bg-transparent text-ink hover:bg-ink hover:text-paper",
    // A mono caps text button.
    ghost: "border-transparent bg-transparent font-mono text-xs font-normal uppercase tracking-[0.08em] text-ink-2 hover:bg-paper-2 hover:text-ink",
};

const sizes: Record<Size, string> = {
    xs: "h-9 gap-1.5 px-3 text-[13px]",
    sm: "h-10 px-4 text-sm",
    md: "h-11 px-[18px] text-sm",
    icon: "size-14 p-0 text-2xl font-normal",
};

// Smaller buttons get a smaller corner square.
const corners: Record<Size, string> = {
    xs: "after:-right-1 after:-bottom-1 after:size-1.5",
    sm: "after:-right-1 after:-bottom-1 after:size-1.5",
    md: "",
    icon: "",
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
        aria-busy={loading || undefined}
        className={cn(
            base,
            sizes[size],
            variants[variant],
            variant === "primary" && corners[size],
            className,
        )}
        {...rest}
    >
        {loading && <Spinner />}
        {children}
    </button>
);

export default Button;
