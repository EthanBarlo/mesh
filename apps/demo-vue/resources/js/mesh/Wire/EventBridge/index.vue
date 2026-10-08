<script setup lang="ts">
import { ref } from "vue";
import { useWire } from "@mesh/vue";
import { Button, Input, Panel } from "@/components/ui";

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
        <!-- Outbound: Vue -> Livewire event bus -->
        <div class="flex items-baseline justify-between gap-3">
            <p class="k k--caps text-ink-3">
                Sends <span class="normal-case text-ink">mesh.ping</span>
            </p>
            <span class="k tabular-nums text-ink-3">{{ sent }} dispatched</span>
        </div>

        <div class="mt-3 flex flex-col gap-2 sm:flex-row">
            <Input
                v-model="message"
                class="min-w-0 flex-1"
                placeholder="Message to send with the event"
                aria-label="Message to dispatch with mesh.ping"
                @keydown.enter="handlePing"
            />
            <Button class="shrink-0" @click="handlePing">
                Dispatch mesh.ping
            </Button>
        </div>
        <p class="mt-2 text-xs leading-relaxed text-ink-3">
            <code class="core-code">wire.$dispatch("mesh.ping", { message })</code>
            The plain Livewire listener catches it.
        </p>

        <hr class="my-5 border-t border-dashed border-line-2" />

        <!-- Inbound: page.ping -> PHP #[On] -> props() -> this render -->
        <p class="k k--caps text-ink-3">
            Receives <span class="normal-case text-ink">page.ping</span>
        </p>
        <div class="mt-3 flex items-center gap-4">
            <span class="core-count" aria-live="polite">{{ received }}</span>
            <div class="min-w-0">
                <p class="text-sm font-medium text-ink">
                    {{ received === 1 ? "page.ping received" : "page.pings received" }}
                </p>
                <p class="mt-0.5 text-xs leading-relaxed text-ink-3">
                    Caught in PHP by
                    <code class="core-code whitespace-nowrap">#[On('page.ping')]</code>
                    and returned through
                    <code class="core-code">props()</code>. Vue only
                    renders the prop.
                </p>
            </div>
        </div>
    </Panel>
</template>
