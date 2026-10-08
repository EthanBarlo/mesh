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
    // `variant` still selects behaviour upstream; styling is the same regardless.
    void variant;

    // Each region is labelled with the prop it arrived on, like a callout on a drawing.
    return (
        <GlowCard contentClassName="p-0">
            {slots?.title && (
                <header className="border-b border-line-2 px-5 pt-4 pb-4">
                    <span className="k text-ink-3">slots.title</span>
                    <h3 className="mt-1 text-lg leading-snug font-semibold tracking-tight text-ink">
                        {slots.title}
                    </h3>
                </header>
            )}

            <div className="px-5 py-5">
                <span className="k text-ink-3">children</span>
                <div className="mt-1.5 text-sm leading-relaxed text-ink-2">
                    {children}
                </div>
            </div>

            {slots?.footer && (
                <footer className="border-t border-line-2 bg-paper-2 px-5 py-3">
                    <span className="k text-ink-3">slots.footer</span>
                    <div className="mt-0.5 text-xs leading-relaxed text-ink-2">
                        {slots.footer}
                    </div>
                </footer>
            )}
        </GlowCard>
    );
};

export default Card;
