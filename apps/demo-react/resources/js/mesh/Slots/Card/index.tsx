import React from "react";

interface Accent {
    glow: string;
    bar: string;
    label: string;
}

const DEFAULT_ACCENT: Accent = {
    glow: "from-rose-500 to-orange-500",
    bar: "from-rose-500 to-orange-500",
    label: "text-rose-400",
};

const ACCENTS: Record<string, Accent> = {
    default: DEFAULT_ACCENT,
    cyan: {
        glow: "from-cyan-500 to-blue-500",
        bar: "from-cyan-500 to-blue-500",
        label: "text-cyan-400",
    },
    emerald: {
        glow: "from-emerald-500 to-teal-500",
        bar: "from-emerald-500 to-teal-500",
        label: "text-emerald-400",
    },
};

const Card = ({
    variant,
    children,
    slots,
}: {
    variant: string;
    children?: React.ReactNode;
    slots?: { title?: React.ReactNode; footer?: React.ReactNode };
}) => {
    const accent = ACCENTS[variant] ?? DEFAULT_ACCENT;

    return (
        <div className="relative group">
            {/* Glow effect */}
            <div
                className={`absolute -inset-1 bg-gradient-to-r ${accent.glow} rounded-3xl blur-xl opacity-20 group-hover:opacity-35 transition-opacity duration-500`}
            />

            {/* Card */}
            <div className="relative rounded-2xl bg-slate-800/80 border border-white/10 backdrop-blur-xl overflow-hidden">
                <div className={`h-1 bg-gradient-to-r ${accent.bar}`} />

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
            </div>
        </div>
    );
};

export default Card;
