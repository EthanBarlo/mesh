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

<div class="space-y-4">
    <div class="grid gap-4 sm:grid-cols-2">
        <!-- Deferred input -->
        <Panel>
            <div class="flex items-baseline justify-between gap-3">
                <label
                    for="entangle-deferred"
                    class="text-sm font-semibold text-ink"
                >
                    Deferred
                </label>
                <span class="k k--caps text-ink-3">Default</span>
            </div>
            <p class="mt-0.5 mb-3 font-mono text-xs text-ink-3">
                useEntangle("message")
            </p>
            <Input
                id="entangle-deferred"
                bind:value={message.value}
                placeholder="Type a message"
            />
            <ServerValue
                mode="deferred"
                property="$message"
                value={serverMessage}
                synced={messageSynced}
            />
        </Panel>

        <!-- Live input -->
        <Panel>
            <div class="flex items-baseline justify-between gap-3">
                <label
                    for="entangle-live"
                    class="text-sm font-semibold text-ink"
                >
                    Live
                </label>
                <span class="k k--caps text-ink-3">Per keystroke</span>
            </div>
            <p class="mt-0.5 mb-3 font-mono text-xs text-ink-3">
                useEntangle("liveMessage", true)
            </p>
            <Input
                id="entangle-live"
                bind:value={liveMessage.value}
                placeholder="Type a message"
            />
            <ServerValue
                mode="live"
                property="$liveMessage"
                value={serverLiveMessage}
                synced={liveMessageSynced}
            />
        </Panel>
    </div>

    <!-- Round-trip counter -->
    <Panel class="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div class="flex grow items-center gap-5">
            <div class="shrink-0">
                <p class="k k--caps text-ink-3">Round-trips</p>
                <BigNumber class="mt-1 block text-5xl leading-none">
                    {String(requests).padStart(2, "0")}
                </BigNumber>
            </div>
            <p
                class="max-w-sm border-l border-line-2 pl-5 text-xs leading-relaxed text-ink-3"
            >
                Counted in the component's Livewire
                <code class="core-code">updated()</code> hooks. Only requests
                that delivered a property change count.
            </p>
        </div>
        <Button
            variant="secondary"
            class="shrink-0"
            aria-label="Flush deferred changes to the server now"
            onclick={handleFlush}
        >
            Flush deferred now
        </Button>
    </Panel>
</div>
