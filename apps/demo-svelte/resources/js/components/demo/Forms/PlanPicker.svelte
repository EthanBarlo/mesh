<script module lang="ts">
    export interface Plan {
        id: "starter" | "pro" | "team";
        label: string;
        price: string;
        blurb: string;
    }
</script>

<script lang="ts">
    import { cn } from "@/components/ui";

    interface Props {
        plans: Plan[];
        class?: string;
        value: string;
    }

    let { plans, class: className, value = $bindable() }: Props = $props();
</script>

<!-- Radio-card grid for picking a plan — sr-only radios behind styled labels. -->
<fieldset class={cn(className)}>
    <legend class="block text-sm font-medium text-zinc-300 mb-1.5">
        Plan
    </legend>
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {#each plans as p (p.id)}
            <label
                class={cn(
                    "relative cursor-pointer rounded-lg border p-4 transition-colors duration-150 focus-within:ring-2 focus-within:ring-white/20 focus-within:ring-offset-2 focus-within:ring-offset-zinc-950",
                    value === p.id
                        ? "border-white/20 bg-white/[0.05]"
                        : "border-white/10 bg-white/[0.02] hover:border-white/20 hover:bg-white/[0.05]",
                )}
            >
                <input
                    bind:group={value}
                    type="radio"
                    name="plan"
                    value={p.id}
                    class="sr-only"
                />
                <span class="flex items-baseline justify-between">
                    <span
                        class={cn(
                            "text-sm font-semibold",
                            value === p.id ? "text-white" : "text-zinc-300",
                        )}
                    >
                        {p.label}
                    </span>
                    <span
                        class={cn(
                            "text-xs font-medium tabular-nums",
                            value === p.id ? "text-white" : "text-zinc-500",
                        )}
                    >
                        {p.price}
                    </span>
                </span>
                <span class="mt-1 block text-xs text-zinc-500 leading-snug">
                    {p.blurb}
                </span>
                {#if value === p.id}
                    <span
                        class="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-white text-[10px] text-zinc-950"
                    >
                        ✓
                    </span>
                {/if}
            </label>
        {/each}
    </div>
</fieldset>
