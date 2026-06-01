@php $meshSlots = $this->getSlots(); @endphp
<div
    data-mesh-component="{{ $this->component() }}"
    data-mesh-props="{{ json_encode($this->props()) }}"
>
    {{-- Hidden, Livewire-MORPHED source of truth for slot content. NOT wire:ignore: Livewire keeps it
         current via fragment morphing; React mirrors it into .mesh-root. Renders skip-markers on
         self-renders, which preserve the content. --}}
    @if (count($meshSlots))
        <div data-mesh-slots hidden>
            @foreach ($meshSlots as $meshSlot)
                <div data-mesh-slot="{{ $meshSlot->getName() }}" wire:key="mesh-slot-{{ $meshSlot->getName() }}">{{ $meshSlot }}</div>
            @endforeach
        </div>
    @endif

    <div wire:ignore class="mesh-root"></div>
</div>
