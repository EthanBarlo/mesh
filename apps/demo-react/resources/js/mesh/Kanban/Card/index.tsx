import React, { useState } from "react";
import { useWire } from "@mesh/react";
import { cn } from "@/components/ui";
import CardFace, { type KanbanCard } from "@/components/demo/Kanban/CardFace";
import {
    announceDragEnd,
    announceDragStart,
    readPayload,
    useKanbanDrag,
    writePayload,
} from "@/components/demo/Kanban/dnd";

interface CardProps {
    card: KanbanCard;
    columnId: string;
    position: number;
}

/**
 * One island per card. It holds no board state — `columnId` and
 * `position` are reactive props from the parent Livewire Board, and a
 * drop is just an event dispatched onto Livewire's bus.
 */
const Card: React.FC<CardProps> = ({ card, columnId, position }) => {
    const wire = useWire();
    const drag = useKanbanDrag();
    const [indicator, setIndicator] = useState<"above" | "below" | null>(null);

    const isSource = drag?.cardId === card.id;

    const handleDragStart = (event: React.DragEvent<HTMLDivElement>) => {
        const payload = {
            cardId: card.id,
            title: card.title,
            fromColumnId: columnId,
            fromPosition: position,
        };
        writePayload(event.dataTransfer, payload);
        announceDragStart(payload);
    };

    // Fires on drop AND on cancel — every island clears its drag state.
    const handleDragEnd = () => announceDragEnd();

    const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
        if (!drag || isSource) return;
        // preventDefault marks this card as a valid drop target.
        event.preventDefault();
        event.dataTransfer.dropEffect = "move";
        const rect = event.currentTarget.getBoundingClientRect();
        setIndicator(
            event.clientY < rect.top + rect.height / 2 ? "above" : "below",
        );
    };

    const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
        if (event.currentTarget.contains(event.relatedTarget as Node)) return;
        setIndicator(null);
    };

    const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        // Recompute from the event — the indicator state is for visuals only.
        const rect = event.currentTarget.getBoundingClientRect();
        const side =
            event.clientY < rect.top + rect.height / 2 ? "above" : "below";
        setIndicator(null);

        // dataTransfer is only readable on drop (protected mode) — fall
        // back to the broadcast drag state, bail on foreign drags.
        const payload = readPayload(event.dataTransfer) ?? drag;
        if (!payload) return;

        let insertAt = side === "above" ? position : position + 1;
        // The server detaches the card first, shifting later indexes down.
        if (payload.fromColumnId === columnId && payload.fromPosition < insertAt) {
            insertAt -= 1;
        }
        if (payload.fromColumnId === columnId && insertAt === payload.fromPosition) {
            return; // dropped back where it started
        }

        // Persistent state goes through Livewire: the Board (and anyone
        // else listening) catches this and re-renders every island.
        wire.$dispatch("kanban.card-moved", {
            cardId: payload.cardId,
            title: payload.title,
            fromColumnId: payload.fromColumnId,
            toColumnId: columnId,
            position: insertAt,
        });
    };

    return (
        <div
            draggable
            data-card-id={card.id}
            data-column-id={columnId}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={cn(
                "relative mx-3 mt-2.5 cursor-grab active:cursor-grabbing select-none",
                isSource && "opacity-40",
            )}
            aria-label={`${card.title} (${card.tag})`}
        >
            {indicator === "above" && (
                <span className="absolute inset-x-1 -top-[7px] h-0.5 rounded-full bg-rose-400 pointer-events-none" />
            )}
            <CardFace card={card} />
            {indicator === "below" && (
                <span className="absolute inset-x-1 -bottom-[7px] h-0.5 rounded-full bg-rose-400 pointer-events-none" />
            )}
        </div>
    );
};

export default Card;
