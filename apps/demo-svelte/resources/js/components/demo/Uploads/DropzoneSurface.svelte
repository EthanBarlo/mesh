<script lang="ts">
    import type { Snippet } from "svelte";
    import type { HTMLAttributes } from "svelte/elements";
    import { cn } from "@/components/ui";

    /**
     * Click-or-drop target drawn as a dashed drafting frame with crop marks.
     * While a file is dragged over it the frame takes the accent.
     */
    interface Props extends HTMLAttributes<HTMLDivElement> {
        /** Highlights the target while a file is dragged over it. */
        isDragging: boolean;
        /** True while an upload is in flight; sets aria-busy. */
        busy: boolean;
        /** Open the file picker (click, Enter, or Space). */
        onBrowse?: () => void;
        onDragover?: (event: DragEvent) => void;
        onDragleave?: (event: DragEvent) => void;
        onDrop?: (event: DragEvent) => void;
        /** Helper line under the headline, e.g. accepted types and size cap. */
        hint?: Snippet;
    }

    let {
        isDragging,
        busy,
        onBrowse,
        onDragover,
        onDragleave,
        onDrop,
        hint,
        class: className,
        ...rest
    }: Props = $props();

    const handleKeyDown = (event: KeyboardEvent) => {
        if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            onBrowse?.();
        }
    };
</script>

<div
    {...rest}
    role="button"
    tabindex="0"
    aria-label="Upload an image: press Enter to browse, or drag and drop a file"
    aria-busy={busy}
    data-dragging={isDragging}
    class={cn("dropzone", className)}
    onclick={() => onBrowse?.()}
    onkeydown={handleKeyDown}
    ondragover={(event) => onDragover?.(event)}
    ondragleave={(event) => onDragleave?.(event)}
    ondrop={(event) => onDrop?.(event)}
>
    <div class="pointer-events-none flex flex-col items-center gap-4">
        <svg
            class="dropzone__glyph"
            data-draw=""
            viewBox="0 0 44 44"
            width="44"
            height="44"
            aria-hidden="true"
        >
            <!-- Tray -->
            <path class="ln" d="M6 28v10h32V28" />
            <!-- Arrow, lifted while a file hovers -->
            <g class="dropzone__arrow">
                <path class="ln" d="M22 32V7M14 15l8-8 8 8" />
            </g>
        </svg>
        <div>
            <p class="font-medium text-ink">
                {isDragging
                    ? "Drop it here"
                    : "Drag an image here, or click to browse"}
            </p>
            <p class="k k--caps mt-1.5 text-ink-3">{@render hint?.()}</p>
        </div>
    </div>
</div>
