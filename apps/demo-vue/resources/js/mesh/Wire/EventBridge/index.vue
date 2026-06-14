<script setup lang="ts">
import { ref } from "vue";
import { useWire } from "@mesh/vue";
import { Button, Eyebrow, Input, Panel } from "@/components/ui";

interface EventBridgeProps {
    /** Count of page.ping events handled by the PHP class, fed back via props(). */
    received: number;
}

defineProps<EventBridgeProps>();

const wire = useWire();

const message = ref("Hello from Vue");
const sent = ref(0);

const handlePing = () => {
    // Straight onto Livewire's event bus — any component with
    // #[On('mesh.ping')] hears this, Vue or not.
    wire.$dispatch("mesh.ping", { message: message.value });
    sent.value += 1;
};
</script>

<template>
    <Panel>
        <div class="flex items-center justify-between gap-3">
            <Eyebrow>Vue island · EventBridge</Eyebrow>
            <span v-if="sent > 0" class="text-xs font-medium text-rose-400 tabular-nums">
                {{ sent }} dispatched
            </span>
        </div>

        <!-- Outbound: Vue -> Livewire event bus -->
        <div class="mt-4 flex flex-col sm:flex-row gap-2">
            <Input
                v-model="message"
                class="flex-1 min-w-0 h-11 py-0"
                placeholder="Message to send with the event"
                aria-label="Message to dispatch with mesh.ping"
                @keydown.enter="handlePing"
            />
            <Button class="shrink-0" @click="handlePing">
                Dispatch mesh.ping
            </Button>
        </div>
        <p class="mt-2 text-xs text-zinc-500">
            <code class="font-mono text-zinc-400">wire.$dispatch("mesh.ping", { message })</code> — the plain Livewire toast on
            the right catches it.
        </p>

        <div class="my-4 border-t border-white/10" />

        <!-- Inbound: page.ping -> PHP #[On] -> props() -> this render -->
        <div class="flex items-center gap-4">
            <div class="w-14 h-14 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
                <span class="text-2xl font-semibold tabular-nums text-white">{{ received }}</span>
            </div>
            <div>
                <p class="text-sm font-medium text-white">
                    {{ received === 1 ? "page.ping received" : "page.pings received" }}
                </p>
                <p class="mt-0.5 text-xs text-zinc-500 leading-relaxed">
                    Caught server-side by <code class="font-mono text-zinc-400">#[On('page.ping')]</code>, returned through
                    <code class="font-mono text-zinc-400">props()</code> — Vue just renders the prop.
                </p>
            </div>
        </div>
    </Panel>
</template>
