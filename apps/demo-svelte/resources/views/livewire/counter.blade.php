<div class="ctr" data-kind="livewire">
    <div class="ctr__head">
        <span class="tag ctr__tag">A</span>
        <p class="ctr__title">
            <span class="ctr__name">Server-rendered Livewire</span>
            <span class="ctr__via">wire:click</span>
        </p>
    </div>

    <div class="ctr__body">
        {{-- Deliberately server-rendered: this card shows what the
             SERVER currently knows. Siblings move it client-side via
             the entangled store, but this number only changes when
             this component re-renders on a request. --}}
        <span class="ctr__value">{{ $count }}</span>
        <span class="ctr__k k k--caps">$count</span>
    </div>

    <div class="ctr__actions">
        <button
            wire:click="decrement"
            type="button"
            class="btn btn--line ctr__btn"
            aria-label="Decrement counter"
        >
            −
        </button>

        <button
            wire:click="$set('count', 0)"
            type="button"
            class="btn ctr__reset"
            aria-label="Reset counter"
        >
            Reset
        </button>

        <button
            wire:click="increment"
            type="button"
            class="btn btn--solid ctr__btn"
            aria-label="Increment counter"
        >
            +
        </button>
    </div>
</div>
