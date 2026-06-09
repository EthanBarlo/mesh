import React, { useState } from "react";
import { useWire } from "@mesh/react";

interface EventBridgeProps {
    /** Count of page.ping events handled by the PHP class, fed back via props(). */
    received: number;
}

const EventBridge: React.FC<EventBridgeProps> = ({ received }) => {
    const wire = useWire();

    const [message, setMessage] = useState("Hello from React");
    const [sent, setSent] = useState(0);

    const handlePing = () => {
        // Straight onto Livewire's event bus — any component with
        // #[On('mesh.ping')] hears this, React or not.
        wire.$dispatch("mesh.ping", { message });
        setSent((n) => n + 1);
    };

    return (
        <div className="p-5 rounded-2xl bg-slate-800/60 border border-white/10">
            <div className="flex items-center justify-between gap-3">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">React island · EventBridge</span>
                {sent > 0 && (
                    <span className="text-xs font-medium text-rose-400 tabular-nums">
                        {sent} dispatched
                    </span>
                )}
            </div>

            {/* Outbound: React -> Livewire event bus */}
            <div className="mt-4 flex flex-col sm:flex-row gap-2">
                <input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handlePing()}
                    className="flex-1 min-w-0 rounded-xl bg-slate-900/60 border border-white/10 px-4 h-11 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent transition"
                    placeholder="Message to send with the event"
                    aria-label="Message to dispatch with mesh.ping"
                />
                <button
                    type="button"
                    onClick={handlePing}
                    className="shrink-0 px-5 h-11 rounded-xl bg-gradient-to-br from-rose-500 to-orange-500 text-white text-sm font-semibold hover:from-rose-600 hover:to-orange-600 active:scale-95 transition-all duration-150 shadow-lg shadow-rose-500/25 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:ring-offset-2 focus:ring-offset-slate-900"
                >
                    Dispatch mesh.ping
                </button>
            </div>
            <p className="mt-2 text-xs text-slate-500">
                <code className="text-rose-300">wire.$dispatch("mesh.ping", {"{ message }"})</code> — the plain Livewire toast on
                the right catches it.
            </p>

            <div className="my-4 border-t border-white/10" />

            {/* Inbound: page.ping -> PHP #[On] -> props() -> this render */}
            <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
                    <span className="text-2xl font-bold tabular-nums text-cyan-400">{received}</span>
                </div>
                <div>
                    <p className="text-sm font-medium text-white">
                        {received === 1 ? "page.ping received" : "page.pings received"}
                    </p>
                    <p className="mt-0.5 text-xs text-slate-500 leading-relaxed">
                        Caught server-side by <code className="text-cyan-300">#[On('page.ping')]</code>, returned through{" "}
                        <code className="text-cyan-300">props()</code> — React just renders the prop.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default EventBridge;
