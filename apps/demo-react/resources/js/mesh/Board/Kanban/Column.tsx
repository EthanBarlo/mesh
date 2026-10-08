import React from "react";
import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import CardItem from "./CardItem";
import type { Column as ColumnType } from "./types";

interface ColumnProps {
    column: ColumnType;
}

/** A drawing frame: mono caps header with a progress mark and a count. */
const Column: React.FC<ColumnProps> = ({ column }) => {
    // The column itself is a droppable so cards can land in an empty list.
    const { setNodeRef, isOver } = useDroppable({ id: column.id });

    return (
        <div className="lane">
            <header className="lane__head">
                <span className="lane__mark" data-lane={column.id} aria-hidden="true" />
                <h3 className="lane__title">{column.title}</h3>
                <span className="lane__count" title={`${column.cards.length} cards`}>
                    {String(column.cards.length).padStart(2, "0")}
                </span>
            </header>

            <SortableContext items={column.cards.map((card) => card.id)} strategy={verticalListSortingStrategy}>
                <ul
                    ref={setNodeRef}
                    className="lane__list"
                    data-over={isOver || undefined}
                    aria-label={`${column.title} column`}
                >
                    {column.cards.map((card) => (
                        <CardItem key={card.id} card={card} />
                    ))}

                    {column.cards.length === 0 && (
                        <li className="lane__empty k k--caps">Drop cards here</li>
                    )}
                </ul>
            </SortableContext>
        </div>
    );
};

export default Column;
