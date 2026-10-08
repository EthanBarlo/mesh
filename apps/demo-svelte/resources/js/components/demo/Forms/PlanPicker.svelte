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

<!-- Option boxes for picking a plan — sr-only radios behind drawn labels. -->
<fieldset class={cn(className)}>
    <legend
        class="mb-1.5 block font-mono text-[0.6875rem] leading-normal tracking-[0.1em] text-ink-2 uppercase"
    >
        Plan
    </legend>
    <div class="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {#each plans as p (p.id)}
            {@const selected = value === p.id}
            <label
                data-selected={selected}
                class={cn(
                    "plan-opt relative block cursor-pointer border p-4 transition-colors duration-150 motion-reduce:transition-none",
                    selected
                        ? "border-ink bg-paper-2"
                        : "border-line-2 bg-paper hover:border-line-3",
                )}
            >
                <input
                    bind:group={value}
                    type="radio"
                    name="plan"
                    value={p.id}
                    class="sr-only"
                />
                <span class="flex items-center gap-2.5">
                    <span class="plan-opt__box" aria-hidden="true"></span>
                    <span class="text-sm font-semibold text-ink">
                        {p.label}
                    </span>
                    <span
                        class={cn(
                            "ml-auto font-mono text-xs tabular-nums",
                            selected ? "text-ink" : "text-ink-3",
                        )}
                    >
                        {p.price}
                    </span>
                </span>
                <span class="mt-1.5 block pl-6 text-xs leading-snug text-ink-3">
                    {p.blurb}
                </span>
            </label>
        {/each}
    </div>
</fieldset>
