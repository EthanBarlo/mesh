<script lang="ts">
    import { useEntangle, useWire } from "@mesh/svelte";
    import { BigNumber, Button, Input, Panel } from "@/components/ui";
    import ServerValue from "@/components/demo/State/ServerValue.svelte";

    interface Props {
        requests: number;
        serverMessage: string;
        serverLiveMessage: string;
    }

    let { requests, serverMessage, serverLiveMessage }: Props = $props();

    const message = useEntangle<string>("message");
    const liveMessage = useEntangle<string>("liveMessage", true);
    const wire = useWire();

    const handleFlush = () => {
        // Pushes any deferred (dirty) properties to the server right now.
        wire.$commit();
    };

    const messageSynced = $derived(serverMessage === (message.value ?? ""));
    const liveMessageSynced = $derived(
        serverLiveMessage === (liveMessage.value ?? ""),
    );
</script>

<div class="space-y-6">
    <div class="grid gap-4 sm:grid-cols-2">
        <!-- Deferred input -->
        <Panel>
            <label
                for="entangle-deferred"
                class="block text-sm font-semibold text-white"
            >
                Deferred
            </label>
            <p class="mt-0.5 mb-3 font-mono text-xs text-zinc-500">
                useEntangle("message")
            </p>
            <Input
                id="entangle-deferred"
                bind:value={message.value}
                placeholder="Type — nothing is sent yet"
                class="px-4 py-3 text-base"
            />
            <ServerValue
                class="mt-2"
                value={serverMessage}
                synced={messageSynced}
            />
        </Panel>

        <!-- Live input -->
        <Panel>
            <label
                for="entangle-live"
                class="block text-sm font-semibold text-white"
            >
                Live
            </label>
            <p class="mt-0.5 mb-3 font-mono text-xs text-zinc-500">
                useEntangle("liveMessage", true)
            </p>
            <Input
                id="entangle-live"
                bind:value={liveMessage.value}
                placeholder="Type — every keystroke syncs"
                class="px-4 py-3 text-base"
            />
            <ServerValue
                class="mt-2"
                value={serverLiveMessage}
                synced={liveMessageSynced}
            />
        </Panel>
    </div>

    <!-- Round-trip panel -->
    <Panel class="flex flex-col sm:flex-row sm:items-center gap-4">
        <div class="flex items-center gap-4 grow">
            <BigNumber class="text-5xl">{requests}</BigNumber>
            <div>
                <p class="text-sm font-semibold text-white">
                    Server round-trips
                </p>
                <p class="text-xs text-zinc-500 leading-relaxed max-w-sm">
                    Counted in the component's Livewire
                    <code class="font-mono text-zinc-300">updated()</code>
                    hooks — only requests that actually delivered a property
                    change increment it.
                </p>
            </div>
        </div>
        <Button
            class="shrink-0"
            aria-label="Flush deferred changes to the server now"
            onclick={handleFlush}
        >
            Flush deferred now
        </Button>
    </Panel>
</div>
