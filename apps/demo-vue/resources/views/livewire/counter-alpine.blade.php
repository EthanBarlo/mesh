<div class="relative group" x-data="{ count: $wire.entangle('count') }">
    <!-- Card -->
    <div class="relative p-8 rounded-xl bg-white/[0.02] border border-white/5">
        <div class="text-center">
            <span class="text-xs font-medium uppercase tracking-widest text-zinc-500 mb-4 block">
                Livewire + Alpine Counter
            </span>

            <!-- Counter Display -->
            <div class="my-6">
                <span
                    class="text-7xl font-semibold tracking-tight tabular-nums text-white"
                    x-text="count"
                >0</span>
            </div>

            <!-- Buttons -->
            <div class="flex items-center justify-center gap-3">
                <button
                    x-on:click="count--"
                    type="button"
                    class="w-14 h-14 rounded-lg border border-white/10 text-zinc-400 text-2xl font-medium hover:text-white hover:border-white/20 active:scale-95 transition-colors duration-150 flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-white/20 focus:ring-offset-2 focus:ring-offset-zinc-950"
                    aria-label="Decrement counter"
                    tabindex="0"
                >
                    -
                </button>

                <button
                    x-on:click="count = 0"
                    type="button"
                    class="px-5 h-14 rounded-lg text-zinc-500 text-sm font-medium hover:text-white active:scale-95 transition-colors duration-150 flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-white/20 focus:ring-offset-2 focus:ring-offset-zinc-950"
                    aria-label="Reset counter"
                    tabindex="0"
                >
                    Reset
                </button>

                <button
                    x-on:click="count++"
                    type="button"
                    class="w-14 h-14 rounded-lg bg-white text-zinc-950 text-2xl font-medium hover:bg-zinc-200 active:scale-95 transition-colors duration-150 flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-white/40 focus:ring-offset-2 focus:ring-offset-zinc-950"
                    aria-label="Increment counter"
                    tabindex="0"
                >
                    +
                </button>
            </div>
        </div>
    </div>
</div>
