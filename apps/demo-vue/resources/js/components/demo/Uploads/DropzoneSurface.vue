<script setup lang="ts">
import { computed, useAttrs } from "vue";
import { cn } from "@/components/ui";

defineOptions({ inheritAttrs: false });

/**
 * Click-or-drop target drawn as a dashed drafting frame with crop marks.
 * While a file is dragged over it the frame takes the accent.
 */
defineProps<{
    /** Highlights the target while a file is dragged over it. */
    isDragging: boolean;
    /** True while an upload is in flight; sets aria-busy. */
    busy: boolean;
}>();

const emit = defineEmits<{
    /** Open the file picker (click, Enter, or Space). */
    browse: [];
    dragover: [event: DragEvent];
    dragleave: [event: DragEvent];
    drop: [event: DragEvent];
}>();

const attrs = useAttrs();
const attrsRest = computed(() => {
    const { class: _, ...rest } = attrs;
    return rest;
});

const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        emit("browse");
    }
};
</script>

<template>
    <div
        v-bind="attrsRest"
        role="button"
        tabindex="0"
        aria-label="Upload an image: press Enter to browse, or drag and drop a file"
        :aria-busy="busy"
        :data-dragging="isDragging"
        :class="cn('dropzone', attrs.class as string)"
        @click="emit('browse')"
        @keydown="handleKeyDown"
        @dragover="emit('dragover', $event)"
        @dragleave="emit('dragleave', $event)"
        @drop="emit('drop', $event)"
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
                    {{ isDragging ? "Drop it here" : "Drag an image here, or click to browse" }}
                </p>
                <!-- Helper line under the headline, e.g. accepted types and size cap. -->
                <p class="k k--caps mt-1.5 text-ink-3"><slot name="hint" /></p>
            </div>
        </div>
    </div>
</template>
