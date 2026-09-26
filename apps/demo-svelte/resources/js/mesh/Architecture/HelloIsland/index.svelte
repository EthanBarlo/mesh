<script lang="ts">
    import { BigNumber, Eyebrow, GlowCard } from "@/components/ui";

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

<GlowCard contentClassName="p-6 flex flex-col sm:flex-row sm:items-center gap-5">
    <div class="flex-1">
        <Eyebrow>Architecture/HelloIsland</Eyebrow>
        <h3 class="mt-1 text-xl font-semibold tracking-tight text-white">{greeting}</h3>
        <p class="mt-1 text-sm text-zinc-400 leading-relaxed">{chunkNote}</p>
    </div>

    <div class="shrink-0 px-5 py-4 rounded-xl bg-white/[0.02] border border-white/5 text-center">
        <BigNumber class="text-3xl">{elapsed.toFixed(1)}s</BigNumber>
        <div class="mt-1 text-[11px] font-medium uppercase tracking-widest text-zinc-500">
            since mount
        </div>
    </div>
</GlowCard>
