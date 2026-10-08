<script lang="ts">
    import { useWire } from "@mesh/svelte";
    import { Button, Panel, Textarea, cn } from "@/components/ui";
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

    // The return array's keys, exactly as PHP sends them.
    const returned = $derived<[string, string | number | undefined][]>([
        ["words", analysis?.words],
        ["characters", analysis?.characters],
        [
            "longestWord",
            analysis
                ? analysis.longestWord
                    ? `"${analysis.longestWord}"`
                    : '""'
                : undefined,
        ],
        ["analyzedAt", analysis?.analyzedAt],
    ]);
</script>

<div class="grid grid-cols-1 gap-4 lg:grid-cols-2">
    <Panel class="flex flex-col">
        <p class="k k--caps text-ink-3">Analyze text</p>
        <p class="mt-0.5 font-mono text-xs text-ink">
            await wire.$call("analyze", text)
        </p>

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

        <div class="mt-5">
            <p class="k k--caps text-ink-3">Returned by analyze()</p>
            <dl
                class={cn(
                    "core-readout mt-1 transition-opacity duration-150 motion-reduce:transition-none",
                    analyzing && "opacity-50",
                )}
                aria-live="polite"
            >
                {#each returned as [key, value] (key)}
                    <div>
                        <dt>{key}</dt>
                        <dd>
                            {#if value === undefined}
                                <span class="text-ink-3">—</span>
                            {:else}
                                {value}
                            {/if}
                        </dd>
                    </div>
                {/each}
            </dl>
        </div>
    </Panel>

    <Panel class="flex flex-col">
        <p class="k k--caps text-ink-3">Roll dice</p>
        <p class="mt-0.5 font-mono text-xs text-ink">
            await wire.$call("rollDice")
        </p>

        <div class="flex flex-1 flex-col items-center justify-center py-8">
            <div class="inline-flex flex-col gap-3">
                <div
                    class={cn(
                        "flex items-center gap-3 transition-opacity duration-150 motion-reduce:transition-none",
                        rolling && "opacity-40",
                    )}
                >
                    {#if roll}
                        {#each roll.dice as value, i (i)}
                            <Die {value} />
                        {/each}
                    {:else}
                        {#each [0, 1, 2] as i (i)}
                            <span
                                class="size-14 border border-dashed border-line-3"
                                aria-hidden="true"
                            ></span>
                        {/each}
                    {/if}
                </div>
                <!-- Dimension line under the three dice: their total. -->
                <div class="core-dim" aria-live="polite">
                    <span>
                        total <span class="font-medium text-ink">{roll ? roll.total : "—"}</span>
                    </span>
                </div>
            </div>
            <p class="mt-5 max-w-xs text-center text-xs leading-relaxed text-ink-3">
                PHP's <code class="core-code">random_int()</code> rolls the
                dice. The array comes back as the resolved Promise.
            </p>
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
