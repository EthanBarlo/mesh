<script lang="ts">
    import type { SVGAttributes } from "svelte/elements";
    import { cn } from "./cn";

    interface Props extends SVGAttributes<SVGSVGElement> {}

    let { class: className, ...rest }: Props = $props();
</script>

<svg
    {...rest}
    class={cn("w-4 h-4 animate-spin", className)}
    viewBox="0 0 24 24"
    fill="none"
    aria-hidden="true"
>
    <circle
        class="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        stroke-width="4"
    />
    <path
        class="opacity-90"
        fill="currentColor"
        d="M12 2a10 10 0 0110 10h-4a6 6 0 00-6-6V2z"
    />
</svg>
