import React, { useState } from "react";
import { useEntangle, useErrorBag, useWire } from "@mesh/react";
import { Alert, Button, Field, Input, JsonDump } from "@/components/ui";
import PlanPicker, { type Plan } from "@/components/demo/Forms/PlanPicker";
import { slugify } from "@/components/demo/Forms/slugify";

interface ProjectFormProps {
    plans: Plan[];
}

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

const ProjectForm: React.FC<ProjectFormProps> = ({ plans }) => {
    // Deferred: committed with the next Livewire request (the submit).
    const [name, setName] = useEntangle<string>("name");
    const [email, setEmail] = useEntangle<string>("email");
    const [plan, setPlan] = useEntangle<string>("plan");

    // Live: every keystroke is sent to the server, so the slug's
    // validation rules fire per keystroke via updatedSlug().
    const [slug, setSlug] = useEntangle<string>("slug", true);

    const errors = useErrorBag();
    const wire = useWire();

    const [slugEdited, setSlugEdited] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [created, setCreated] = useState<CreatedProject | null>(null);

    const handleNameChange = (value: string) => {
        setName(value);
        // Auto-derive the slug from the name until it's manually edited.
        if (!slugEdited) {
            setSlug(slugify(value));
        }
    };

    const handleSlugChange = (value: string) => {
        setSlugEdited(true);
        setSlug(value);
    };

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setSubmitting(true);
        setCreated(null);
        try {
            // On validation failure $call may reject or resolve with no
            // payload while the error bag updates — handle both.
            const res = (await wire.$call("save")) as SaveResult | null | undefined;
            if (res && res.ok) {
                setCreated(res.project);
            }
        } catch {
            // Validation failed — useErrorBag() picks up the messages.
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="max-w-xl">
            <form onSubmit={handleSubmit} noValidate className="space-y-5">
                <Field label="Project name" htmlFor="project-name" error={errors.name}>
                    <Input
                        id="project-name"
                        value={name}
                        onChange={(e) => handleNameChange(e.target.value)}
                        placeholder="My Next Big Thing"
                        invalid={Boolean(errors.name)}
                    />
                </Field>

                <Field
                    label="Slug"
                    htmlFor="project-slug"
                    corner={
                        <span className="text-[11px] font-medium uppercase tracking-wider text-cyan-400/80">
                            live — validates per keystroke
                        </span>
                    }
                    error={errors.slug}
                    hint="Auto-derived from the name until you edit it. Lowercase letters, numbers and dashes only."
                >
                    <Input
                        id="project-slug"
                        value={slug}
                        onChange={(e) => handleSlugChange(e.target.value)}
                        placeholder="my-next-big-thing"
                        invalid={Boolean(errors.slug)}
                        className="font-mono"
                    />
                </Field>

                <Field label="Owner email" htmlFor="project-email" error={errors.email}>
                    <Input
                        id="project-email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="ada@example.com"
                        invalid={Boolean(errors.email)}
                    />
                </Field>

                <div>
                    <PlanPicker plans={plans} value={plan} onChange={setPlan} />
                    {errors.plan && errors.plan.length > 0 && (
                        <p className="mt-1.5 text-xs text-red-400" role="alert">
                            {errors.plan[0]}
                        </p>
                    )}
                </div>

                <Button
                    type="submit"
                    variant="primary"
                    loading={submitting}
                    className="w-full py-3 bg-gradient-to-r"
                >
                    {submitting ? "Creating…" : "Create project"}
                </Button>
            </form>

            {/* The payload returned by save() resolves the $call promise. */}
            {created && (
                <Alert
                    tone="success"
                    className="mt-6 rounded-xl p-4"
                    icon={
                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500/20 text-xs text-emerald-300">
                            ✓
                        </span>
                    }
                    title={
                        <span className="text-sm font-semibold">
                            Project created — payload returned by save()
                        </span>
                    }
                >
                    <JsonDump
                        value={created}
                        className="mt-1.5 rounded-lg border-0 text-emerald-200/90"
                    />
                </Alert>
            )}

            {/* Raw error bag — exactly the object useErrorBag() hands back. */}
            <details className="mt-6 group">
                <summary className="cursor-pointer select-none text-xs font-medium text-slate-500 hover:text-slate-300 transition-colors duration-150">
                    <span className="group-open:hidden">▸</span>
                    <span className="hidden group-open:inline">▾</span>{" "}
                    Error bag, raw — exactly what useErrorBag() returns
                </summary>
                <JsonDump value={errors} className="mt-2 text-amber-200/80" />
            </details>
        </div>
    );
};

export default ProjectForm;
