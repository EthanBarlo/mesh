<script module lang="ts">
    export interface Swatch {
        name: string;
        hex: string;
    }

    export interface Palette {
        label: string;
        accent: string;
        swatches: Swatch[];
    }
</script>

<script lang="ts">
    import type { HTMLAttributes } from "svelte/elements";
    import { cn } from "@/components/ui";

    interface Props extends HTMLAttributes<HTMLDivElement> {
        theme: string;
        palette: Palette;
    }

    let { theme, palette, class: className, ...rest }: Props = $props();
</script>

<!--
    Header chip + title + swatch schedule for a server-computed palette prop.
    The swatch colours are data from props(), so they stay real hex values.
-->
<div {...rest} class={cn(className)}>
    <p class="k k--caps text-ink-3">Server props</p>
    <div class="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1">
        <span
            class="size-3 shrink-0 border border-line-3"
            style:background-color={palette.accent}
            aria-hidden="true"
        ></span>
        <h3 class="text-sm font-semibold text-ink">
            {palette.label} palette
        </h3>
        <code class="font-mono text-xs text-ink-3">
            theme = "{theme}"
        </code>
    </div>
    <p class="mt-1 text-xs leading-relaxed text-ink-3">
        Computed in <code class="core-code">props()</code> on the server and
        delivered as a prop on every render.
    </p>
    <ul class="mt-4 flex flex-wrap gap-3">
        {#each palette.swatches as swatch (swatch.name)}
            <li class="w-14">
                <div
                    class="size-14 border border-line-3"
                    style:background-color={swatch.hex}
                    role="img"
                    aria-label={`${palette.label} ${swatch.name}: ${swatch.hex}`}
                ></div>
                <span
                    class="mt-1.5 block font-mono text-[11px] leading-tight text-ink-2 tabular-nums"
                >
                    {swatch.name}
                </span>
                <span class="block font-mono text-[10px] leading-tight text-ink-3">
                    {swatch.hex}
                </span>
            </li>
        {/each}
    </ul>
</div>
