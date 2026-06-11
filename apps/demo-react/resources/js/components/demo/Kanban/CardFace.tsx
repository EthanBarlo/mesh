import React from "react";
import { cn } from "@/components/ui";

// Visual twin of mesh/Board/Kanban/CardItem.tsx's CardFace, kept dnd-kit
// free so the Kanban/Card island chunk stays tiny.

export interface KanbanCard {
    id: string;
    title: string;
    tag: string;
}

const TAG_STYLE = "bg-white/5 text-zinc-300 border-white/10";

const CardFace: React.FC<{ card: KanbanCard; className?: string }> = ({
    card,
    className,
}) => (
    <div
        className={cn(
            "p-3.5 rounded-lg bg-white/[0.02] border border-white/10 hover:border-white/20 space-y-2.5 transition-colors",
            className,
        )}
    >
        <p className="text-sm font-medium text-white leading-snug">
            {card.title}
        </p>
        <span
            className={cn(
                "inline-flex px-2 py-0.5 rounded-md border text-[11px] font-medium uppercase tracking-wide",
                TAG_STYLE,
            )}
        >
            {card.tag}
        </span>
    </div>
);

export default CardFace;
