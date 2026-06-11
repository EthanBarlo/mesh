<script lang="ts">
    import { useErrorBag, useWire } from "@mesh/svelte";
    import { Alert, Button, Panel, ProgressBar } from "@/components/ui";
    import DropzoneSurface from "@/components/demo/Uploads/DropzoneSurface.svelte";
    import FilePreviewCard from "@/components/demo/Uploads/FilePreviewCard.svelte";
    import { formatBytes } from "@/components/demo/Uploads/formatBytes";

    interface FileMeta {
        name: string;
        size: number;
        mime: string;
        previewUrl: string;
        tmpFilename: string;
    }

    type Status = "idle" | "uploading" | "complete" | "error";

    interface Props {
        maxKilobytes: number;
        accept: string;
    }

    let { maxKilobytes, accept }: Props = $props();

    const wire = useWire();
    const errors = useErrorBag();

    let inputRef = $state<HTMLInputElement | null>(null);

    let status = $state<Status>("idle");
    let progress = $state(0);
    let meta = $state<FileMeta | null>(null);
    let isDragging = $state(false);
    let fallbackError = $state<string | null>(null);

    const errorMessage = $derived.by(() => {
        const photoErrors =
            (errors.value as Record<string, string[] | undefined>).photo ??
            null;
        return (
            photoErrors?.[0] ??
            fallbackError ??
            "Upload failed. Please try again."
        );
    });

    const startUpload = (file: File) => {
        status = "uploading";
        progress = 0;
        meta = null;
        fallbackError = null;

        wire.$upload(
            "photo",
            file,
            // finish — the temp upload landed; inspect() re-validates server-side,
            // so a file that fails the rules rejects here and we fall to the bag.
            async () => {
                try {
                    const info = (await wire.$call("inspect")) as FileMeta | null;
                    if (info) {
                        meta = info;
                        status = "complete";
                    } else {
                        fallbackError = "The server did not retain the upload.";
                        status = "error";
                    }
                } catch {
                    status = "error";
                }
            },
            // error — transport failure or server-side validation rejection.
            // Validation messages also land in the error bag (useErrorBag).
            () => (status = "error"),
            // progress — Livewire emits 0–100 as the temp upload streams.
            (event) => (progress = event.detail.progress),
        );
    };

    const handleFiles = (files: FileList | null) => {
        const file = files?.[0];
        if (file) startUpload(file);
    };

    const handleDragOver = (event: DragEvent) => {
        event.preventDefault();
        isDragging = true;
    };

    const handleDragLeave = (event: DragEvent) => {
        event.preventDefault();
        isDragging = false;
    };

    const handleDrop = (event: DragEvent) => {
        event.preventDefault();
        isDragging = false;
        if (status === "uploading") return;
        handleFiles(event.dataTransfer?.files ?? null);
    };

    const handleBrowse = () => {
        if (status !== "uploading") inputRef?.click();
    };

    const resetLocal = () => {
        status = "idle";
        progress = 0;
        meta = null;
        fallbackError = null;
        if (inputRef) inputRef.value = "";
    };

    const handleRemove = () => {
        if (meta) {
            // Deletes the temporary file server-side and unsets the property.
            wire.$removeUpload(
                "photo",
                meta.tmpFilename,
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

<div class="space-y-4">
    <!-- Hidden input for click-to-browse + keyboard access -->
    <input
        bind:this={inputRef}
        type="file"
        {accept}
        class="sr-only"
        tabindex="-1"
        aria-hidden="true"
        onchange={(event) => handleFiles(event.currentTarget.files)}
    />

    <DropzoneSurface
        {isDragging}
        busy={status === "uploading"}
        onBrowse={handleBrowse}
        onDragover={handleDragOver}
        onDragleave={handleDragLeave}
        onDrop={handleDrop}
    >
        {#snippet hint()}
            Images only, up to {formatBytes(maxKilobytes * 1024)} —
            enforced server-side
        {/snippet}
    </DropzoneSurface>

    {#if status === "uploading"}
        <Panel>
            <div class="mb-2 flex items-center justify-between text-sm">
                <span class="font-medium text-white">
                    Uploading to temporary storage…
                </span>
                <span class="tabular-nums text-zinc-400">
                    {progress}%
                </span>
            </div>
            <ProgressBar value={progress} aria-label="Upload progress" />
        </Panel>
    {/if}

    {#if status === "error"}
        <Alert tone="error" title="Upload rejected">
            {#snippet icon()}
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
            {/snippet}
            {#snippet action()}
                <Button
                    variant="secondary"
                    class="h-auto px-4 py-2"
                    onclick={handleTryAgain}
                >
                    Try again
                </Button>
            {/snippet}
            {errorMessage}
        </Alert>
    {/if}

    {#if status === "complete" && meta}
        <FilePreviewCard {meta} onRemove={handleRemove} />
    {/if}
</div>
