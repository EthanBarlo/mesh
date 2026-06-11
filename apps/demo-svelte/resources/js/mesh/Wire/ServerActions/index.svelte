<script lang="ts">
    import { useWire } from "@mesh/svelte";
    import { Button, Eyebrow, Panel, Stat, Textarea } from "@/components/ui";
    import Die from "@/components/demo/Wire/Die.svelte";

    interface ServerActionsProps {
        placeholder: string;
    }

    interface DiceResult {
        dice: number[];
        total: number;
    }

    interface AnalysisResult {
        words: number;
        characters: number;
        longestWord: string;
        analyzedAt: string;
    }

    let { placeholder }: ServerActionsProps = $props();

    const wire = useWire();

    let text = $state("");
    let analyzing = $state(false);
    let analysis = $state<AnalysisResult | null>(null);

    let rolling = $state(false);
    let roll = $state<DiceResult | null>(null);

    const handleAnalyze = async () => {
        if (analyzing || text.trim() === "") return;
        analyzing = true;
        try {
            // A real round-trip: the string is taken apart by PHP, not JS.
            const result = (await wire.$call("analyze", text)) as AnalysisResult;
            analysis = result;
        } finally {
            analyzing = false;
        }
    };

    const handleRoll = async () => {
        if (rolling) return;
        rolling = true;
        try {
            const result = (await wire.$call("rollDice")) as DiceResult;
            roll = result;
        } finally {
            rolling = false;
        }
    };
</script>

<div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
    <Panel class="flex flex-col">
        <Eyebrow>await wire.$call("analyze", text)</Eyebrow>

        <Textarea
            bind:value={text}
            {placeholder}
            rows={3}
            class="mt-3 resize-none"
            aria-label="Text to analyze on the server"
        />

        <Button
            disabled={text.trim() === ""}
            loading={analyzing}
            class="mt-3 self-start"
            onclick={handleAnalyze}
        >
            {analyzing ? "Analyzing on server…" : "Analyze on server"}
        </Button>

        {#if analysis}
            <div class="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-2">
                <Stat label="Words" value={analysis.words} />
                <Stat label="Characters" value={analysis.characters} />
                <Stat label="Longest word" value={analysis.longestWord || "—"} />
                <Stat label="Server time" value={analysis.analyzedAt} />
            </div>
        {:else}
            <p class="mt-4 text-sm text-zinc-500">
                The result object below is the PHP method's return value — no route, no controller, no fetch.
            </p>
        {/if}
    </Panel>

    <Panel class="flex flex-col">
        <Eyebrow>await wire.$call("rollDice")</Eyebrow>

        <div class="flex-1 flex flex-col items-center justify-center py-6">
            {#if roll}
                <div class={`flex items-center gap-3 transition-opacity ${rolling ? "opacity-40" : "opacity-100"}`}>
                    {#each roll.dice as value, i (i)}
                        <Die {value} />
                    {/each}
                </div>
                <p class="mt-4 text-sm text-zinc-400">
                    Server total:
                    <span class="text-xl font-semibold text-white tabular-nums align-middle">{roll.total}</span>
                </p>
            {:else}
                <p class="text-sm text-zinc-500 text-center max-w-xs">
                    PHP's <code class="font-mono text-zinc-400">random_int()</code> rolls the dice — the array comes back as a
                    resolved Promise.
                </p>
            {/if}
        </div>

        <Button
            variant="secondary"
            loading={rolling}
            class="self-center"
            onclick={handleRoll}
        >
            {rolling ? "Rolling…" : "Roll dice"}
        </Button>
    </Panel>
</div>
