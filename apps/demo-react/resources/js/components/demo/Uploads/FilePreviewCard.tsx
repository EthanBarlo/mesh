import React, { useState } from "react";
import { Button, cn } from "@/components/ui";
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

/**
 * Image preview with a dimension line (the image's natural size), a metadata
 * schedule, the server-validated status, and a Remove action.
 */
const FilePreviewCard: React.FC<FilePreviewCardProps> = ({
    meta,
    onRemove,
    className,
}) => {
    // Natural pixel size, read from the image once it loads.
    const [natural, setNatural] = useState<{ w: number; h: number } | null>(
        null,
    );

    return (
        <div className={cn("border border-line-2 bg-paper", className)}>
            <div className="flex flex-col gap-5 p-5 sm:flex-row">
                <figure className="w-full shrink-0 sm:w-56">
                    <div className="border border-line-2 bg-paper-2">
                        <img
                            src={meta.previewUrl}
                            alt={`Preview of ${meta.name}`}
                            className="block h-40 w-full object-contain"
                            onLoad={(e) =>
                                setNatural({
                                    w: e.currentTarget.naturalWidth,
                                    h: e.currentTarget.naturalHeight,
                                })
                            }
                        />
                    </div>
                    <figcaption className="core-dim mt-2">
                        <span>
                            {natural
                                ? `${natural.w} × ${natural.h} px`
                                : "measuring…"}
                        </span>
                    </figcaption>
                </figure>

                <div className="flex min-w-0 flex-1 flex-col justify-between gap-4">
                    <div className="min-w-0">
                        <p
                            className="truncate font-semibold text-ink"
                            title={meta.name}
                        >
                            {meta.name}
                        </p>
                        <dl className="core-readout core-readout--caps mt-2">
                            <div>
                                <dt>Size</dt>
                                <dd>{formatBytes(meta.size)}</dd>
                            </div>
                            <div>
                                <dt>Type</dt>
                                <dd>{meta.mime}</dd>
                            </div>
                            <div>
                                <dt>Stored</dt>
                                <dd className="core-readout__text">
                                    Livewire temp storage. Auto-cleaned, never
                                    persisted.
                                </dd>
                            </div>
                        </dl>
                    </div>
                    <div className="flex flex-wrap items-center justify-between gap-3">
                        <span className="core-status core-status--ink">
                            <span className="core-dot" aria-hidden="true" />
                            Validated server-side
                        </span>
                        <Button variant="secondary" size="sm" onClick={onRemove}>
                            Remove
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FilePreviewCard;
