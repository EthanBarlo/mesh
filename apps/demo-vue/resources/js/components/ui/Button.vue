<script lang="ts">
type Variant = "primary" | "accent" | "secondary" | "ghost";
type Size = "xs" | "sm" | "md" | "icon";

export interface ButtonProps {
    variant?: Variant;
    size?: Size;
    /** Shows a spinner and disables the button. */
    loading?: boolean;
    disabled?: boolean;
    type?: "button" | "submit" | "reset";
}

const variants: Record<Variant, string> = {
    primary:
        "bg-white text-zinc-950 font-medium hover:bg-zinc-200 focus:ring-white/40",
    accent: "bg-white/10 text-white font-medium hover:bg-white/15 focus:ring-white/20",
    secondary:
        "border border-white/10 text-zinc-400 font-medium hover:text-white hover:border-white/20 focus:ring-white/20",
    ghost: "text-zinc-500 font-medium hover:text-white focus:ring-white/20",
};

const sizes: Record<Size, string> = {
    xs: "px-3.5 py-1.5 text-sm rounded-lg",
    sm: "px-4 h-10 text-sm rounded-lg",
    md: "px-5 h-11 text-sm rounded-lg",
    icon: "w-14 h-14 text-2xl rounded-lg",
};
</script>

<script setup lang="ts">
import { computed, useAttrs } from "vue";
import { cn } from "./cn";
import Spinner from "./Spinner.vue";

defineOptions({ inheritAttrs: false });

withDefaults(defineProps<ButtonProps>(), {
    variant: "primary",
    size: "md",
    loading: false,
    disabled: false,
    type: "button",
});

const attrs = useAttrs();
const attrsRest = computed(() => {
    const { class: _, ...rest } = attrs;
    return rest;
});
</script>

<template>
    <button
        v-bind="attrsRest"
        :type="type"
        :disabled="disabled || loading"
        :class="
            cn(
                'inline-flex items-center justify-center gap-2 transition-colors duration-150 active:scale-95 disabled:opacity-50 disabled:pointer-events-none focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-zinc-950',
                variants[variant],
                sizes[size],
                attrs.class as string,
            )
        "
    >
        <Spinner v-if="loading" />
        <slot />
    </button>
</template>
