import React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { cn } from "@/components/ui";
import type { Card } from "./types";

interface CardFaceProps {
    card: Card;
    /** The DragOverlay copy: lifted, with an offset outline. */
    lifted?: boolean;
    /** The sortable placeholder: an accent slot where the card will land. */
    slot?: boolean;
}

/**
 * The visual card (a paper tag), shared by the sortable item and the
 * DragOverlay. Styled by the shared `.ticket` classes in ecosystem.css,
 * which the Blade-composed Kanban uses too.
 */
export const CardFace: React.FC<CardFaceProps> = ({ card, lifted = false, slot = false }) => (
    <div className={cn("ticket", lifted && "ticket--lifted", slot && "ticket--slot")}>
        <p className="ticket__title">{card.title}</p>
        <div className="ticket__foot">
            <span className="ticket__tag">{card.tag}</span>
            <span className="ticket__grip" aria-hidden="true" />
        </div>
    </div>
);

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
            className="lane__grab touch-none"
            aria-label={`${card.title} (${card.tag})`}
        >
            <CardFace card={card} slot={isDragging} />
        </li>
    );
};

export default CardItem;
