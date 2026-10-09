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

    // Live: every keystroke is sent to the server, where the
    // #[Validate] rules re-check the slug on each update.
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
            // A validation failure resolves with null and fills the error
            // bag; $call only rejects when the request itself fails.
            const res = (await wire.$call("save")) as SaveResult | null;
            if (res && res.ok) {
                created = res.project;
            }
        } catch {
            // The request failed (network or server error).
        } finally {
            submitting = false;
        }
    };

    const errorFields = $derived(Object.keys(errors.value ?? {}).length);
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
            hint="Derived from the name until you edit it. Lowercase letters, numbers and dashes only."
        >
            {#snippet corner()}
                <span class="core-status">
                    <span class="core-dot" data-state="live" aria-hidden="true"></span>
                    Live · per keystroke
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
                <p
                    class="mt-1.5 flex items-start gap-1.5 text-xs leading-snug text-danger"
                    role="alert"
                >
                    <svg
                        class="mt-[2px] size-2.5 shrink-0"
                        viewBox="0 0 10 10"
                        aria-hidden="true"
                    >
                        <path d="M5 .8 9.4 9.2H.6Z" fill="currentColor" />
                    </svg>
                    <span>{errors.value.plan[0]}</span>
                </p>
            {/if}
        </div>

        <Button type="submit" variant="primary" loading={submitting} class="w-full">
            {submitting ? "Creating…" : "Create project"}
        </Button>
    </form>

    <!-- The payload returned by save() resolves the $call promise. -->
    {#if created}
        <Alert tone="success" class="mt-6" title="Project created">
            <p class="font-mono text-xs text-ink-3">Payload returned by save()</p>
            <JsonDump value={created} class="mt-2" />
        </Alert>
    {/if}

    <!-- Raw error bag — exactly the object useErrorBag() hands back. -->
    <details class="group mt-6">
        <summary
            class="inline-flex min-h-10 cursor-pointer list-none items-center gap-2 select-none text-ink-3 transition-colors duration-150 hover:text-ink [&::-webkit-details-marker]:hidden"
        >
            <span
                class="font-mono text-xs transition-transform duration-150 group-open:rotate-90 motion-reduce:transition-none"
                aria-hidden="true"
            >
                ▸
            </span>
            <span class="k k--caps">Raw error bag</span>
            <span class="font-mono text-xs">useErrorBag()</span>
            <span class="k tabular-nums">
                · {errorFields} {errorFields === 1 ? "field" : "fields"}
            </span>
        </summary>
        <JsonDump value={errors.value} class="mt-2" />
    </details>
</div>
