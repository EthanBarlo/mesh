<script setup lang="ts">
import { ref, watch } from "vue";

const props = withDefaults(
    defineProps<{
        /** The value the server currently holds for the entangled property. */
        value: string;
        /** Whether the server value matches the local Vue state. */
        synced: boolean;
        /** How the value travels: deferred (dashed wire) or live (the accent wire). */
        mode?: "deferred" | "live";
        /** The PHP property name, shown on the server readout, e.g. "$message". */
        property?: string;
    }>(),
    { mode: "deferred" },
);

// Count server-side changes. The count keys the packet, restarting its
// animation on every delivery.
const deliveries = ref(0);
watch(
    () => props.value,
    () => {
        deliveries.value += 1;
    },
);
</script>

<!--
    The wire from local Vue state down to the server, and the server's copy
    of the value. A packet drops down the wire each time the server value
    changes, so you can see exactly when a request delivered it.
-->
<template>
    <div>
        <div class="core-wire" :data-line="mode === 'live' ? 'accent' : 'dash'">
            <span
                v-if="deliveries > 0"
                :key="deliveries"
                class="core-wire__packet"
                aria-hidden="true"
            />
            {{ mode === "live" ? "sent on every keystroke" : "sent with the next request" }}
        </div>

        <div class="border border-line-2 bg-paper-2 px-3 py-2.5">
            <div class="flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
                <span class="k k--caps text-ink-3">
                    Server<span v-if="property" class="normal-case"> · {{ property }}</span>
                </span>
                <span :class="['core-status', !synced && 'core-status--ink']">
                    <span
                        class="core-dot"
                        :data-state="synced ? 'on' : 'wait'"
                        aria-hidden="true"
                    />
                    {{ synced ? "In sync" : "Behind" }}
                </span>
            </div>
            <p class="mt-1 truncate font-mono text-sm text-ink">
                <span v-if="value === ''" class="text-ink-3">(empty)</span>
                <template v-else>"{{ value }}"</template>
            </p>
        </div>
    </div>
</template>
