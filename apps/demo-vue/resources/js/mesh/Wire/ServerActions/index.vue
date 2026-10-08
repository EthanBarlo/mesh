<script setup lang="ts">
import { computed, ref } from "vue";
import { useWire } from "@mesh/vue";
import { Button, Panel, Textarea, cn } from "@/components/ui";
import Die from "@/components/demo/Wire/Die.vue";

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

defineProps<ServerActionsProps>();

const wire = useWire();

const text = ref("");
const analyzing = ref(false);
const analysis = ref<AnalysisResult | null>(null);

const rolling = ref(false);
const roll = ref<DiceResult | null>(null);

const handleAnalyze = async () => {
    if (analyzing.value || text.value.trim() === "") return;
    analyzing.value = true;
    try {
        // A real round-trip: the string is taken apart by PHP, not JS.
        const result = (await wire.$call("analyze", text.value)) as AnalysisResult;
        analysis.value = result;
    } finally {
        analyzing.value = false;
    }
};

const handleRoll = async () => {
    if (rolling.value) return;
    rolling.value = true;
    try {
        const result = (await wire.$call("rollDice")) as DiceResult;
        roll.value = result;
    } finally {
        rolling.value = false;
    }
};

// The return array's keys, exactly as PHP sends them.
const returned = computed<[string, string | number | undefined][]>(() => {
    const a = analysis.value;
    return [
        ["words", a?.words],
        ["characters", a?.characters],
        ["longestWord", a ? (a.longestWord ? `"${a.longestWord}"` : '""') : undefined],
        ["analyzedAt", a?.analyzedAt],
    ];
});
</script>

<template>
    <div class="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Panel class="flex flex-col">
            <p class="k k--caps text-ink-3">Analyze text</p>
            <p class="mt-0.5 font-mono text-xs text-ink">
                await wire.$call("analyze", text)
            </p>

            <Textarea
                v-model="text"
                :placeholder="placeholder"
                rows="3"
                class="mt-3 resize-none"
                aria-label="Text to analyze on the server"
            />

            <Button
                :disabled="text.trim() === ''"
                :loading="analyzing"
                class="mt-3 self-start"
                @click="handleAnalyze"
            >
                {{ analyzing ? "Analyzing on server…" : "Analyze on server" }}
            </Button>

            <div class="mt-5">
                <p class="k k--caps text-ink-3">Returned by analyze()</p>
                <dl
                    :class="
                        cn(
                            'core-readout mt-1 transition-opacity duration-150 motion-reduce:transition-none',
                            analyzing && 'opacity-50',
                        )
                    "
                    aria-live="polite"
                >
                    <div v-for="[key, value] in returned" :key="key">
                        <dt>{{ key }}</dt>
                        <dd>
                            <span v-if="value === undefined" class="text-ink-3">—</span>
                            <template v-else>{{ value }}</template>
                        </dd>
                    </div>
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
                        :class="
                            cn(
                                'flex items-center gap-3 transition-opacity duration-150 motion-reduce:transition-none',
                                rolling && 'opacity-40',
                            )
                        "
                    >
                        <template v-if="roll">
                            <Die v-for="(value, i) in roll.dice" :key="i" :value="value" />
                        </template>
                        <template v-else>
                            <span
                                v-for="i in 3"
                                :key="i"
                                class="size-14 border border-dashed border-line-3"
                                aria-hidden="true"
                            />
                        </template>
                    </div>
                    <!-- Dimension line under the three dice: their total. -->
                    <div class="core-dim" aria-live="polite">
                        <span>
                            total
                            <span class="font-medium text-ink">{{ roll ? roll.total : "—" }}</span>
                        </span>
                    </div>
                </div>
                <p class="mt-5 max-w-xs text-center text-xs leading-relaxed text-ink-3">
                    PHP's <code class="core-code">random_int()</code>
                    rolls the dice. The array comes back as the resolved
                    Promise.
                </p>
            </div>

            <Button
                variant="secondary"
                :loading="rolling"
                class="self-center"
                @click="handleRoll"
            >
                {{ rolling ? "Rolling…" : "Roll dice" }}
            </Button>
        </Panel>
    </div>
</template>
