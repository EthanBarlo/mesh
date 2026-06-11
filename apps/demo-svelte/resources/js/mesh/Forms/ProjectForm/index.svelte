<script lang="ts">
    import { useEntangle, useErrorBag, useWire } from "@mesh/svelte";
    import { Alert, Button, Field, Input, JsonDump } from "@/components/ui";
    import PlanPicker, { type Plan } from "@/components/demo/Forms/PlanPicker.svelte";
    import { slugify } from "@/components/demo/Forms/slugify";

    interface CreatedProject {
        id: string;
        name: string;
        slug: string;
        owner: string;
        plan: string;
        url: string;
    }

    interface SaveResult {
        ok: boolean;
        project: CreatedProject;
    }

    interface Props {
        plans: Plan[];
    }

    let { plans }: Props = $props();

    // Deferred: committed with the next Livewire request (the submit).
    const name = useEntangle<string>("name");
    const email = useEntangle<string>("email");
    const plan = useEntangle<string>("plan");

    // Live: every keystroke is sent to the server, so the slug's
    // validation rules fire per keystroke via updatedSlug().
    const slug = useEntangle<string>("slug", true);

    const errors = useErrorBag();
    const wire = useWire();

    let slugEdited = $state(false);
    let submitting = $state(false);
    let created = $state<CreatedProject | null>(null);

    // Auto-derive the slug from the name until it's manually edited.
    const setName = (value: string) => {
        name.value = value;
        if (!slugEdited) {
            slug.value = slugify(value);
        }
    };

    const setSlug = (value: string) => {
        slugEdited = true;
        slug.value = value;
    };

    const handleSubmit = async () => {
        submitting = true;
        created = null;
        try {
            // On validation failure $call may reject or resolve with no
            // payload while the error bag updates — handle both.
            const res = (await wire.$call("save")) as SaveResult | null | undefined;
            if (res && res.ok) {
                created = res.project;
            }
        } catch {
            // Validation failed — useErrorBag() picks up the messages.
        } finally {
            submitting = false;
        }
    };
</script>

<div class="max-w-xl">
    <form
        novalidate
        class="space-y-5"
        onsubmit={(event) => {
            event.preventDefault();
            void handleSubmit();
        }}
    >
        <Field label="Project name" htmlFor="project-name" error={errors.value.name}>
            <Input
                id="project-name"
                bind:value={() => name.value, (value) => setName(String(value ?? ""))}
                placeholder="My Next Big Thing"
                invalid={Boolean(errors.value.name)}
            />
        </Field>

        <Field
            label="Slug"
            htmlFor="project-slug"
            error={errors.value.slug}
            hint="Auto-derived from the name until you edit it. Lowercase letters, numbers and dashes only."
        >
            {#snippet corner()}
                <span
                    class="inline-flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wider text-zinc-500"
                >
                    <span class="inline-flex rounded-full h-1.5 w-1.5 bg-rose-400"></span>
                    live — validates per keystroke
                </span>
            {/snippet}
            <Input
                id="project-slug"
                bind:value={() => slug.value, (value) => setSlug(String(value ?? ""))}
                placeholder="my-next-big-thing"
                invalid={Boolean(errors.value.slug)}
                class="font-mono"
            />
        </Field>

        <Field label="Owner email" htmlFor="project-email" error={errors.value.email}>
            <Input
                id="project-email"
                bind:value={email.value}
                type="email"
                placeholder="ada@example.com"
                invalid={Boolean(errors.value.email)}
            />
        </Field>

        <div>
            <PlanPicker bind:value={plan.value} {plans} />
            {#if errors.value.plan && errors.value.plan.length > 0}
                <p class="mt-1.5 text-xs text-rose-400" role="alert">
                    {errors.value.plan[0]}
                </p>
            {/if}
        </div>

        <Button type="submit" variant="primary" loading={submitting} class="w-full py-3">
            {submitting ? "Creating…" : "Create project"}
        </Button>
    </form>

    <!-- The payload returned by save() resolves the $call promise. -->
    {#if created}
        <Alert tone="success" class="mt-6 rounded-xl p-4">
            {#snippet icon()}
                <span
                    class="flex h-5 w-5 items-center justify-center rounded-full bg-white/5 text-xs text-emerald-400"
                >
                    ✓
                </span>
            {/snippet}
            {#snippet title()}
                <span class="text-sm font-semibold">
                    Project created — payload returned by save()
                </span>
            {/snippet}
            <JsonDump value={created} class="mt-1.5" />
        </Alert>
    {/if}

    <!-- Raw error bag — exactly the object useErrorBag() hands back. -->
    <details class="mt-6 group">
        <summary
            class="cursor-pointer select-none text-xs font-medium text-zinc-500 hover:text-white transition-colors duration-150"
        >
            <span class="group-open:hidden">▸</span>
            <span class="hidden group-open:inline">▾</span>
            Error bag, raw — exactly what useErrorBag() returns
        </summary>
        <JsonDump value={errors.value} class="mt-2" />
    </details>
</div>
