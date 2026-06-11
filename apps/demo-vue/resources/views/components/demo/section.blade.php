@props(['title', 'description' => null, 'files' => []])

<section {{ $attributes->class(['space-y-4']) }}>
    <div>
        <h2 class="text-xl font-semibold text-white tracking-tight">{{ $title }}</h2>
        @if ($description)
            <p class="mt-1 text-sm text-zinc-400 leading-relaxed max-w-2xl">{{ $description }}</p>
        @endif
    </div>

    <div class="p-6 rounded-xl bg-white/[0.02] border border-white/5">
        {{ $slot }}
    </div>

    @if (count($files))
        <x-code-viewer :files="$files" />
    @endif
</section>
