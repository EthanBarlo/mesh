<script lang="ts">
    import { Eyebrow, Panel } from "@/components/ui";
    import PaletteSwatches, {
        type Palette,
    } from "@/components/demo/State/PaletteSwatches.svelte";

    interface Props {
        theme: string;
        palette: Palette;
    }

    let { theme, palette }: Props = $props();

    // Plain local Svelte state — never touches the server.
    let seconds = $state(0);

    $effect(() => {
        const intervalId = window.setInterval(() => {
            seconds += 1;
        }, 1000);

        return () => {
            window.clearInterval(intervalId);
        };
    });
</script>

<Panel class="p-6">
    <div class="flex flex-col sm:flex-row sm:items-start gap-6">
        <!-- Server-computed palette prop -->
        <PaletteSwatches {theme} {palette} class="grow" />

        <!-- Local Svelte state that survives prop updates -->
        <div
            class="shrink-0 sm:w-56 p-4 rounded-xl bg-white/[0.02] border border-white/5 text-center"
        >
            <Eyebrow>Mounted for</Eyebrow>
            <p
                class="my-2 text-4xl font-semibold tracking-tight tabular-nums"
                style:color={palette.accent}
            >
                {seconds}s
            </p>
            <p class="text-xs text-zinc-500 leading-relaxed">
                Local state survives server re-renders — this component
                never remounts.
            </p>
        </div>
    </div>
</Panel>
