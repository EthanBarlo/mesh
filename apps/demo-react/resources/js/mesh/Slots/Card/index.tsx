import React from "react";
import { GlowCard } from "@/components/ui";

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
    // `variant` still selects behaviour upstream; styling is mono regardless.
    void variant;

    return (
        <GlowCard contentClassName="overflow-hidden p-0">
            {slots?.title && (
                <header className="px-6 pt-5 pb-4 border-b border-white/5">
                    <span className="block text-xs font-medium uppercase tracking-widest text-zinc-500 mb-1.5">
                        slots.title
                    </span>
                    <h3 className="text-lg font-semibold text-white tracking-tight leading-snug">
                        {slots.title}
                    </h3>
                </header>
            )}

            <div className="px-6 py-5 text-sm text-zinc-300 leading-relaxed">
                {children}
            </div>

            {slots?.footer && (
                <footer className="px-6 py-3 border-t border-white/5 text-xs text-zinc-500">
                    {slots.footer}
                </footer>
            )}
        </GlowCard>
    );
};

export default Card;
