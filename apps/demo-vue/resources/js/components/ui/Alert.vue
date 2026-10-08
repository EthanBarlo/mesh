<script lang="ts">
type Tone = "error" | "success" | "info";

const tones: Record<
    Tone,
    { panel: string; mark: string; label: string; text: string }
> = {
    error: {
        panel: "border-l-danger bg-danger-wash",
        mark: "text-danger",
        label: "text-danger",
        text: "Error",
    },
    success: {
        panel: "border-l-ink bg-paper",
        mark: "text-ink",
        label: "text-ink-3",
        text: "Done",
    },
    info: {
        panel: "border-l-blueline bg-paper",
        mark: "text-blueline",
        label: "text-ink-3",
        text: "Note",
    },
};
</script>

<script setup lang="ts">
import { computed, useAttrs, useSlots } from "vue";
import { cn } from "./cn";

defineOptions({ inheritAttrs: false });

const props = withDefaults(
    defineProps<{
        tone?: Tone;
        /** Plain-text title. Use the #title slot for rich content. */
        title?: string;
        /** The mono label before the title. Defaults to Error / Done / Note. Also a #label slot. */
        label?: string;
    }>(),
    { tone: "error" },
);

const slots = useSlots();
const attrs = useAttrs();
const attrsRest = computed(() => {
    const { class: _, ...rest } = attrs;
    return rest;
});

const t = computed(() => tones[props.tone]);
</script>

<!-- A note on the sheet: a drawn mark, a mono label and title, then the body. -->
<template>
    <div
        v-bind="attrsRest"
        :role="tone === 'error' ? 'alert' : 'status'"
        :class="
            cn(
                'grid grid-cols-[auto_minmax(0,1fr)] items-start gap-x-3.5 border border-l-2 border-line-2 py-3.5 pr-4 pl-3.5',
                slots.action && 'sm:grid-cols-[auto_minmax(0,1fr)_auto]',
                t.panel,
                attrs.class as string,
            )
        "
    >
        <span :class="cn('flex pt-px', t.mark)">
            <!-- Replaces the drawn mark. Usually best left out. -->
            <slot name="icon">
                <!-- The drawn marks, after the docs callouts: triangle, circle, box. -->
                <svg
                    v-if="tone === 'error'"
                    viewBox="0 0 28 26"
                    width="22"
                    height="20"
                    aria-hidden="true"
                >
                    <path d="M14 2 26 24H2Z" fill="none" stroke="currentColor" stroke-width="1.25" />
                    <path d="M14 10v7" stroke="currentColor" stroke-width="1.5" />
                    <circle cx="14" cy="20.25" r="1.1" fill="currentColor" />
                </svg>
                <svg
                    v-else-if="tone === 'success'"
                    viewBox="0 0 22 22"
                    width="20"
                    height="20"
                    aria-hidden="true"
                >
                    <circle cx="11" cy="11" r="9.5" fill="none" stroke="currentColor" stroke-width="1.25" />
                    <path d="m6.75 11.25 2.9 2.9 5.6-5.9" fill="none" stroke="currentColor" stroke-width="1.5" />
                </svg>
                <svg v-else viewBox="0 0 22 22" width="20" height="20" aria-hidden="true">
                    <rect x="1.5" y="1.5" width="19" height="19" fill="none" stroke="currentColor" stroke-width="1.25" />
                    <path d="M11 9.5v7" stroke="currentColor" stroke-width="1.5" />
                    <circle cx="11" cy="6.25" r="1.1" fill="currentColor" />
                </svg>
            </slot>
        </span>
        <div class="min-w-0">
            <p class="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                <span
                    :class="
                        cn(
                            'font-mono text-[0.6875rem] uppercase tracking-[0.1em]',
                            t.label,
                        )
                    "
                >
                    <slot name="label">{{ label ?? t.text }}</slot>
                </span>
                <span class="text-sm font-semibold tracking-[-0.005em] text-ink">
                    <slot name="title">{{ title }}</slot>
                </span>
            </p>
            <div v-if="slots.default" class="mt-1 text-sm leading-relaxed text-ink-2">
                <slot />
            </div>
        </div>
        <!-- Rendered on the trailing edge, e.g. a retry button. -->
        <div
            v-if="slots.action"
            class="col-start-2 mt-3 sm:col-start-3 sm:row-start-1 sm:mt-0 sm:self-center"
        >
            <slot name="action" />
        </div>
    </div>
</template>
