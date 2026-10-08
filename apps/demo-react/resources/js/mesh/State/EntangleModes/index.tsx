import React from "react";
import { useEntangle, useWire } from "@mesh/react";
import { BigNumber, Button, Input, Panel } from "@/components/ui";
import ServerValue from "@/components/demo/State/ServerValue";

interface EntangleModesProps {
    requests: number;
    serverMessage: string;
    serverLiveMessage: string;
}

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
        <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
                {/* Deferred input */}
                <Panel>
                    <div className="flex items-baseline justify-between gap-3">
                        <label
                            htmlFor="entangle-deferred"
                            className="text-sm font-semibold text-ink"
                        >
                            Deferred
                        </label>
                        <span className="k k--caps text-ink-3">Default</span>
                    </div>
                    <p className="mt-0.5 mb-3 font-mono text-xs text-ink-3">
                        useEntangle("message")
                    </p>
                    <Input
                        id="entangle-deferred"
                        value={message ?? ""}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Type a message"
                    />
                    <ServerValue
                        mode="deferred"
                        property="$message"
                        value={serverMessage}
                        synced={serverMessage === (message ?? "")}
                    />
                </Panel>

                {/* Live input */}
                <Panel>
                    <div className="flex items-baseline justify-between gap-3">
                        <label
                            htmlFor="entangle-live"
                            className="text-sm font-semibold text-ink"
                        >
                            Live
                        </label>
                        <span className="k k--caps text-ink-3">
                            Per keystroke
                        </span>
                    </div>
                    <p className="mt-0.5 mb-3 font-mono text-xs text-ink-3">
                        useEntangle("liveMessage", true)
                    </p>
                    <Input
                        id="entangle-live"
                        value={liveMessage ?? ""}
                        onChange={(e) => setLiveMessage(e.target.value)}
                        placeholder="Type a message"
                    />
                    <ServerValue
                        mode="live"
                        property="$liveMessage"
                        value={serverLiveMessage}
                        synced={serverLiveMessage === (liveMessage ?? "")}
                    />
                </Panel>
            </div>

            {/* Round-trip counter */}
            <Panel className="flex flex-col gap-4 sm:flex-row sm:items-center">
                <div className="flex grow items-center gap-5">
                    <div className="shrink-0">
                        <p className="k k--caps text-ink-3">Round-trips</p>
                        <BigNumber className="mt-1 block text-5xl leading-none">
                            {String(requests).padStart(2, "0")}
                        </BigNumber>
                    </div>
                    <p className="max-w-sm border-l border-line-2 pl-5 text-xs leading-relaxed text-ink-3">
                        Counted in the component's Livewire{" "}
                        <code className="core-code">updated()</code> hooks.
                        Only requests that delivered a property change count.
                    </p>
                </div>
                <Button
                    variant="secondary"
                    onClick={handleFlush}
                    className="shrink-0"
                    aria-label="Flush deferred changes to the server now"
                >
                    Flush deferred now
                </Button>
            </Panel>
        </div>
    );
};

export default EntangleModes;
