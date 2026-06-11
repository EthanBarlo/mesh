<script module lang="ts">
    export interface FilePreviewMeta {
        name: string;
        size: number;
        mime: string;
        previewUrl: string;
    }
</script>

<script lang="ts">
    import type { HTMLAttributes } from "svelte/elements";
    import { Badge, Button, cn } from "@/components/ui";
    import { formatBytes } from "./formatBytes";

    /** Image preview with a metadata table, validation badge, and Remove action. */
    interface Props extends HTMLAttributes<HTMLDivElement> {
        meta: FilePreviewMeta;
        onRemove?: () => void;
    }

    let { meta, onRemove, class: className, ...rest }: Props = $props();
</script>

<div
    {...rest}
    class={cn(
        "overflow-hidden rounded-xl border border-white/5 bg-white/[0.02]",
        className,
    )}
>
    <div class="flex flex-col gap-5 p-5 sm:flex-row">
        <img
            src={meta.previewUrl}
            alt={`Preview of ${meta.name}`}
            class="h-40 w-full rounded-lg border border-white/10 object-cover sm:w-56"
        />
        <div class="flex min-w-0 flex-1 flex-col justify-between gap-4">
            <div class="min-w-0 space-y-2">
                <p class="truncate font-semibold text-white" title={meta.name}>
                    {meta.name}
                </p>
                <dl class="space-y-1.5 text-sm">
                    <div class="flex gap-2">
                        <dt class="w-16 shrink-0 text-zinc-500">Size</dt>
                        <dd class="tabular-nums text-zinc-300">
                            {formatBytes(meta.size)}
                        </dd>
                    </div>
                    <div class="flex gap-2">
                        <dt class="w-16 shrink-0 text-zinc-500">Type</dt>
                        <dd class="text-zinc-300">{meta.mime}</dd>
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
                    onclick={() => onRemove?.()}
                >
                    Remove
                </Button>
            </div>
        </div>
    </div>
</div>
