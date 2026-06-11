import React from "react";
import { Badge, Button, cn } from "@/components/ui";
import { formatBytes } from "./formatBytes";

export interface FilePreviewMeta {
    name: string;
    size: number;
    mime: string;
    previewUrl: string;
}

export interface FilePreviewCardProps {
    meta: FilePreviewMeta;
    onRemove: () => void;
    className?: string;
}

/** Image preview with a metadata table, validation badge, and Remove action. */
const FilePreviewCard: React.FC<FilePreviewCardProps> = ({
    meta,
    onRemove,
    className,
}) => (
    <div
        className={cn(
            "overflow-hidden rounded-2xl border border-white/10 bg-slate-800/80",
            className,
        )}
    >
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
                            <dd className="text-slate-300">{meta.mime}</dd>
                        </div>
                        <div className="flex gap-2">
                            <dt className="w-16 shrink-0 text-slate-500">
                                Stored
                            </dt>
                            <dd className="text-slate-300">
                                Livewire temp storage (auto-cleaned, never
                                persisted)
                            </dd>
                        </div>
                    </dl>
                </div>
                <div className="flex items-center gap-3">
                    <Badge color="emerald" dot className="px-3 py-1">
                        Validated server-side
                    </Badge>
                    <Button
                        variant="secondary"
                        onClick={onRemove}
                        className="h-auto px-4 py-2 focus:ring-offset-slate-800"
                    >
                        Remove
                    </Button>
                </div>
            </div>
        </div>
    </div>
);

export default FilePreviewCard;
