<script setup lang="ts">
import { useAttrs } from "vue";
import { Input, cn } from "@/components/ui";

defineOptions({ inheritAttrs: false });

/** Search input with a drawn magnifier, for client-side table filtering. */
defineProps<{
    placeholder?: string;
    ariaLabel?: string;
}>();

const model = defineModel<string>({ default: "" });

const attrs = useAttrs();
</script>

<template>
    <div :class="cn('relative w-full sm:w-64', attrs.class as string)">
        <svg
            class="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-ink-3 pointer-events-none"
            viewBox="0 0 16 16"
            fill="none"
            stroke="currentColor"
            stroke-width="1.25"
            aria-hidden="true"
        >
            <circle cx="6.5" cy="6.5" r="5" />
            <path d="M10.25 10.25L15 15" />
        </svg>
        <Input
            v-model="model"
            :placeholder="placeholder"
            :aria-label="ariaLabel"
            class="w-full pl-9 pr-3"
        />
    </div>
</template>
