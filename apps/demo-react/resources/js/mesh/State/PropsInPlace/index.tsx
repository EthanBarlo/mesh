import React, { useEffect, useState } from "react";
import { BigNumber, Panel } from "@/components/ui";
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
        <Panel>
            <div className="flex flex-col gap-6 sm:flex-row sm:items-stretch">
                {/* Server-computed palette prop */}
                <PaletteSwatches
                    theme={theme}
                    palette={palette}
                    className="grow"
                />

                {/* Local React state that survives prop updates */}
                <div className="shrink-0 border border-line-2 bg-paper-2 p-4 sm:w-52">
                    <p className="k k--caps text-ink-3">Client state</p>
                    <p className="mt-1.5 font-mono text-xs text-ink-3">
                        Mounted for
                    </p>
                    <BigNumber className="mt-1 block text-4xl leading-none">
                        {seconds}
                        <span className="ml-1 text-lg font-normal text-ink-3">
                            s
                        </span>
                    </BigNumber>
                    <p className="mt-3 text-xs leading-relaxed text-ink-3">
                        Plain <code className="core-code">useState</code>. It
                        survives every prop update because the component
                        never remounts.
                    </p>
                </div>
            </div>
        </Panel>
    );
};

export default PropsInPlace;
