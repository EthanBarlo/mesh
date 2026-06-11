import React from "react";
import { cn } from "./cn";

interface GlowCardProps extends React.HTMLAttributes<HTMLDivElement> {
    /** Gradient stops for the blur halo, e.g. "from-cyan-500 to-blue-500". */
    glow?: string;
    /** Extra classes for the halo layer (e.g. to tweak its opacity). */
    glowClassName?: string;
    /** Classes for the inner card surface (padding, layout, …). */
    contentClassName?: string;
}

/** A card with a soft gradient halo behind it that brightens on hover. */
const GlowCard: React.FC<GlowCardProps> = ({
    glow = "from-rose-500 to-orange-500",
    glowClassName,
    contentClassName,
    className,
    children,
    ...rest
}) => (
    <div className={cn("relative group", className)} {...rest}>
        <div
            className={cn(
                "absolute -inset-1 bg-gradient-to-r rounded-3xl blur-xl opacity-20 group-hover:opacity-35 transition-opacity duration-500",
                glow,
                glowClassName,
            )}
            aria-hidden="true"
        />
        <div
            className={cn(
                "relative rounded-2xl bg-slate-800/80 border border-white/10 backdrop-blur-xl",
                contentClassName,
            )}
        >
            {children}
        </div>
    </div>
);

export default GlowCard;
