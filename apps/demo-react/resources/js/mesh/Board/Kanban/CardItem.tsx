import React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { cn } from "@/components/ui";
import type { Card } from "./types";

const TAG_STYLE = "bg-white/5 text-zinc-300 border-white/10";

interface CardFaceProps {
    card: Card;
    lifted?: boolean;
}

/** The visual card, shared by the sortable item and the DragOverlay. */
export const CardFace: React.FC<CardFaceProps> = ({ card, lifted = false }) => {
    return (
        <div
            className={cn(
                "p-3.5 rounded-lg bg-white/[0.02] border space-y-2.5 transition-colors duration-150",
                lifted
                    ? "border-white/20 bg-white/[0.05] rotate-2 scale-105"
                    : "border-white/10 hover:border-white/20",
            )}
        >
            <p className="text-sm font-medium text-white leading-snug">{card.title}</p>
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
            className={cn(
                "rounded-lg cursor-grab active:cursor-grabbing touch-none select-none focus:outline-none focus-visible:ring-2 focus-visible:ring-white/20 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950",
                isDragging && "opacity-40",
            )}
            aria-label={`${card.title} (${card.tag})`}
        >
            <CardFace card={card} />
        </li>
    );
};

export default CardItem;
