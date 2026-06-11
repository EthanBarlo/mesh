<div class="space-y-12">
    <x-demo.page-header
        title="File Uploads"
        description="wire.$upload() drives Livewire's signed temporary-upload pipeline straight from React — progress events, server-side validation, and live previews with no upload controller and no persistence. Temporary files are auto-cleaned by Livewire."
    />

    <x-demo.section
        title="Dropzone"
        description="A hand-rolled dropzone built on native drag events — no react-dropzone, so the exact same pattern ports to Vue or Svelte. Dropping (or browsing to) a file calls wire.$upload('photo', file, …), which streams to Livewire's signed temporary-upload endpoint while the progress bar tracks progress events. On finish, React calls inspect() on the server to read the temp file's metadata and signed preview URL; Remove uses wire.$removeUpload() to delete the temp file."
        :files="[
            'app/Mesh/Uploads/Dropzone.php',
            'resources/js/mesh/Uploads/Dropzone/index.tsx',
        ]"
    >
        <div class="max-w-2xl mx-auto">
            <mesh:uploads.dropzone />

            <div class="mt-6 flex items-start gap-3 rounded-xl border border-white/5 bg-white/[0.02] p-4">
                <svg class="w-5 h-5 text-zinc-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" aria-hidden="true">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                </svg>
                <p class="text-sm text-zinc-400 leading-relaxed">
                    <span class="font-medium text-white">Server-enforced security:</span>
                    the <code class="text-zinc-300">photo</code> property is validated with
                    <code class="text-zinc-300">image|max:2048</code> — images only, 2&nbsp;MB cap —
                    the moment the temporary upload lands, before any of your code runs. Try dropping a
                    PDF or an oversized file: the server rejects it and the validation message surfaces
                    in React via <code class="text-zinc-300">useErrorBag()</code>. Client-side
                    <code class="text-zinc-300">accept</code> hints are convenience only; the server is
                    the gatekeeper.
                </p>
            </div>
        </div>
    </x-demo.section>
</div>
