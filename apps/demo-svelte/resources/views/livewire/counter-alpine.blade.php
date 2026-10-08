<div class="ctr" data-kind="alpine" x-data="{ count: $wire.entangle('count') }">
    <div class="ctr__head">
        <span class="tag ctr__tag">B</span>
        <p class="ctr__title">
            <span class="ctr__name">Alpine entangle</span>
            <span class="ctr__via">$wire.entangle('count')</span>
        </p>
    </div>

    <div class="ctr__body">
        <span class="ctr__value" x-text="count">{{ $count }}</span>
        <span class="ctr__k k k--caps">$count</span>
    </div>

    <div class="ctr__actions">
        <button
            x-on:click="count--"
            type="button"
            class="btn btn--line ctr__btn"
            aria-label="Decrement counter"
        >
            −
        </button>

        <button
            x-on:click="count = 0"
            type="button"
            class="btn ctr__reset"
            aria-label="Reset counter"
        >
            Reset
        </button>

        <button
            x-on:click="count++"
            type="button"
            class="btn btn--solid ctr__btn"
            aria-label="Increment counter"
        >
            +
        </button>
    </div>
</div>
