<div class="space-y-12">
    <x-demo.page-header
        title="Forms & Validation"
        description="Laravel validation rules are the single source of truth — useErrorBag() streams the server error bag into Vue. No duplicated rules, no API endpoints. Define #[Validate] attributes on the Livewire properties and render the messages straight from the bag." />

    <x-demo.section
        title="Project form"
        description="Name and email are deferred — they commit with the submit request. The slug is live-entangled, so updatedSlug() runs validateOnly('slug') on every keystroke: type an uppercase letter or a space and watch the regex rule fire server-side, per keystroke, with zero client-side rules. Submit calls save() via $wire.$call — on failure the error bag updates; on success the returned project payload renders in the emerald panel. Expand the raw error bag at the bottom to see exactly the object Vue receives."
        :files="[
            'app/Mesh/Forms/ProjectForm.php',
            'resources/js/mesh/Forms/ProjectForm/index.vue',
            'resources/views/livewire/pages/forms.blade.php',
        ]">
        <mesh:forms.project-form />
    </x-demo.section>
</div>
