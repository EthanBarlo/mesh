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

/** Header dot + title + swatch grid for a server-computed palette prop. */
const PaletteSwatches: React.FC<PaletteSwatchesProps> = ({
    theme,
    palette,
    className,
}) => (
    <div className={cn(className)}>
        <div className="flex items-center gap-2">
            <span
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: palette.accent }}
                aria-hidden="true"
            />
            <h3 className="text-sm font-semibold text-white">
                {palette.label} palette
            </h3>
            <code className="font-mono text-xs text-slate-500">
                theme = "{theme}"
            </code>
        </div>
        <p className="mt-1 text-xs text-slate-400">
            Computed in <code className="font-mono">props()</code> on the
            server, delivered as a prop on every re-render.
        </p>
        <div className="mt-4 flex gap-3">
            {palette.swatches.map((swatch) => (
                <div key={swatch.name} className="text-center">
                    <div
                        className="w-14 h-14 rounded-xl border border-white/10 shadow-lg"
                        style={{ backgroundColor: swatch.hex }}
                        role="img"
                        aria-label={`${palette.label} ${swatch.name}: ${swatch.hex}`}
                    />
                    <span className="mt-1.5 block font-mono text-[10px] text-slate-500">
                        {swatch.hex}
                    </span>
                </div>
            ))}
        </div>
    </div>
);

export default PaletteSwatches;
