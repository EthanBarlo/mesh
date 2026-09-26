<script lang="ts">
    import type { Snippet } from "svelte";
    import type { HTMLAttributes } from "svelte/elements";
    import { cn } from "@/components/ui";

    /** Dashed click-or-drop target with drag-over styling and an upload icon. */
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
    class={cn(
        "relative cursor-pointer rounded-xl border border-dashed p-10 text-center transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-white/20 focus:ring-offset-2 focus:ring-offset-zinc-950",
        isDragging
            ? "border-white/20 bg-white/[0.05]"
            : "border-white/10 bg-white/[0.02] hover:border-white/20 hover:bg-white/[0.05]",
        className,
    )}
    onclick={() => onBrowse?.()}
    onkeydown={handleKeyDown}
    ondragover={(event) => onDragover?.(event)}
    ondragleave={(event) => onDragleave?.(event)}
    ondrop={(event) => onDrop?.(event)}
>
    <div class="pointer-events-none flex flex-col items-center gap-3">
        <div
            class={cn(
                "flex h-14 w-14 items-center justify-center rounded-xl transition-colors duration-150",
                isDragging
                    ? "bg-white/5 text-rose-400"
                    : "bg-white/5 text-zinc-400",
            )}
        >
            <svg
                class="h-7 w-7"
                fill="none"
                viewBox="0 0 24 24"
                stroke-width="1.5"
                stroke="currentColor"
                aria-hidden="true"
            >
                <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
                />
            </svg>
        </div>
        <div>
            <p class="font-medium text-white">
                {isDragging
                    ? "Drop it here"
                    : "Drag an image here, or click to browse"}
            </p>
            <!-- Helper line under the headline, e.g. accepted types and size cap. -->
            <p class="mt-1 text-sm text-zinc-500">{@render hint?.()}</p>
        </div>
    </div>
</div>
