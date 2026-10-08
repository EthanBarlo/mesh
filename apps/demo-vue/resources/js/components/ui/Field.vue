<script setup lang="ts">
defineProps<{
    /** Plain-text label. Use the #label slot for rich content. */
    label?: string;
    htmlFor?: string;
    /** Error bag entry for this field — the first message is shown. */
    error?: string[] | null;
    hint?: string;
}>();
</script>

<!-- A mono label, the control, then the first validation message. -->
<template>
    <div>
        <div class="mb-1.5 flex items-baseline justify-between gap-3">
            <label
                :for="htmlFor"
                class="block font-mono text-[0.6875rem] uppercase leading-normal tracking-[0.1em] text-ink-2"
            >
                <slot name="label">{{ label }}</slot>
            </label>
            <!-- Small annotation rendered to the right of the label. -->
            <slot name="corner" />
        </div>
        <slot />
        <p
            v-if="error && error.length > 0"
            class="mt-1.5 flex items-start gap-1.5 text-xs leading-snug text-danger"
            role="alert"
        >
            <svg
                class="mt-[2px] size-2.5 shrink-0"
                viewBox="0 0 10 10"
                aria-hidden="true"
            >
                <path d="M5 .8 9.4 9.2H.6Z" fill="currentColor" />
            </svg>
            <span>{{ error[0] }}</span>
        </p>
        <p v-if="hint" class="mt-1.5 text-xs text-ink-3">{{ hint }}</p>
    </div>
</template>
