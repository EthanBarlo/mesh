import React from "react";
import { GlowCard } from "@/components/ui";

// Per-variant accent: one gradient string (halo + top bar) and a label tint.
const ACCENTS: Record<string, { glow: string; label: string }> = {
    default: { glow: "from-rose-500 to-orange-500", label: "text-rose-400" },
    cyan: { glow: "from-cyan-500 to-blue-500", label: "text-cyan-400" },
    emerald: { glow: "from-emerald-500 to-teal-500", label: "text-emerald-400" },
};

const Card = ({
    variant,
    children,
    slots,
}: {
    variant: string;
    // The default slot — everything between the <mesh:slots.card> tags —
    // arrives as React children. Named livewire:slot blocks arrive together
    // on a `slots` prop, keyed by name. Both are server-rendered HTML that
    // Mesh keeps in sync with Livewire re-renders.
    children?: React.ReactNode;
    slots?: { title?: React.ReactNode; footer?: React.ReactNode };
}) => {
    const accent = ACCENTS[variant] ?? ACCENTS.default;

    return (
        <GlowCard glow={accent.glow} contentClassName="overflow-hidden p-0">
            <div className={`h-1 bg-gradient-to-r ${accent.glow}`} />

            {slots?.title && (
                <header className="px-6 pt-5 pb-4 border-b border-white/10">
                    <span
                        className={`block text-[10px] font-semibold uppercase tracking-widest ${accent.label} mb-1.5`}
                    >
                        slots.title
                    </span>
                    <h3 className="text-lg font-bold text-white leading-snug">
                        {slots.title}
                    </h3>
                </header>
            )}

            <div className="px-6 py-5 text-sm text-slate-300 leading-relaxed">
                {children}
            </div>

            {slots?.footer && (
                <footer className="px-6 py-3 border-t border-white/10 bg-white/[0.03] text-xs text-slate-500">
                    {slots.footer}
                </footer>
            )}
        </GlowCard>
    );
};

export default Card;
