<script lang="ts">
    import type { SVGAttributes } from "svelte/elements";
    import { cn } from "./cn";

    interface Props extends SVGAttributes<SVGSVGElement> {}

    let { class: className, ...rest }: Props = $props();
</script>

<!--
    A line-drawn square with a short stroke tracing its edge. Inherits the
    text color; size it with `w-*`/`h-*`.
-->
<svg
    {...rest}
    class={cn("ui-spinner w-4 h-4 shrink-0", className)}
    viewBox="0 0 16 16"
    fill="none"
    aria-hidden="true"
>
    <rect
        x="1.5"
        y="1.5"
        width="13"
        height="13"
        stroke="currentColor"
        stroke-opacity="0.28"
    />
    <rect
        class="ui-spinner__run"
        x="1.5"
        y="1.5"
        width="13"
        height="13"
        stroke="currentColor"
        stroke-width="1.5"
        stroke-linecap="square"
        pathLength="100"
        stroke-dasharray="24 76"
    />
</svg>
