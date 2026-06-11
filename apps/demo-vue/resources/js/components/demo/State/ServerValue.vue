<script setup lang="ts">
defineProps<{
    /** The value the server currently holds for the entangled property. */
    value: string;
    /** Whether the server value matches the local Vue state. */
    synced: boolean;
}>();
</script>

<!-- Sync-status line showing whether the server has caught up with local state. -->
<template>
    <p class="flex items-baseline gap-2 text-xs">
        <span
            class="shrink-0 font-semibold uppercase tracking-wider"
            :class="synced ? 'text-emerald-400' : 'text-amber-400'"
        >
            {{ synced ? "Server in sync" : "Server behind" }}
        </span>
        <span class="truncate text-zinc-500">
            server has:
            <span class="font-mono text-zinc-300">{{
                value === "" ? "(empty)" : `"${value}"`
            }}</span>
        </span>
    </p>
</template>
