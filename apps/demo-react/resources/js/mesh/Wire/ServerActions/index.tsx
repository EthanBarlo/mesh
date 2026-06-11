import React, { useState } from "react";
import { useWire } from "@mesh/react";
import { Button, Eyebrow, Panel, Stat, Textarea } from "@/components/ui";
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

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Panel className="flex flex-col">
                <Eyebrow>await wire.$call("analyze", text)</Eyebrow>

                <Textarea
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder={placeholder}
                    rows={3}
                    className="mt-3 resize-none focus:ring-rose-500 focus:ring-offset-0 focus:border-transparent"
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

                {analysis ? (
                    <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-2">
                        <Stat label="Words" value={analysis.words} />
                        <Stat label="Characters" value={analysis.characters} />
                        <Stat label="Longest word" value={analysis.longestWord || "—"} />
                        <Stat label="Server time" value={analysis.analyzedAt} />
                    </div>
                ) : (
                    <p className="mt-4 text-sm text-slate-500">
                        The result object below is the PHP method's return value — no route, no controller, no fetch.
                    </p>
                )}
            </Panel>

            <Panel className="flex flex-col">
                <Eyebrow>await wire.$call("rollDice")</Eyebrow>

                <div className="flex-1 flex flex-col items-center justify-center py-6">
                    {roll ? (
                        <>
                            <div className={`flex items-center gap-3 transition-opacity ${rolling ? "opacity-40" : "opacity-100"}`}>
                                {roll.dice.map((value, i) => (
                                    <Die key={i} value={value} />
                                ))}
                            </div>
                            <p className="mt-4 text-sm text-slate-400">
                                Server total:{" "}
                                <span className="text-xl font-bold text-white tabular-nums align-middle">{roll.total}</span>
                            </p>
                        </>
                    ) : (
                        <p className="text-sm text-slate-500 text-center max-w-xs">
                            PHP's <code className="text-orange-300">random_int()</code> rolls the dice — the array comes back as a
                            resolved Promise.
                        </p>
                    )}
                </div>

                <Button
                    variant="secondary"
                    loading={rolling}
                    onClick={handleRoll}
                    className="self-center font-semibold focus:ring-orange-500"
                >
                    {rolling ? "Rolling…" : "Roll dice"}
                </Button>
            </Panel>
        </div>
    );
};

export default ServerActions;
