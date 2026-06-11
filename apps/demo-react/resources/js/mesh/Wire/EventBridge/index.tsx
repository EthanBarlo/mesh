import React, { useState } from "react";
import { useWire } from "@mesh/react";
import { Button, Eyebrow, Input, Panel } from "@/components/ui";

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
        <Panel>
            <div className="flex items-center justify-between gap-3">
                <Eyebrow>React island · EventBridge</Eyebrow>
                {sent > 0 && (
                    <span className="text-xs font-medium text-rose-400 tabular-nums">
                        {sent} dispatched
                    </span>
                )}
            </div>

            {/* Outbound: React -> Livewire event bus */}
            <div className="mt-4 flex flex-col sm:flex-row gap-2">
                <Input
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handlePing()}
                    className="flex-1 min-w-0 h-11 py-0 focus:ring-rose-500 focus:ring-offset-0 focus:border-transparent"
                    placeholder="Message to send with the event"
                    aria-label="Message to dispatch with mesh.ping"
                />
                <Button onClick={handlePing} className="shrink-0">
                    Dispatch mesh.ping
                </Button>
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
        </Panel>
    );
};

export default EventBridge;
