import React from "react";
import { cn } from "@/components/ui";

export interface DropzoneSurfaceProps {
    /** Highlights the target while a file is dragged over it. */
    isDragging: boolean;
    /** True while an upload is in flight; sets aria-busy. */
    busy: boolean;
    /** Helper line under the headline, e.g. accepted types and size cap. */
    hint: React.ReactNode;
    /** Open the file picker (click, Enter, or Space). */
    onBrowse: () => void;
    onDragOver: (event: React.DragEvent<HTMLDivElement>) => void;
    onDragLeave: (event: React.DragEvent<HTMLDivElement>) => void;
    onDrop: (event: React.DragEvent<HTMLDivElement>) => void;
    className?: string;
}

/**
 * Click-or-drop target drawn as a dashed drafting frame with crop marks.
 * While a file is dragged over it the frame takes the accent.
 */
const DropzoneSurface: React.FC<DropzoneSurfaceProps> = ({
    isDragging,
    busy,
    hint,
    onBrowse,
    onDragOver,
    onDragLeave,
    onDrop,
    className,
}) => {
    const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
        if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            onBrowse();
        }
    };

    return (
        <div
            role="button"
            tabIndex={0}
            aria-label="Upload an image: press Enter to browse, or drag and drop a file"
            aria-busy={busy}
            data-dragging={isDragging}
            onClick={onBrowse}
            onKeyDown={handleKeyDown}
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
            className={cn("dropzone", className)}
        >
            <div className="pointer-events-none flex flex-col items-center gap-4">
                <svg
                    className="dropzone__glyph"
                    data-draw=""
                    viewBox="0 0 44 44"
                    width="44"
                    height="44"
                    aria-hidden="true"
                >
                    {/* Tray */}
                    <path className="ln" d="M6 28v10h32V28" />
                    {/* Arrow, lifted while a file hovers */}
                    <g className="dropzone__arrow">
                        <path className="ln" d="M22 32V7M14 15l8-8 8 8" />
                    </g>
                </svg>
                <div>
                    <p className="font-medium text-ink">
                        {isDragging
                            ? "Drop it here"
                            : "Drag an image here, or click to browse"}
                    </p>
                    <p className="k k--caps mt-1.5 text-ink-3">{hint}</p>
                </div>
            </div>
        </div>
    );
};

export default DropzoneSurface;
