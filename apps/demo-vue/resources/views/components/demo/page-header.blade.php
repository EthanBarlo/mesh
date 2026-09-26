@props(['title', 'description' => null])

<div>
    <h1 class="text-3xl sm:text-4xl font-semibold text-white tracking-tight">{{ $title }}</h1>
    @if ($description)
        <p class="mt-3 text-zinc-400 leading-relaxed max-w-2xl">{{ $description }}</p>
    @endif
</div>
