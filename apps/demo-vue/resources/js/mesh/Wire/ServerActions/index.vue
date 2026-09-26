<script setup lang="ts">
import { ref } from "vue";
import { useWire } from "@mesh/vue";
import { Button, Eyebrow, Panel, Stat, Textarea } from "@/components/ui";
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
</script>

<template>
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Panel class="flex flex-col">
            <Eyebrow>await wire.$call("analyze", text)</Eyebrow>

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

            <div v-if="analysis" class="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-2">
                <Stat label="Words" :value="analysis.words" />
                <Stat label="Characters" :value="analysis.characters" />
                <Stat label="Longest word" :value="analysis.longestWord || '—'" />
                <Stat label="Server time" :value="analysis.analyzedAt" />
            </div>
            <p v-else class="mt-4 text-sm text-zinc-500">
                The result object below is the PHP method's return value — no route, no controller, no fetch.
            </p>
        </Panel>

        <Panel class="flex flex-col">
            <Eyebrow>await wire.$call("rollDice")</Eyebrow>

            <div class="flex-1 flex flex-col items-center justify-center py-6">
                <template v-if="roll">
                    <div :class="`flex items-center gap-3 transition-opacity ${rolling ? 'opacity-40' : 'opacity-100'}`">
                        <Die v-for="(value, i) in roll.dice" :key="i" :value="value" />
                    </div>
                    <p class="mt-4 text-sm text-zinc-400">
                        Server total:
                        <span class="text-xl font-semibold text-white tabular-nums align-middle">{{ roll.total }}</span>
                    </p>
                </template>
                <p v-else class="text-sm text-zinc-500 text-center max-w-xs">
                    PHP's <code class="font-mono text-zinc-400">random_int()</code> rolls the dice — the array comes back as a
                    resolved Promise.
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
