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

/** Dashed click-or-drop target with drag-over styling and an upload icon. */
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
            onClick={onBrowse}
            onKeyDown={handleKeyDown}
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
            className={cn(
                "relative cursor-pointer rounded-xl border border-dashed p-10 text-center transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-white/20 focus:ring-offset-2 focus:ring-offset-zinc-950",
                isDragging
                    ? "border-white/20 bg-white/[0.05]"
                    : "border-white/10 bg-white/[0.02] hover:border-white/20 hover:bg-white/[0.05]",
                className,
            )}
        >
            <div className="pointer-events-none flex flex-col items-center gap-3">
                <div
                    className={cn(
                        "flex h-14 w-14 items-center justify-center rounded-xl transition-colors duration-150",
                        isDragging
                            ? "bg-white/5 text-rose-400"
                            : "bg-white/5 text-zinc-400",
                    )}
                >
                    <svg
                        className="h-7 w-7"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        aria-hidden="true"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
                        />
                    </svg>
                </div>
                <div>
                    <p className="font-medium text-white">
                        {isDragging
                            ? "Drop it here"
                            : "Drag an image here, or click to browse"}
                    </p>
                    <p className="mt-1 text-sm text-zinc-500">{hint}</p>
                </div>
            </div>
        </div>
    );
};

export default DropzoneSurface;
