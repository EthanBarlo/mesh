import React from "react";
import { cn } from "./cn";

interface GlowCardProps extends React.HTMLAttributes<HTMLDivElement> {
    /** @deprecated No-op — the drafting design renders no halo. Kept so call sites compile. */
    glow?: string;
    /** @deprecated No-op — the drafting design renders no halo. Kept so call sites compile. */
    glowClassName?: string;
    /** Classes for the inner card surface (padding, layout, …). */
    contentClassName?: string;
    /** Registration marks on two corners. On by default. */
    ticks?: boolean;
}

/**
 * The featured card: a paper surface with a hairline border and registration
 * marks. `glow` and `glowClassName` are accepted for backwards compatibility
 * but are visual no-ops.
 */
const GlowCard: React.FC<GlowCardProps> = ({
    glow: _glow,
    glowClassName: _glowClassName,
    contentClassName,
    ticks = true,
    className,
    children,
    ...rest
}) => (
    <div className={cn("relative group", className)} {...rest}>
        <div
            className={cn(
                "relative border border-line-2 bg-paper",
                ticks && "ui-ticks",
                contentClassName,
            )}
        >
            {children}
        </div>
    </div>
);

export default GlowCard;
