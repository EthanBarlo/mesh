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
                hint="Auto-derived from the name until you edit it. Lowercase letters, numbers and dashes only."
            >
                <template #corner>
                    <span
                        class="inline-flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wider text-zinc-500"
                    >
                        <span class="inline-flex rounded-full h-1.5 w-1.5 bg-rose-400" />
                        live — validates per keystroke
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
                    class="mt-1.5 text-xs text-rose-400"
                    role="alert"
                >
                    {{ errors.plan[0] }}
                </p>
            </div>

            <Button type="submit" variant="primary" :loading="submitting" class="w-full py-3">
                {{ submitting ? "Creating…" : "Create project" }}
            </Button>
        </form>

        <!-- The payload returned by save() resolves the $call promise. -->
        <Alert v-if="created" tone="success" class="mt-6 rounded-xl p-4">
            <template #icon>
                <span
                    class="flex h-5 w-5 items-center justify-center rounded-full bg-white/5 text-xs text-emerald-400"
                >
                    ✓
                </span>
            </template>
            <template #title>
                <span class="text-sm font-semibold">
                    Project created — payload returned by save()
                </span>
            </template>
            <JsonDump :value="created" class="mt-1.5" />
        </Alert>

        <!-- Raw error bag — exactly the object useErrorBag() hands back. -->
        <details class="mt-6 group">
            <summary
                class="cursor-pointer select-none text-xs font-medium text-zinc-500 hover:text-white transition-colors duration-150"
            >
                <span class="group-open:hidden">▸</span>
                <span class="hidden group-open:inline">▾</span>
                Error bag, raw — exactly what useErrorBag() returns
            </summary>
            <JsonDump :value="errors" class="mt-2" />
        </details>
    </div>
</template>
