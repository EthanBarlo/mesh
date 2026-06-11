<script setup lang="ts">
defineProps<{
    label: string;
    htmlFor?: string;
    /** Error bag entry for this field — the first message is shown. */
    error?: string[] | null;
    hint?: string;
}>();
</script>

<!-- Label + control + first validation message, in the demo's form rhythm. -->
<template>
    <div>
        <div class="flex items-baseline justify-between mb-1.5">
            <label
                :for="htmlFor"
                class="block text-sm font-medium text-zinc-300"
            >
                {{ label }}
            </label>
            <!-- Small annotation rendered to the right of the label. -->
            <slot name="corner" />
        </div>
        <slot />
        <p
            v-if="error && error.length > 0"
            class="mt-1.5 text-xs text-rose-400"
            role="alert"
        >
            {{ error[0] }}
        </p>
        <p v-if="hint" class="mt-1.5 text-xs text-zinc-500">{{ hint }}</p>
    </div>
</template>
