import React, { useEffect, useState } from "react";
import { Eyebrow, Panel } from "@/components/ui";
import PaletteSwatches, {
    type Palette,
} from "@/components/demo/State/PaletteSwatches";

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
        <Panel className="p-6">
            <div className="flex flex-col sm:flex-row sm:items-start gap-6">
                {/* Server-computed palette prop */}
                <PaletteSwatches
                    theme={theme}
                    palette={palette}
                    className="grow"
                />

                {/* Local React state that survives prop updates */}
                <div className="shrink-0 sm:w-56 p-4 rounded-xl bg-slate-900/60 border border-white/10 text-center">
                    <Eyebrow>Mounted for</Eyebrow>
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
        </Panel>
    );
};

export default PropsInPlace;
