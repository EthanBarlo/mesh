@php $meshSlots = $this->getSlots(); @endphp
<div
    data-mesh-component="{{ $this->component() }}"
    data-mesh-props="{{ json_encode($this->props()) }}"
    style="display: contents"
>
    {{-- Hidden, Livewire-MORPHED source of truth for slot content. NOT wire:ignore: Livewire keeps it
         current via fragment morphing; the renderer mirrors it into .mesh-root. Renders skip-markers
         on self-renders, which preserve the content. Every slot Livewire tracks gets a holder, even
         an empty or whitespace-only one: its fragment markers are what let the slot gain content on
         a later parent render. The JS side decides what counts as content (a whitespace-only
         default slot is not passed as children). --}}
    @if (count($meshSlots))
        <div data-mesh-slots hidden>
            @foreach ($meshSlots as $meshSlot)
                <div data-mesh-slot="{{ $meshSlot->getName() }}" wire:key="mesh-slot-{{ $meshSlot->getName() }}">{{ $meshSlot }}</div>
            @endforeach
        </div>
    @endif

    <div wire:ignore class="mesh-root" style="display: contents"></div>
</div>
