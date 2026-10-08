<script lang="ts">
    import { BigNumber, Eyebrow, Panel } from "@/components/ui";

    /**
     * A deliberately tiny component. Its only job is to prove it just mounted:
     * the ticker starts at 0.0s the moment the chunk arrives and the component
     * renders for the first time.
     */
    interface Props {
        greeting: string;
        chunkNote: string;
    }

    let { greeting, chunkNote }: Props = $props();

    const mountedAt = Date.now();
    let elapsed = $state(0);

    $effect(() => {
        const intervalId = window.setInterval(() => {
            elapsed = (Date.now() - mountedAt) / 1000;
        }, 100);

        return () => {
            window.clearInterval(intervalId);
        };
    });
</script>

<Panel class="flex flex-col gap-5 sm:flex-row sm:items-center">
    <div class="min-w-0 flex-1">
        <Eyebrow>Architecture/HelloIsland</Eyebrow>
        <h3 class="mt-1.5 text-xl font-semibold tracking-tight text-ink">{greeting}</h3>
        <p class="mt-1 text-sm leading-relaxed text-ink-2">{chunkNote}</p>
    </div>

    <!-- The ticker is the island's one accent: proof it just mounted. -->
    <div
        class="shrink-0 border-t border-line-2 pt-4 sm:border-t-0 sm:border-l sm:pt-0 sm:pl-6 sm:text-right"
    >
        <BigNumber class="text-3xl text-accent-ink">{elapsed.toFixed(1)}s</BigNumber>
        <div class="k k--caps mt-1 text-ink-3">Since mount</div>
    </div>
</Panel>
