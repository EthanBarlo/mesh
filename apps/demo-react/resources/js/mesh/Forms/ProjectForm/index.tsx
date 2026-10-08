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

    const errorFields = Object.keys(errors ?? {}).length;

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
                        <span className="core-status">
                            <span
                                className="core-dot"
                                data-state="live"
                                aria-hidden="true"
                            />
                            Live · per keystroke
                        </span>
                    }
                    error={errors.slug}
                    hint="Derived from the name until you edit it. Lowercase letters, numbers and dashes only."
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
                        <p
                            className="mt-1.5 flex items-start gap-1.5 text-xs leading-snug text-danger"
                            role="alert"
                        >
                            <svg
                                className="mt-[2px] size-2.5 shrink-0"
                                viewBox="0 0 10 10"
                                aria-hidden="true"
                            >
                                <path d="M5 .8 9.4 9.2H.6Z" fill="currentColor" />
                            </svg>
                            <span>{errors.plan[0]}</span>
                        </p>
                    )}
                </div>

                <Button
                    type="submit"
                    variant="primary"
                    loading={submitting}
                    className="w-full"
                >
                    {submitting ? "Creating…" : "Create project"}
                </Button>
            </form>

            {/* The payload returned by save() resolves the $call promise. */}
            {created && (
                <Alert
                    tone="success"
                    className="mt-6"
                    title="Project created"
                >
                    <p className="font-mono text-xs text-ink-3">
                        Payload returned by save()
                    </p>
                    <JsonDump value={created} className="mt-2" />
                </Alert>
            )}

            {/* Raw error bag — exactly the object useErrorBag() hands back. */}
            <details className="group mt-6">
                <summary className="inline-flex min-h-10 cursor-pointer list-none items-center gap-2 select-none text-ink-3 transition-colors duration-150 hover:text-ink [&::-webkit-details-marker]:hidden">
                    <span
                        className="font-mono text-xs transition-transform duration-150 group-open:rotate-90 motion-reduce:transition-none"
                        aria-hidden="true"
                    >
                        ▸
                    </span>
                    <span className="k k--caps">Raw error bag</span>
                    <span className="font-mono text-xs">useErrorBag()</span>
                    <span className="k tabular-nums">
                        · {errorFields} {errorFields === 1 ? "field" : "fields"}
                    </span>
                </summary>
                <JsonDump value={errors} className="mt-2" />
            </details>
        </div>
    );
};

export default ProjectForm;
