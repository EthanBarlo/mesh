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
        <div className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2">
                {/* Deferred input */}
                <Panel>
                    <label
                        htmlFor="entangle-deferred"
                        className="block text-sm font-semibold text-white"
                    >
                        Deferred
                    </label>
                    <p className="mt-0.5 mb-3 font-mono text-xs text-cyan-300/80">
                        useEntangle("message")
                    </p>
                    <Input
                        id="entangle-deferred"
                        value={message ?? ""}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Type — nothing is sent yet"
                        className="bg-slate-800/80 px-4 py-3 text-base focus:border-white/10 focus:ring-cyan-500"
                    />
                    <ServerValue
                        className="mt-2"
                        value={serverMessage}
                        synced={serverMessage === (message ?? "")}
                    />
                </Panel>

                {/* Live input */}
                <Panel>
                    <label
                        htmlFor="entangle-live"
                        className="block text-sm font-semibold text-white"
                    >
                        Live
                    </label>
                    <p className="mt-0.5 mb-3 font-mono text-xs text-rose-300/80">
                        useEntangle("liveMessage", true)
                    </p>
                    <Input
                        id="entangle-live"
                        value={liveMessage ?? ""}
                        onChange={(e) => setLiveMessage(e.target.value)}
                        placeholder="Type — every keystroke syncs"
                        className="bg-slate-800/80 px-4 py-3 text-base focus:border-white/10 focus:ring-rose-500"
                    />
                    <ServerValue
                        className="mt-2"
                        value={serverLiveMessage}
                        synced={serverLiveMessage === (liveMessage ?? "")}
                    />
                </Panel>
            </div>

            {/* Round-trip panel */}
            <Panel className="flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="flex items-center gap-4 grow">
                    <BigNumber className="text-5xl">{requests}</BigNumber>
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
                <Button
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
