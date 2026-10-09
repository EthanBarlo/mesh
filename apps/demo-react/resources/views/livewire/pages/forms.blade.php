<div class="space-y-12">
    <x-demo.page-header
        title="Forms & Validation"
        description="Laravel validation rules are the single source of truth. Put `#[Validate]` on the Livewire properties and `useErrorBag()` streams the server's error bag into React. No duplicated rules, no API endpoints." />

    <x-demo.section
        title="Project form"
        caption="A server-validated form with a live slug"
        description="Name and email are deferred and go with the submit. The slug is live-entangled, so every keystroke reaches the server and its `#[Validate]` rules run there: type an uppercase letter or a space and the regex rule fails. Submit calls `save()` through `wire.$call`. A validation failure fills the error bag and resolves with `null`; a success returns the new project."
        :files="[
            'app/Mesh/Forms/ProjectForm.php',
            'resources/js/mesh/Forms/ProjectForm/index.tsx',
            'resources/views/livewire/pages/forms.blade.php',
        ]">
        <mesh:forms.project-form />
    </x-demo.section>

    <x-demo.note tone="blue" title="No rules in the browser">
        Every message on this form comes from the <code>#[Validate]</code> attributes in
        <code>ProjectForm.php</code>. Open <em>Raw error bag</em> under the form to see the
        exact object <code>useErrorBag()</code> returns.
    </x-demo.note>
</div>
