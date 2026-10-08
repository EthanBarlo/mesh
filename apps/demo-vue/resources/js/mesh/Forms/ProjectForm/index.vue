<script setup lang="ts">
import { computed, ref } from "vue";
import { useEntangle, useErrorBag, useWire } from "@mesh/vue";
import { Alert, Button, Field, Input, JsonDump } from "@/components/ui";
import PlanPicker, { type Plan } from "@/components/demo/Forms/PlanPicker.vue";
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

defineProps<{
    plans: Plan[];
}>();

// Deferred: committed with the next Livewire request (the submit).
const name = useEntangle<string>("name");
const email = useEntangle<string>("email");
const plan = useEntangle<string>("plan");

// Live: every keystroke is sent to the server, so the slug's
// validation rules fire per keystroke via updatedSlug().
const slug = useEntangle<string>("slug", true);

const errors = useErrorBag();
const wire = useWire();

const slugEdited = ref(false);
const submitting = ref(false);
const created = ref<CreatedProject | null>(null);

// Auto-derive the slug from the name until it's manually edited.
const nameModel = computed({
    get: () => name.value,
    set: (value: string) => {
        name.value = value;
        if (!slugEdited.value) {
            slug.value = slugify(value);
        }
    },
});

const slugModel = computed({
    get: () => slug.value,
    set: (value: string) => {
        slugEdited.value = true;
        slug.value = value;
    },
});

const errorFields = computed(() => Object.keys(errors.value ?? {}).length);

const handleSubmit = async () => {
    submitting.value = true;
    created.value = null;
    try {
        // On validation failure $call may reject or resolve with no
        // payload while the error bag updates — handle both.
        const res = (await wire.$call("save")) as SaveResult | null | undefined;
        if (res && res.ok) {
            created.value = res.project;
        }
    } catch {
        // Validation failed — useErrorBag() picks up the messages.
    } finally {
        submitting.value = false;
    }
};
</script>

<template>
    <div class="max-w-xl">
        <form novalidate class="space-y-5" @submit.prevent="handleSubmit">
            <Field label="Project name" html-for="project-name" :error="errors.name">
                <Input
                    id="project-name"
                    v-model="nameModel"
                    placeholder="My Next Big Thing"
                    :invalid="Boolean(errors.name)"
                />
            </Field>

            <Field
                label="Slug"
                html-for="project-slug"
                :error="errors.slug"
                hint="Derived from the name until you edit it. Lowercase letters, numbers and dashes only."
            >
                <template #corner>
                    <span class="core-status">
                        <span class="core-dot" data-state="live" aria-hidden="true" />
                        Live · per keystroke
                    </span>
                </template>
                <Input
                    id="project-slug"
                    v-model="slugModel"
                    placeholder="my-next-big-thing"
                    :invalid="Boolean(errors.slug)"
                    class="font-mono"
                />
            </Field>

            <Field label="Owner email" html-for="project-email" :error="errors.email">
                <Input
                    id="project-email"
                    v-model="email"
                    type="email"
                    placeholder="ada@example.com"
                    :invalid="Boolean(errors.email)"
                />
            </Field>

            <div>
                <PlanPicker v-model="plan" :plans="plans" />
                <p
                    v-if="errors.plan && errors.plan.length > 0"
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
                    <span>{{ errors.plan[0] }}</span>
                </p>
            </div>

            <Button type="submit" variant="primary" :loading="submitting" class="w-full">
                {{ submitting ? "Creating…" : "Create project" }}
            </Button>
        </form>

        <!-- The payload returned by save() resolves the $call promise. -->
        <Alert v-if="created" tone="success" class="mt-6" title="Project created">
            <p class="font-mono text-xs text-ink-3">Payload returned by save()</p>
            <JsonDump :value="created" class="mt-2" />
        </Alert>

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
                    · {{ errorFields }} {{ errorFields === 1 ? "field" : "fields" }}
                </span>
            </summary>
            <JsonDump :value="errors" class="mt-2" />
        </details>
    </div>
</template>
