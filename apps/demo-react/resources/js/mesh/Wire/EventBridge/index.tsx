import React, { useState } from "react";
import { useWire } from "@mesh/react";
import { Button, Input, Panel } from "@/components/ui";

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
            {/* Outbound: React -> Livewire event bus */}
            <div className="flex items-baseline justify-between gap-3">
                <p className="k k--caps text-ink-3">
                    Sends <span className="normal-case text-ink">mesh.ping</span>
                </p>
                <span className="k tabular-nums text-ink-3">
                    {sent} dispatched
                </span>
            </div>

            <div className="mt-3 flex flex-col gap-2 sm:flex-row">
                <Input
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handlePing()}
                    className="min-w-0 flex-1"
                    placeholder="Message to send with the event"
                    aria-label="Message to dispatch with mesh.ping"
                />
                <Button onClick={handlePing} className="shrink-0">
                    Dispatch mesh.ping
                </Button>
            </div>
            <p className="mt-2 text-xs leading-relaxed text-ink-3">
                <code className="core-code">
                    wire.$dispatch("mesh.ping", {"{ message }"})
                </code>{" "}
                The plain Livewire listener catches it.
            </p>

            <hr className="my-5 border-t border-dashed border-line-2" />

            {/* Inbound: page.ping -> PHP #[On] -> props() -> this render */}
            <p className="k k--caps text-ink-3">
                Receives <span className="normal-case text-ink">page.ping</span>
            </p>
            <div className="mt-3 flex items-center gap-4">
                <span className="core-count" aria-live="polite">
                    {received}
                </span>
                <div className="min-w-0">
                    <p className="text-sm font-medium text-ink">
                        {received === 1 ? "page.ping received" : "page.pings received"}
                    </p>
                    <p className="mt-0.5 text-xs leading-relaxed text-ink-3">
                        Caught in PHP by{" "}
                        <code className="core-code whitespace-nowrap">#[On('page.ping')]</code>{" "}
                        and returned through{" "}
                        <code className="core-code">props()</code>. React only
                        renders the prop.
                    </p>
                </div>
            </div>
        </Panel>
    );
};

export default EventBridge;
