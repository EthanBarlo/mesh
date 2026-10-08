import { AnatomyFigures } from './anatomy-figure';
import { Code } from './code';

// Every snippet is written to fit its panel without horizontal scrolling:
// lines stay at or under ~48 characters.

const php = `<?php

namespace App\\Mesh;

use EthanBarlo\\Mesh\\Component;
use Livewire\\Attributes\\Modelable;

class Counter extends Component
{
    #[Modelable]
    public int $count = 0;

    public function props(): array
    {
        return ['label' => 'Clicks'];
    }
}`;

const react = `import { useEntangle } from "@mesh/react";

export default function Counter({ label }: {
  label: string;
}) {
  const [count, setCount] =
    useEntangle<number>("count");

  return (
    <button onClick={() => setCount(count + 1)}>
      {label}: {count}
    </button>
  );
}`;

const vue = `<script setup lang="ts">
import { useEntangle } from "@mesh/vue";

defineProps<{ label: string }>();
const count = useEntangle<number>("count");
</script>

<template>
  <button @click="count++">
    {{ label }}: {{ count }}
  </button>
</template>`;

const svelte = `<script lang="ts">
  import { useEntangle } from "@mesh/svelte";

  let { label }: { label: string } = $props();
  const count = useEntangle<number>("count");
</script>

<button onclick={() => count.value++}>
  {label}: {count.value}
</button>`;

const blade = `<mesh:counter wire:model="count" />`;

/** Sheet 02's figures, with every snippet highlighted on the server. */
export async function Anatomy() {
  const [phpNode, reactNode, vueNode, svelteNode, bladeNode] = await Promise.all([
    Code({
      code: php,
      lang: 'php',
      marks: [
        { part: 'base', match: 'App\\Mesh' },
        { part: 'name', match: 'Counter' },
        { part: 'state', match: '#[Modelable]' },
        { part: 'state', match: '$count' },
        { part: 'props', match: 'props()' },
        { part: 'props', match: "'label'" },
      ],
    }),
    Code({
      code: react,
      lang: 'tsx',
      marks: [
        { part: 'renderer', match: '"@mesh/react"' },
        { part: 'name', match: 'Counter' },
        { part: 'props', match: 'label', nth: 0 },
        { part: 'state', match: 'useEntangle<number>("count")' },
      ],
    }),
    Code({
      code: vue,
      lang: 'vue',
      marks: [
        { part: 'renderer', match: '"@mesh/vue"' },
        { part: 'props', match: 'defineProps<{ label: string }>()' },
        { part: 'state', match: 'useEntangle<number>("count")' },
      ],
    }),
    Code({
      code: svelte,
      lang: 'svelte',
      marks: [
        { part: 'renderer', match: '"@mesh/svelte"' },
        { part: 'props', match: '$props()' },
        { part: 'state', match: 'useEntangle<number>("count")' },
      ],
    }),
    Code({
      code: blade,
      lang: 'blade',
      marks: [
        { part: 'base', match: 'mesh:' },
        { part: 'name', match: 'counter' },
        { part: 'state', match: 'wire:model="count"' },
      ],
    }),
  ]);

  return (
    <AnatomyFigures
      php={phpNode}
      blade={bladeNode}
      front={{ react: reactNode, vue: vueNode, svelte: svelteNode }}
    />
  );
}
