@props(['title', 'description' => null, 'files' => []])

<section {{ $attributes->class(['space-y-4']) }}>
    <div>
        <h2 class="text-xl font-bold text-white">{{ $title }}</h2>
        @if ($description)
            <p class="mt-1 text-sm text-slate-400 leading-relaxed max-w-2xl">{{ $description }}</p>
        @endif
    </div>

    <div class="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
        {{ $slot }}
    </div>

    @if (count($files))
        <x-code-viewer :files="$files" />
    @endif
</section>
