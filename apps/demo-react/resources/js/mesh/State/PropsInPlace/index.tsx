import React, { useEffect, useState } from "react";

interface Swatch {
    name: string;
    hex: string;
}

interface Palette {
    label: string;
    accent: string;
    swatches: Swatch[];
}

interface PropsInPlaceProps {
    theme: string;
    palette: Palette;
}

const PropsInPlace: React.FC<PropsInPlaceProps> = ({ theme, palette }) => {
    // Plain local React state — never touches the server.
    const [seconds, setSeconds] = useState(0);

    useEffect(() => {
        const id = window.setInterval(() => setSeconds((s) => s + 1), 1000);
        return () => window.clearInterval(id);
    }, []);

    return (
        <div className="p-6 rounded-2xl bg-slate-800/60 border border-white/10">
            <div className="flex flex-col sm:flex-row sm:items-start gap-6">
                {/* Server-computed palette prop */}
                <div className="grow">
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
                        Computed in <code className="font-mono">props()</code>{" "}
                        on the server, delivered as a prop on every re-render.
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

                {/* Local React state that survives prop updates */}
                <div className="shrink-0 sm:w-56 p-4 rounded-xl bg-slate-900/60 border border-white/10 text-center">
                    <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                        Mounted for
                    </span>
                    <p
                        className="my-2 text-4xl font-bold tabular-nums"
                        style={{ color: palette.accent }}
                    >
                        {seconds}s
                    </p>
                    <p className="text-xs text-slate-400 leading-relaxed">
                        Local state survives server re-renders — this component
                        never remounts.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default PropsInPlace;
