import React, { useRef, useState } from "react";
import { useErrorBag, useWire } from "@mesh/react";

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

const formatBytes = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
};

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
            // error — transport failure or server-side validation rejection.
            // Validation messages also land in the error bag (useErrorBag).
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

    const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
        if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            handleBrowse();
        }
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
                () => {},
            );
        }
        resetLocal();
    };

    const handleTryAgain = async () => {
        // Clear the rejected upload and the validation error bag server-side.
        await wire.$call("clear");
        resetLocal();
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

            {/* Dropzone */}
            <div
                role="button"
                tabIndex={0}
                aria-label="Upload an image: press Enter to browse, or drag and drop a file"
                aria-busy={status === "uploading"}
                onClick={handleBrowse}
                onKeyDown={handleKeyDown}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`relative cursor-pointer rounded-2xl border-2 border-dashed p-10 text-center transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:ring-offset-2 focus:ring-offset-slate-900 ${
                    isDragging
                        ? "border-rose-400 bg-rose-500/10 scale-[1.01]"
                        : "border-white/15 bg-white/5 hover:border-white/30 hover:bg-white/10"
                }`}
            >
                <div className="pointer-events-none flex flex-col items-center gap-3">
                    <div
                        className={`flex h-14 w-14 items-center justify-center rounded-2xl transition-colors duration-200 ${
                            isDragging
                                ? "bg-gradient-to-br from-rose-500 to-orange-500 text-white"
                                : "bg-slate-700/50 text-slate-300"
                        }`}
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
                        <p className="mt-1 text-sm text-slate-400">
                            Images only, up to {formatBytes(maxKilobytes * 1024)}{" "}
                            — enforced server-side
                        </p>
                    </div>
                </div>
            </div>

            {/* Progress bar */}
            {status === "uploading" && (
                <div className="rounded-2xl border border-white/10 bg-slate-800/80 p-5">
                    <div className="mb-2 flex items-center justify-between text-sm">
                        <span className="font-medium text-white">
                            Uploading to temporary storage…
                        </span>
                        <span className="tabular-nums text-slate-400">
                            {progress}%
                        </span>
                    </div>
                    <div
                        className="h-2.5 overflow-hidden rounded-full bg-slate-700/60"
                        role="progressbar"
                        aria-valuenow={progress}
                        aria-valuemin={0}
                        aria-valuemax={100}
                        aria-label="Upload progress"
                    >
                        <div
                            className="h-full rounded-full bg-gradient-to-r from-rose-500 to-orange-500 transition-[width] duration-200"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                </div>
            )}

            {/* Validation / upload error */}
            {status === "error" && (
                <div className="flex items-start justify-between gap-4 rounded-2xl border border-rose-500/30 bg-rose-500/10 p-5">
                    <div className="flex items-start gap-3">
                        <svg
                            className="mt-0.5 h-5 w-5 shrink-0 text-rose-400"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={1.5}
                            stroke="currentColor"
                            aria-hidden="true"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M12 9v3.75m0 3.75h.008v.008H12v-.008zM21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                        </svg>
                        <div>
                            <p className="font-medium text-rose-300">
                                Upload rejected
                            </p>
                            <p className="mt-0.5 text-sm text-rose-200/80">
                                {errorMessage}
                            </p>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={handleTryAgain}
                        className="shrink-0 rounded-xl border border-white/10 bg-slate-700/50 px-4 py-2 text-sm font-medium text-white transition-all duration-150 hover:bg-slate-700 active:scale-95 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:ring-offset-2 focus:ring-offset-slate-900"
                    >
                        Try again
                    </button>
                </div>
            )}

            {/* Preview + metadata */}
            {status === "complete" && meta && (
                <div className="overflow-hidden rounded-2xl border border-white/10 bg-slate-800/80">
                    <div className="flex flex-col gap-5 p-5 sm:flex-row">
                        <img
                            src={meta.previewUrl}
                            alt={`Preview of ${meta.name}`}
                            className="h-40 w-full rounded-xl border border-white/10 object-cover sm:w-56"
                        />
                        <div className="flex min-w-0 flex-1 flex-col justify-between gap-4">
                            <div className="min-w-0 space-y-2">
                                <p
                                    className="truncate font-semibold text-white"
                                    title={meta.name}
                                >
                                    {meta.name}
                                </p>
                                <dl className="space-y-1.5 text-sm">
                                    <div className="flex gap-2">
                                        <dt className="w-16 shrink-0 text-slate-500">
                                            Size
                                        </dt>
                                        <dd className="tabular-nums text-slate-300">
                                            {formatBytes(meta.size)}
                                        </dd>
                                    </div>
                                    <div className="flex gap-2">
                                        <dt className="w-16 shrink-0 text-slate-500">
                                            Type
                                        </dt>
                                        <dd className="text-slate-300">
                                            {meta.mime}
                                        </dd>
                                    </div>
                                    <div className="flex gap-2">
                                        <dt className="w-16 shrink-0 text-slate-500">
                                            Stored
                                        </dt>
                                        <dd className="text-slate-300">
                                            Livewire temp storage (auto-cleaned,
                                            never persisted)
                                        </dd>
                                    </div>
                                </dl>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-300">
                                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                                    Validated server-side
                                </span>
                                <button
                                    type="button"
                                    onClick={handleRemove}
                                    className="rounded-xl border border-white/10 bg-slate-700/50 px-4 py-2 text-sm font-medium text-white transition-all duration-150 hover:bg-slate-700 active:scale-95 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:ring-offset-2 focus:ring-offset-slate-800"
                                >
                                    Remove
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Dropzone;
