<script setup lang="ts">
import { computed, ref, useTemplateRef } from "vue";
import { useErrorBag, useWire } from "@mesh/vue";
import { Alert, Button, Panel, ProgressBar } from "@/components/ui";
import DropzoneSurface from "@/components/demo/Uploads/DropzoneSurface.vue";
import FilePreviewCard from "@/components/demo/Uploads/FilePreviewCard.vue";
import { formatBytes } from "@/components/demo/Uploads/formatBytes";

interface FileMeta {
    name: string;
    size: number;
    mime: string;
    previewUrl: string;
    tmpFilename: string;
}

type Status = "idle" | "uploading" | "complete" | "error";

defineProps<{
    maxKilobytes: number;
    accept: string;
}>();

const wire = useWire();
const errors = useErrorBag();
const inputRef = useTemplateRef<HTMLInputElement>("input");

const status = ref<Status>("idle");
const progress = ref(0);
const meta = ref<FileMeta | null>(null);
const isDragging = ref(false);
const fallbackError = ref<string | null>(null);

const errorMessage = computed(() => {
    const photoErrors =
        (errors.value as Record<string, string[] | undefined>).photo ?? null;
    return (
        photoErrors?.[0] ??
        fallbackError.value ??
        "Upload failed. Please try again."
    );
});

const startUpload = (file: File) => {
    status.value = "uploading";
    progress.value = 0;
    meta.value = null;
    fallbackError.value = null;

    wire.$upload(
        "photo",
        file,
        // finish — the temp upload landed; inspect() re-validates server-side,
        // so a file that fails the rules rejects here and we fall to the bag.
        async () => {
            try {
                const info = (await wire.$call("inspect")) as FileMeta | null;
                if (info) {
                    meta.value = info;
                    status.value = "complete";
                } else {
                    fallbackError.value = "The server did not retain the upload.";
                    status.value = "error";
                }
            } catch {
                status.value = "error";
            }
        },
        // error — transport failure or server-side validation rejection.
        // Validation messages also land in the error bag (useErrorBag).
        () => (status.value = "error"),
        // progress — Livewire emits 0–100 as the temp upload streams.
        (event) => (progress.value = event.detail.progress),
    );
};

const handleFiles = (files: FileList | null) => {
    const file = files?.[0];
    if (file) startUpload(file);
};

const handleDragOver = (event: DragEvent) => {
    event.preventDefault();
    isDragging.value = true;
};

const handleDragLeave = (event: DragEvent) => {
    event.preventDefault();
    isDragging.value = false;
};

const handleDrop = (event: DragEvent) => {
    event.preventDefault();
    isDragging.value = false;
    if (status.value === "uploading") return;
    handleFiles(event.dataTransfer?.files ?? null);
};

const handleBrowse = () => {
    if (status.value !== "uploading") inputRef.value?.click();
};

const resetLocal = () => {
    status.value = "idle";
    progress.value = 0;
    meta.value = null;
    fallbackError.value = null;
    if (inputRef.value) inputRef.value.value = "";
};

const handleRemove = () => {
    if (meta.value) {
        // Deletes the temporary file server-side and unsets the property.
        wire.$removeUpload(
            "photo",
            meta.value.tmpFilename,
            () => {},
            () => {},
        );
    }
    resetLocal();
};

const handleTryAgain = async () => {
    try {
        // Clear the rejected upload and the validation error bag server-side.
        await wire.$call("clear");
    } catch {
        // Server-side clear failed — still recover the local UI so the
        // user can retry; the next upload overwrites the stale state.
    } finally {
        resetLocal();
    }
};
</script>

<template>
    <div class="space-y-4">
        <!-- Hidden input for click-to-browse + keyboard access -->
        <input
            ref="input"
            type="file"
            :accept="accept"
            class="sr-only"
            tabindex="-1"
            aria-hidden="true"
            @change="handleFiles(($event.target as HTMLInputElement).files)"
        />

        <DropzoneSurface
            :is-dragging="isDragging"
            :busy="status === 'uploading'"
            @browse="handleBrowse"
            @dragover="handleDragOver"
            @dragleave="handleDragLeave"
            @drop="handleDrop"
        >
            <template #hint>
                Images only, up to {{ formatBytes(maxKilobytes * 1024) }} —
                enforced server-side
            </template>
        </DropzoneSurface>

        <Panel v-if="status === 'uploading'">
            <div class="mb-2 flex items-center justify-between text-sm">
                <span class="font-medium text-white">
                    Uploading to temporary storage…
                </span>
                <span class="tabular-nums text-zinc-400">
                    {{ progress }}%
                </span>
            </div>
            <ProgressBar :value="progress" aria-label="Upload progress" />
        </Panel>

        <Alert v-if="status === 'error'" tone="error" title="Upload rejected">
            <template #icon>
                <svg
                    class="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke-width="1.5"
                    stroke="currentColor"
                    aria-hidden="true"
                >
                    <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        d="M12 9v3.75m0 3.75h.008v.008H12v-.008zM21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                </svg>
            </template>
            <template #action>
                <Button
                    variant="secondary"
                    class="h-auto px-4 py-2"
                    @click="handleTryAgain"
                >
                    Try again
                </Button>
            </template>
            {{ errorMessage }}
        </Alert>

        <FilePreviewCard
            v-if="status === 'complete' && meta"
            :meta="meta"
            @remove="handleRemove"
        />
    </div>
</template>
