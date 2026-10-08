import React from "react";
import { cn } from "@/components/ui";

// Visual twin of mesh/Board/Kanban/CardItem.tsx's CardFace (same shared
// `.ticket` classes), kept dnd-kit free so the Kanban/Card island chunk
// stays tiny.

export interface KanbanCard {
    id: string;
    title: string;
    tag: string;
}

const CardFace: React.FC<{ card: KanbanCard; className?: string }> = ({
    card,
    className,
}) => (
    <div className={cn("ticket", className)}>
        <p className="ticket__title">{card.title}</p>
        <div className="ticket__foot">
            <span className="ticket__tag">{card.tag}</span>
            <span className="ticket__grip" aria-hidden="true" />
        </div>
    </div>
);

export default CardFace;
