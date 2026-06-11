import React from "react";
import { cn } from "./cn";

interface GlowCardProps extends React.HTMLAttributes<HTMLDivElement> {
    /** @deprecated No-op — the mono design renders no halo. Kept so call sites compile. */
    glow?: string;
    /** @deprecated No-op — the mono design renders no halo. Kept so call sites compile. */
    glowClassName?: string;
    /** Classes for the inner card surface (padding, layout, …). */
    contentClassName?: string;
}

/**
 * A flat mono card. The `glow` and `glowClassName` props are accepted for
 * backwards compatibility but are visual no-ops — no halo is rendered.
 */
const GlowCard: React.FC<GlowCardProps> = ({
    glow: _glow,
    glowClassName: _glowClassName,
    contentClassName,
    className,
    children,
    ...rest
}) => (
    <div className={cn("relative group", className)} {...rest}>
        <div
            className={cn(
                "relative rounded-xl bg-white/[0.02] border border-white/5",
                contentClassName,
            )}
        >
            {children}
        </div>
    </div>
);

export default GlowCard;
