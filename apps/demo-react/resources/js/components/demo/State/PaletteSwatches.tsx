import React from "react";
import { cn } from "@/components/ui";

export interface Swatch {
    name: string;
    hex: string;
}

export interface Palette {
    label: string;
    accent: string;
    swatches: Swatch[];
}

export interface PaletteSwatchesProps {
    theme: string;
    palette: Palette;
    className?: string;
}

/**
 * Header chip + title + swatch schedule for a server-computed palette prop.
 * The swatch colours are data from props(), so they stay real hex values.
 */
const PaletteSwatches: React.FC<PaletteSwatchesProps> = ({
    theme,
    palette,
    className,
}) => (
    <div className={cn(className)}>
        <p className="k k--caps text-ink-3">Server props</p>
        <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1">
            <span
                className="size-3 shrink-0 border border-line-3"
                style={{ backgroundColor: palette.accent }}
                aria-hidden="true"
            />
            <h3 className="text-sm font-semibold text-ink">
                {palette.label} palette
            </h3>
            <code className="font-mono text-xs text-ink-3">
                theme = "{theme}"
            </code>
        </div>
        <p className="mt-1 text-xs leading-relaxed text-ink-3">
            Computed in <code className="core-code">props()</code> on the
            server and delivered as a prop on every render.
        </p>
        <ul className="mt-4 flex flex-wrap gap-3">
            {palette.swatches.map((swatch) => (
                <li key={swatch.name} className="w-14">
                    <div
                        className="size-14 border border-line-3"
                        style={{ backgroundColor: swatch.hex }}
                        role="img"
                        aria-label={`${palette.label} ${swatch.name}: ${swatch.hex}`}
                    />
                    <span className="mt-1.5 block font-mono text-[11px] leading-tight text-ink-2 tabular-nums">
                        {swatch.name}
                    </span>
                    <span className="block font-mono text-[10px] leading-tight text-ink-3">
                        {swatch.hex}
                    </span>
                </li>
            ))}
        </ul>
    </div>
);

export default PaletteSwatches;
