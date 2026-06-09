import React from "react";
import { useEntangle, useWire } from "@mesh/react";

interface EntangleModesProps {
    requests: number;
    serverMessage: string;
    serverLiveMessage: string;
}

const fieldClasses =
    "w-full px-4 py-3 rounded-xl bg-slate-800/80 border border-white/10 text-white placeholder-slate-500 transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900";

const ServerValue: React.FC<{ value: string; synced: boolean }> = ({
    value,
    synced,
}) => (
    <p className="mt-2 flex items-baseline gap-2 text-xs">
        <span
            className={`shrink-0 font-semibold uppercase tracking-wider ${
                synced ? "text-emerald-400" : "text-amber-400"
            }`}
        >
            {synced ? "Server in sync" : "Server behind"}
        </span>
        <span className="truncate text-slate-400">
            server has:{" "}
            <span className="font-mono text-slate-300">
                {value === "" ? "(empty)" : `"${value}"`}
            </span>
        </span>
    </p>
);

const EntangleModes: React.FC<EntangleModesProps> = ({
    requests,
    serverMessage,
    serverLiveMessage,
}) => {
    const [message, setMessage] = useEntangle<string>("message");
    const [liveMessage, setLiveMessage] = useEntangle<string>(
        "liveMessage",
        true,
    );
    const wire = useWire();

    const handleFlush = () => {
        // Pushes any deferred (dirty) properties to the server right now.
        wire.$commit();
    };

    return (
        <div className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2">
                {/* Deferred input */}
                <div className="p-5 rounded-2xl bg-slate-800/60 border border-white/10">
                    <label
                        htmlFor="entangle-deferred"
                        className="block text-sm font-semibold text-white"
                    >
                        Deferred
                    </label>
                    <p className="mt-0.5 mb-3 font-mono text-xs text-cyan-300/80">
                        useEntangle("message")
                    </p>
                    <input
                        id="entangle-deferred"
                        type="text"
                        value={message ?? ""}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Type — nothing is sent yet"
                        className={`${fieldClasses} focus:ring-cyan-500`}
                    />
                    <ServerValue
                        value={serverMessage}
                        synced={serverMessage === (message ?? "")}
                    />
                </div>

                {/* Live input */}
                <div className="p-5 rounded-2xl bg-slate-800/60 border border-white/10">
                    <label
                        htmlFor="entangle-live"
                        className="block text-sm font-semibold text-white"
                    >
                        Live
                    </label>
                    <p className="mt-0.5 mb-3 font-mono text-xs text-rose-300/80">
                        useEntangle("liveMessage", true)
                    </p>
                    <input
                        id="entangle-live"
                        type="text"
                        value={liveMessage ?? ""}
                        onChange={(e) => setLiveMessage(e.target.value)}
                        placeholder="Type — every keystroke syncs"
                        className={`${fieldClasses} focus:ring-rose-500`}
                    />
                    <ServerValue
                        value={serverLiveMessage}
                        synced={serverLiveMessage === (liveMessage ?? "")}
                    />
                </div>
            </div>

            {/* Round-trip panel */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 p-5 rounded-2xl bg-slate-800/60 border border-white/10">
                <div className="flex items-center gap-4 grow">
                    <span className="text-5xl font-bold tabular-nums text-transparent bg-clip-text bg-gradient-to-b from-white to-slate-400">
                        {requests}
                    </span>
                    <div>
                        <p className="text-sm font-semibold text-white">
                            Server round-trips
                        </p>
                        <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
                            Counted in the component's Livewire{" "}
                            <code className="font-mono text-slate-300">
                                updated()
                            </code>{" "}
                            hooks — only requests that actually delivered a
                            property change increment it.
                        </p>
                    </div>
                </div>
                <button
                    type="button"
                    onClick={handleFlush}
                    className="shrink-0 px-5 py-3 rounded-xl bg-gradient-to-br from-rose-500 to-orange-500 text-white text-sm font-semibold hover:from-rose-600 hover:to-orange-600 active:scale-95 transition-all duration-150 shadow-lg shadow-rose-500/25 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:ring-offset-2 focus:ring-offset-slate-900"
                    aria-label="Flush deferred changes to the server now"
                >
                    Flush deferred now
                </button>
            </div>
        </div>
    );
};

export default EntangleModes;
