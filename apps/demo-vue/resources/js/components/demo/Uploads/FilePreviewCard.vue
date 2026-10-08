<script lang="ts">
export interface FilePreviewMeta {
    name: string;
    size: number;
    mime: string;
    previewUrl: string;
}
</script>

<script setup lang="ts">
import { computed, ref, useAttrs } from "vue";
import { Button, cn } from "@/components/ui";
import { formatBytes } from "./formatBytes";

defineOptions({ inheritAttrs: false });

/**
 * Image preview with a dimension line (the image's natural size), a metadata
 * schedule, the server-validated status, and a Remove action.
 */
defineProps<{
    meta: FilePreviewMeta;
}>();

defineEmits<{
    remove: [];
}>();

const attrs = useAttrs();
const attrsRest = computed(() => {
    const { class: _, ...rest } = attrs;
    return rest;
});

// Natural pixel size, read from the image once it loads.
const natural = ref<{ w: number; h: number } | null>(null);

const handleLoad = (event: Event) => {
    const img = event.currentTarget as HTMLImageElement;
    natural.value = { w: img.naturalWidth, h: img.naturalHeight };
};
</script>

<template>
    <div
        v-bind="attrsRest"
        :class="cn('border border-line-2 bg-paper', attrs.class as string)"
    >
        <div class="flex flex-col gap-5 p-5 sm:flex-row">
            <figure class="w-full shrink-0 sm:w-56">
                <div class="border border-line-2 bg-paper-2">
                    <img
                        :src="meta.previewUrl"
                        :alt="`Preview of ${meta.name}`"
                        class="block h-40 w-full object-contain"
                        @load="handleLoad"
                    />
                </div>
                <figcaption class="core-dim mt-2">
                    <span>{{ natural ? `${natural.w} × ${natural.h} px` : "measuring…" }}</span>
                </figcaption>
            </figure>

            <div class="flex min-w-0 flex-1 flex-col justify-between gap-4">
                <div class="min-w-0">
                    <p class="truncate font-semibold text-ink" :title="meta.name">
                        {{ meta.name }}
                    </p>
                    <dl class="core-readout core-readout--caps mt-2">
                        <div>
                            <dt>Size</dt>
                            <dd>{{ formatBytes(meta.size) }}</dd>
                        </div>
                        <div>
                            <dt>Type</dt>
                            <dd>{{ meta.mime }}</dd>
                        </div>
                        <div>
                            <dt>Stored</dt>
                            <dd class="core-readout__text">
                                Livewire temp storage. Auto-cleaned, never
                                persisted.
                            </dd>
                        </div>
                    </dl>
                </div>
                <div class="flex flex-wrap items-center justify-between gap-3">
                    <span class="core-status core-status--ink">
                        <span class="core-dot" aria-hidden="true" />
                        Validated server-side
                    </span>
                    <Button variant="secondary" size="sm" @click="$emit('remove')">
                        Remove
                    </Button>
                </div>
            </div>
        </div>
    </div>
</template>
