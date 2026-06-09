import React, { useState } from "react";
import { useEntangle, useErrorBag, useWire } from "@mesh/react";

interface Plan {
    id: "starter" | "pro" | "team";
    label: string;
    price: string;
    blurb: string;
}

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

const slugify = (value: string): string =>
    value
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/[\s_]+/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-+|-+$/g, "");

const inputBase =
    "w-full rounded-xl bg-slate-900/60 border px-4 py-2.5 text-sm text-white placeholder-slate-500 transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900";

const inputValid =
    "border-white/10 focus:border-rose-400/50 focus:ring-rose-500/60";

const inputInvalid =
    "border-red-500/60 focus:border-red-400 focus:ring-red-500/60";

const FieldError: React.FC<{ messages?: string[] | null }> = ({ messages }) =>
    messages && messages.length > 0 ? (
        <p className="mt-1.5 text-xs text-red-400" role="alert">
            {messages[0]}
        </p>
    ) : null;

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
                {/* Name */}
                <div>
                    <label htmlFor="project-name" className="block text-sm font-medium text-slate-300 mb-1.5">
                        Project name
                    </label>
                    <input
                        id="project-name"
                        type="text"
                        value={name}
                        onChange={(e) => handleNameChange(e.target.value)}
                        placeholder="My Next Big Thing"
                        aria-invalid={Boolean(errors.name)}
                        className={`${inputBase} ${errors.name ? inputInvalid : inputValid}`}
                    />
                    <FieldError messages={errors.name} />
                </div>

                {/* Slug */}
                <div>
                    <div className="flex items-baseline justify-between mb-1.5">
                        <label htmlFor="project-slug" className="block text-sm font-medium text-slate-300">
                            Slug
                        </label>
                        <span className="text-[11px] font-medium uppercase tracking-wider text-cyan-400/80">
                            live — validates per keystroke
                        </span>
                    </div>
                    <input
                        id="project-slug"
                        type="text"
                        value={slug}
                        onChange={(e) => handleSlugChange(e.target.value)}
                        placeholder="my-next-big-thing"
                        aria-invalid={Boolean(errors.slug)}
                        className={`${inputBase} font-mono ${errors.slug ? inputInvalid : inputValid}`}
                    />
                    <FieldError messages={errors.slug} />
                    <p className="mt-1.5 text-xs text-slate-500">
                        Auto-derived from the name until you edit it. Lowercase letters, numbers and dashes only.
                    </p>
                </div>

                {/* Email */}
                <div>
                    <label htmlFor="project-email" className="block text-sm font-medium text-slate-300 mb-1.5">
                        Owner email
                    </label>
                    <input
                        id="project-email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="ada@example.com"
                        aria-invalid={Boolean(errors.email)}
                        className={`${inputBase} ${errors.email ? inputInvalid : inputValid}`}
                    />
                    <FieldError messages={errors.email} />
                </div>

                {/* Plan */}
                <fieldset>
                    <legend className="block text-sm font-medium text-slate-300 mb-1.5">Plan</legend>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        {plans.map((p) => {
                            const selected = plan === p.id;
                            return (
                                <label
                                    key={p.id}
                                    className={`relative cursor-pointer rounded-xl border p-4 transition-all duration-150 ${
                                        selected
                                            ? "border-rose-400/60 bg-gradient-to-br from-rose-500/15 to-orange-500/10 shadow-lg shadow-rose-500/10"
                                            : "border-white/10 bg-slate-900/40 hover:border-white/20 hover:bg-slate-900/60"
                                    }`}
                                >
                                    <input
                                        type="radio"
                                        name="plan"
                                        value={p.id}
                                        checked={selected}
                                        onChange={() => setPlan(p.id)}
                                        className="sr-only"
                                    />
                                    <span className="flex items-baseline justify-between">
                                        <span className={`text-sm font-semibold ${selected ? "text-white" : "text-slate-300"}`}>
                                            {p.label}
                                        </span>
                                        <span className={`text-xs font-bold ${selected ? "text-rose-300" : "text-slate-500"}`}>
                                            {p.price}
                                        </span>
                                    </span>
                                    <span className="mt-1 block text-xs text-slate-500 leading-snug">{p.blurb}</span>
                                    {selected && (
                                        <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-gradient-to-br from-rose-500 to-orange-500 text-[10px] text-white shadow">
                                            ✓
                                        </span>
                                    )}
                                </label>
                            );
                        })}
                    </div>
                    <FieldError messages={errors.plan} />
                </fieldset>

                {/* Submit */}
                <button
                    type="submit"
                    disabled={submitting}
                    className="w-full rounded-xl bg-gradient-to-r from-rose-500 to-orange-500 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-rose-500/25 transition-all duration-150 hover:from-rose-600 hover:to-orange-600 active:scale-95 disabled:opacity-50 disabled:pointer-events-none focus:outline-none focus:ring-2 focus:ring-rose-500 focus:ring-offset-2 focus:ring-offset-slate-900"
                >
                    {submitting ? "Creating…" : "Create project"}
                </button>
            </form>

            {/* Success panel */}
            {created && (
                <div className="mt-6 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4">
                    <div className="flex items-center gap-2 mb-2">
                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500/20 text-xs text-emerald-300">
                            ✓
                        </span>
                        <span className="text-sm font-semibold text-emerald-300">
                            Project created — payload returned by save()
                        </span>
                    </div>
                    <pre className="overflow-x-auto rounded-lg bg-slate-950/60 p-3 text-xs leading-relaxed text-emerald-200/90">
                        {JSON.stringify(created, null, 2)}
                    </pre>
                </div>
            )}

            {/* Raw error bag */}
            <details className="mt-6 group">
                <summary className="cursor-pointer select-none text-xs font-medium text-slate-500 hover:text-slate-300 transition-colors duration-150">
                    <span className="group-open:hidden">▸</span>
                    <span className="hidden group-open:inline">▾</span>{" "}
                    Error bag, raw — exactly what useErrorBag() returns
                </summary>
                <pre className="mt-2 overflow-x-auto rounded-xl border border-white/10 bg-slate-950/60 p-3 text-xs leading-relaxed text-amber-200/80">
                    {JSON.stringify(errors, null, 2)}
                </pre>
            </details>
        </div>
    );
};

export default ProjectForm;
