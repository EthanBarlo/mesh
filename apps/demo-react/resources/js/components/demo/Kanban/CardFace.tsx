import React from "react";
import { cn } from "@/components/ui";

// Visual twin of mesh/Board/Kanban/CardItem.tsx's CardFace, kept dnd-kit
// free so the Kanban/Card island chunk stays tiny.

export interface KanbanCard {
    id: string;
    title: string;
    tag: string;
}

const TAG_STYLES: Record<string, string> = {
    design: "bg-rose-500/15 text-rose-300 border-rose-500/30",
    feature: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
    bug: "bg-orange-500/15 text-orange-300 border-orange-500/30",
    api: "bg-cyan-500/15 text-cyan-300 border-cyan-500/30",
    perf: "bg-violet-500/15 text-violet-300 border-violet-500/30",
    docs: "bg-amber-500/15 text-amber-300 border-amber-500/30",
    infra: "bg-blue-500/15 text-blue-300 border-blue-500/30",
};

const TAG_FALLBACK = "bg-slate-500/15 text-slate-300 border-slate-500/30";

const CardFace: React.FC<{ card: KanbanCard; className?: string }> = ({
    card,
    className,
}) => (
    <div
        className={cn(
            "p-3.5 rounded-xl bg-slate-800/90 border border-white/10 shadow-sm hover:border-white/20 space-y-2.5",
            className,
        )}
    >
        <p className="text-sm font-medium text-white leading-snug">
            {card.title}
        </p>
        <span
            className={cn(
                "inline-flex px-2 py-0.5 rounded-md border text-[11px] font-semibold uppercase tracking-wide",
                TAG_STYLES[card.tag] ?? TAG_FALLBACK,
            )}
        >
            {card.tag}
        </span>
    </div>
);

export default CardFace;
