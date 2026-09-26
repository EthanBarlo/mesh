<script lang="ts">
export interface FilePreviewMeta {
    name: string;
    size: number;
    mime: string;
    previewUrl: string;
}
</script>

<script setup lang="ts">
import { computed, useAttrs } from "vue";
import { Badge, Button, cn } from "@/components/ui";
import { formatBytes } from "./formatBytes";

defineOptions({ inheritAttrs: false });

/** Image preview with a metadata table, validation badge, and Remove action. */
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
</script>

<template>
    <div
        v-bind="attrsRest"
        :class="
            cn(
                'overflow-hidden rounded-xl border border-white/5 bg-white/[0.02]',
                attrs.class as string,
            )
        "
    >
        <div class="flex flex-col gap-5 p-5 sm:flex-row">
            <img
                :src="meta.previewUrl"
                :alt="`Preview of ${meta.name}`"
                class="h-40 w-full rounded-lg border border-white/10 object-cover sm:w-56"
            />
            <div class="flex min-w-0 flex-1 flex-col justify-between gap-4">
                <div class="min-w-0 space-y-2">
                    <p
                        class="truncate font-semibold text-white"
                        :title="meta.name"
                    >
                        {{ meta.name }}
                    </p>
                    <dl class="space-y-1.5 text-sm">
                        <div class="flex gap-2">
                            <dt class="w-16 shrink-0 text-zinc-500">Size</dt>
                            <dd class="tabular-nums text-zinc-300">
                                {{ formatBytes(meta.size) }}
                            </dd>
                        </div>
                        <div class="flex gap-2">
                            <dt class="w-16 shrink-0 text-zinc-500">Type</dt>
                            <dd class="text-zinc-300">{{ meta.mime }}</dd>
                        </div>
                        <div class="flex gap-2">
                            <dt class="w-16 shrink-0 text-zinc-500">Stored</dt>
                            <dd class="text-zinc-300">
                                Livewire temp storage (auto-cleaned, never
                                persisted)
                            </dd>
                        </div>
                    </dl>
                </div>
                <div class="flex items-center gap-3">
                    <Badge color="emerald" dot class="px-3 py-1">
                        Validated server-side
                    </Badge>
                    <Button
                        variant="secondary"
                        class="h-auto px-4 py-2"
                        @click="$emit('remove')"
                    >
                        Remove
                    </Button>
                </div>
            </div>
        </div>
    </div>
</template>
