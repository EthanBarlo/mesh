<div class="space-y-12">
    <x-demo.page-header
        title="File Uploads"
        description="`wire.$upload()` drives Livewire's signed temporary-upload pipeline straight from React: progress events, server-side validation and live previews. There is no upload controller and nothing is persisted; Livewire cleans up the temporary files."
    />

    <x-demo.section
        title="Dropzone"
        caption="Drop target, upload progress and the server's preview"
        description="A hand-rolled dropzone on native drag events, with no react-dropzone, so the same pattern ports to Vue or Svelte. A dropped or chosen file goes to `wire.$upload('photo', file, …)`, and the progress bar follows its progress events. When the upload lands, React calls `inspect()` for the file's metadata and signed preview URL. Remove calls `wire.$removeUpload()` to delete the temporary file."
        :files="[
            'app/Mesh/Uploads/Dropzone.php',
            'resources/js/mesh/Uploads/Dropzone/index.tsx',
        ]"
    >
        <div class="mx-auto max-w-2xl">
            <mesh:uploads.dropzone />
        </div>
    </x-demo.section>

    <x-demo.note tone="ink" title="The server is the gatekeeper">
        The <code>photo</code> property is validated with
        <code>image|max:2048</code> (images only, 2&nbsp;MB cap) the moment the temporary
        upload lands, before any of your code runs. Drop a PDF or an oversized file: the server rejects it,
        and the message reaches React through <code>useErrorBag()</code>. The client-side
        <code>accept</code> hint is only a convenience.
    </x-demo.note>
</div>
