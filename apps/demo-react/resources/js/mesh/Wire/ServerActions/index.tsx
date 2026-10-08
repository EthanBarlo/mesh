import React, { useState } from "react";
import { useWire } from "@mesh/react";
import { Button, Panel, Textarea, cn } from "@/components/ui";
import Die from "@/components/demo/Wire/Die";

interface ServerActionsProps {
    placeholder: string;
}

interface DiceResult {
    dice: number[];
    total: number;
}

interface AnalysisResult {
    words: number;
    characters: number;
    longestWord: string;
    analyzedAt: string;
}

const ServerActions: React.FC<ServerActionsProps> = ({ placeholder }) => {
    const wire = useWire();

    const [text, setText] = useState("");
    const [analyzing, setAnalyzing] = useState(false);
    const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);

    const [rolling, setRolling] = useState(false);
    const [roll, setRoll] = useState<DiceResult | null>(null);

    const handleAnalyze = async () => {
        if (analyzing || text.trim() === "") return;
        setAnalyzing(true);
        try {
            // A real round-trip: the string is taken apart by PHP, not JS.
            const result = (await wire.$call("analyze", text)) as AnalysisResult;
            setAnalysis(result);
        } finally {
            setAnalyzing(false);
        }
    };

    const handleRoll = async () => {
        if (rolling) return;
        setRolling(true);
        try {
            const result = (await wire.$call("rollDice")) as DiceResult;
            setRoll(result);
        } finally {
            setRolling(false);
        }
    };

    // The return array's keys, exactly as PHP sends them.
    const returned: [string, React.ReactNode][] = [
        ["words", analysis?.words],
        ["characters", analysis?.characters],
        [
            "longestWord",
            analysis ? (analysis.longestWord ? `"${analysis.longestWord}"` : '""') : undefined,
        ],
        ["analyzedAt", analysis?.analyzedAt],
    ];

    return (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <Panel className="flex flex-col">
                <p className="k k--caps text-ink-3">Analyze text</p>
                <p className="mt-0.5 font-mono text-xs text-ink">
                    await wire.$call("analyze", text)
                </p>

                <Textarea
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder={placeholder}
                    rows={3}
                    className="mt-3 resize-none"
                    aria-label="Text to analyze on the server"
                />

                <Button
                    onClick={handleAnalyze}
                    disabled={text.trim() === ""}
                    loading={analyzing}
                    className="mt-3 self-start"
                >
                    {analyzing ? "Analyzing on server…" : "Analyze on server"}
                </Button>

                <div className="mt-5">
                    <p className="k k--caps text-ink-3">
                        Returned by analyze()
                    </p>
                    <dl
                        className={cn(
                            "core-readout mt-1 transition-opacity duration-150 motion-reduce:transition-none",
                            analyzing && "opacity-50",
                        )}
                        aria-live="polite"
                    >
                        {returned.map(([key, value]) => (
                            <div key={key}>
                                <dt>{key}</dt>
                                <dd>
                                    {value === undefined ? (
                                        <span className="text-ink-3">—</span>
                                    ) : (
                                        value
                                    )}
                                </dd>
                            </div>
                        ))}
                    </dl>
                </div>
            </Panel>

            <Panel className="flex flex-col">
                <p className="k k--caps text-ink-3">Roll dice</p>
                <p className="mt-0.5 font-mono text-xs text-ink">
                    await wire.$call("rollDice")
                </p>

                <div className="flex flex-1 flex-col items-center justify-center py-8">
                    <div className="inline-flex flex-col gap-3">
                        <div
                            className={cn(
                                "flex items-center gap-3 transition-opacity duration-150 motion-reduce:transition-none",
                                rolling && "opacity-40",
                            )}
                        >
                            {roll
                                ? roll.dice.map((value, i) => (
                                      <Die key={i} value={value} />
                                  ))
                                : [0, 1, 2].map((i) => (
                                      <span
                                          key={i}
                                          className="size-14 border border-dashed border-line-3"
                                          aria-hidden="true"
                                      />
                                  ))}
                        </div>
                        {/* Dimension line under the three dice: their total. */}
                        <div className="core-dim" aria-live="polite">
                            <span>
                                total{" "}
                                <span className="font-medium text-ink">
                                    {roll ? roll.total : "—"}
                                </span>
                            </span>
                        </div>
                    </div>
                    <p className="mt-5 max-w-xs text-center text-xs leading-relaxed text-ink-3">
                        PHP's <code className="core-code">random_int()</code>{" "}
                        rolls the dice. The array comes back as the resolved
                        Promise.
                    </p>
                </div>

                <Button
                    variant="secondary"
                    loading={rolling}
                    onClick={handleRoll}
                    className="self-center"
                >
                    {rolling ? "Rolling…" : "Roll dice"}
                </Button>
            </Panel>
        </div>
    );
};

export default ServerActions;
