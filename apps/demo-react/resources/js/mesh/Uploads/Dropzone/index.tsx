import React, { useRef, useState } from "react";
import { useErrorBag, useWire } from "@mesh/react";
import { Alert, Button, Panel, ProgressBar } from "@/components/ui";
import DropzoneSurface from "@/components/demo/Uploads/DropzoneSurface";
import FilePreviewCard from "@/components/demo/Uploads/FilePreviewCard";
import { formatBytes } from "@/components/demo/Uploads/formatBytes";

interface DropzoneProps {
    maxKilobytes: number;
    accept: string;
}

interface FileMeta {
    name: string;
    size: number;
    mime: string;
    previewUrl: string;
    tmpFilename: string;
}

type Status = "idle" | "uploading" | "complete" | "error";

const Dropzone: React.FC<DropzoneProps> = ({ maxKilobytes, accept }) => {
    const wire = useWire();
    const errors = useErrorBag();
    const inputRef = useRef<HTMLInputElement>(null);

    const [status, setStatus] = useState<Status>("idle");
    const [progress, setProgress] = useState(0);
    const [meta, setMeta] = useState<FileMeta | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [fallbackError, setFallbackError] = useState<string | null>(null);

    const photoErrors = errors.photo ?? null;
    const errorMessage =
        photoErrors?.[0] ?? fallbackError ?? "Upload failed. Please try again.";

    const startUpload = (file: File) => {
        setStatus("uploading");
        setProgress(0);
        setMeta(null);
        setFallbackError(null);

        wire.$upload(
            "photo",
            file,
            // finish — the temp upload landed; inspect() re-validates server-side,
            // so a file that fails the rules rejects here and we fall to the bag.
            async () => {
                try {
                    const info = (await wire.$call("inspect")) as FileMeta | null;
                    if (info) {
                        setMeta(info);
                        setStatus("complete");
                    } else {
                        setFallbackError("The server did not retain the upload.");
                        setStatus("error");
                    }
                } catch {
                    setStatus("error");
                }
            },
            // error — a transport failure, or a file Livewire's temporary-upload
            // rules reject. #[Validate] failures land in the error bag instead.
            () => setStatus("error"),
            // progress — Livewire emits 0–100 as the temp upload streams.
            (event) => setProgress(event.detail.progress),
        );
    };

    const handleFiles = (files: FileList | null) => {
        const file = files?.[0];
        if (file) startUpload(file);
    };

    const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        setIsDragging(false);
        if (status === "uploading") return;
        handleFiles(event.dataTransfer.files);
    };

    const handleBrowse = () => {
        if (status !== "uploading") inputRef.current?.click();
    };

    const resetLocal = () => {
        setStatus("idle");
        setProgress(0);
        setMeta(null);
        setFallbackError(null);
        if (inputRef.current) inputRef.current.value = "";
    };

    const handleRemove = () => {
        if (meta) {
            // Deletes the temporary file server-side and unsets the property.
            wire.$removeUpload(
                "photo",
                meta.tmpFilename,
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

    return (
        <div className="space-y-4">
            {/* Hidden input for click-to-browse + keyboard access */}
            <input
                ref={inputRef}
                type="file"
                accept={accept}
                className="sr-only"
                tabIndex={-1}
                aria-hidden="true"
                onChange={(event) => handleFiles(event.target.files)}
            />

            <DropzoneSurface
                isDragging={isDragging}
                busy={status === "uploading"}
                hint={
                    <>
                        Images only · up to{" "}
                        <span className="tabular-nums">
                            {formatBytes(maxKilobytes * 1024)}
                        </span>{" "}
                        · checked on the server
                    </>
                }
                onBrowse={handleBrowse}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
            />

            {status === "uploading" && (
                <Panel>
                    <div className="mb-3 flex items-center justify-between gap-3">
                        <span className="core-status core-status--ink">
                            <span
                                className="core-dot"
                                data-state="live"
                                aria-hidden="true"
                            />
                            Uploading to temporary storage
                        </span>
                        <span className="font-mono text-sm tabular-nums text-ink">
                            {progress}%
                        </span>
                    </div>
                    <ProgressBar value={progress} aria-label="Upload progress" />
                </Panel>
            )}

            {status === "error" && (
                <Alert
                    tone="error"
                    title="Upload rejected"
                    action={
                        <Button
                            variant="secondary"
                            size="sm"
                            onClick={handleTryAgain}
                        >
                            Try again
                        </Button>
                    }
                >
                    {errorMessage}
                </Alert>
            )}

            {status === "complete" && meta && (
                <FilePreviewCard meta={meta} onRemove={handleRemove} />
            )}
        </div>
    );
};

export default Dropzone;
