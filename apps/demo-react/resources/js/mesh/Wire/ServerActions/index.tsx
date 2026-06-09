import React, { useState } from "react";
import { useWire } from "@mesh/react";

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

const Spinner: React.FC = () => (
    <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-90" fill="currentColor" d="M12 2a10 10 0 0110 10h-4a6 6 0 00-6-6V2z" />
    </svg>
);

// Pip positions on a 3x3 grid for each die face.
const PIPS: Record<number, number[]> = {
    1: [4],
    2: [2, 6],
    3: [2, 4, 6],
    4: [0, 2, 6, 8],
    5: [0, 2, 4, 6, 8],
    6: [0, 2, 3, 5, 6, 8],
};

const Die: React.FC<{ value: number }> = ({ value }) => (
    <div
        className="w-14 h-14 rounded-xl bg-slate-700/60 border border-white/10 grid grid-cols-3 grid-rows-3 p-2.5 shadow-inner"
        role="img"
        aria-label={`Die showing ${value}`}
    >
        {Array.from({ length: 9 }, (_, i) => (
            <span key={i} className="flex items-center justify-center">
                {(PIPS[value] ?? []).includes(i) && <span className="w-2 h-2 rounded-full bg-white" />}
            </span>
        ))}
    </div>
);

const Stat: React.FC<{ label: string; value: string | number }> = ({ label, value }) => (
    <div className="p-3 rounded-xl bg-slate-900/50 border border-white/5 text-center">
        <p className="text-lg font-bold text-white tabular-nums truncate" title={String(value)}>
            {value}
        </p>
        <p className="mt-0.5 text-[11px] uppercase tracking-wider text-slate-500">{label}</p>
    </div>
);

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
            {/* Analyze panel */}
            <div className="p-5 rounded-2xl bg-slate-800/60 border border-white/10 flex flex-col">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                    await wire.$call("analyze", text)
                </span>

                <textarea
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder={placeholder}
                    rows={3}
                    className="mt-3 w-full rounded-xl bg-slate-900/60 border border-white/10 px-4 py-3 text-sm text-white placeholder-slate-500 resize-none focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent transition"
                    aria-label="Text to analyze on the server"
                />

                <button
                    type="button"
                    onClick={handleAnalyze}
                    disabled={analyzing || text.trim() === ""}
                    className="mt-3 self-start inline-flex items-center gap-2 px-5 h-11 rounded-xl bg-gradient-to-br from-rose-500 to-orange-500 text-white text-sm font-semibold hover:from-rose-600 hover:to-orange-600 active:scale-95 transition-all duration-150 shadow-lg shadow-rose-500/25 disabled:opacity-50 disabled:pointer-events-none focus:outline-none focus:ring-2 focus:ring-rose-500 focus:ring-offset-2 focus:ring-offset-slate-900"
                >
                    {analyzing && <Spinner />}
                    {analyzing ? "Analyzing on server…" : "Analyze on server"}
                </button>

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
            </div>

            {/* Dice panel */}
            <div className="p-5 rounded-2xl bg-slate-800/60 border border-white/10 flex flex-col">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                    await wire.$call("rollDice")
                </span>

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

                <button
                    type="button"
                    onClick={handleRoll}
                    disabled={rolling}
                    className="self-center inline-flex items-center gap-2 px-5 h-11 rounded-xl bg-slate-700/50 border border-white/10 text-white text-sm font-semibold hover:bg-slate-700 hover:border-white/20 active:scale-95 transition-all duration-150 disabled:opacity-50 disabled:pointer-events-none focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 focus:ring-offset-slate-900"
                >
                    {rolling && <Spinner />}
                    {rolling ? "Rolling…" : "Roll dice"}
                </button>
            </div>
        </div>
    );
};

export default ServerActions;
