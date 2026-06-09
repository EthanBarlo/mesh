import React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { Card } from "./types";

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

interface CardFaceProps {
    card: Card;
    lifted?: boolean;
}

/** The visual card, shared by the sortable item and the DragOverlay. */
export const CardFace: React.FC<CardFaceProps> = ({ card, lifted = false }) => {
    return (
        <div
            className={`p-3.5 rounded-xl bg-slate-800/90 border space-y-2.5 transition-shadow duration-150 ${
                lifted
                    ? "border-rose-500/40 shadow-2xl shadow-rose-500/20 rotate-2 scale-105"
                    : "border-white/10 shadow-sm hover:border-white/20"
            }`}
        >
            <p className="text-sm font-medium text-white leading-snug">{card.title}</p>
            <span
                className={`inline-flex px-2 py-0.5 rounded-md border text-[11px] font-semibold uppercase tracking-wide ${
                    TAG_STYLES[card.tag] ?? TAG_FALLBACK
                }`}
            >
                {card.tag}
            </span>
        </div>
    );
};

interface CardItemProps {
    card: Card;
}

const CardItem: React.FC<CardItemProps> = ({ card }) => {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
        id: card.id,
    });

    return (
        <li
            ref={setNodeRef}
            style={{ transform: CSS.Transform.toString(transform), transition }}
            {...attributes}
            {...listeners}
            className={`rounded-xl cursor-grab active:cursor-grabbing touch-none select-none focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 ${
                isDragging ? "opacity-30" : ""
            }`}
            aria-label={`${card.title} (${card.tag})`}
        >
            <CardFace card={card} />
        </li>
    );
};

export default CardItem;
