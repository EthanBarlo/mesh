<script setup lang="ts">
import { computed, useAttrs } from "vue";
import { cn } from "@/components/ui";

defineOptions({ inheritAttrs: false });

/** Dashed click-or-drop target with drag-over styling and an upload icon. */
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
        :class="
            cn(
                'relative cursor-pointer rounded-xl border border-dashed p-10 text-center transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-white/20 focus:ring-offset-2 focus:ring-offset-zinc-950',
                isDragging
                    ? 'border-white/20 bg-white/[0.05]'
                    : 'border-white/10 bg-white/[0.02] hover:border-white/20 hover:bg-white/[0.05]',
                attrs.class as string,
            )
        "
        @click="emit('browse')"
        @keydown="handleKeyDown"
        @dragover="emit('dragover', $event)"
        @dragleave="emit('dragleave', $event)"
        @drop="emit('drop', $event)"
    >
        <div class="pointer-events-none flex flex-col items-center gap-3">
            <div
                :class="
                    cn(
                        'flex h-14 w-14 items-center justify-center rounded-xl transition-colors duration-150',
                        isDragging
                            ? 'bg-white/5 text-rose-400'
                            : 'bg-white/5 text-zinc-400',
                    )
                "
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
                    {{
                        isDragging
                            ? "Drop it here"
                            : "Drag an image here, or click to browse"
                    }}
                </p>
                <!-- Helper line under the headline, e.g. accepted types and size cap. -->
                <p class="mt-1 text-sm text-zinc-500"><slot name="hint" /></p>
            </div>
        </div>
    </div>
</template>
