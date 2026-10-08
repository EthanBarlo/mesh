@if (count($tabs))
    <div
        x-data="{
            tab: 0,
            copied: false,
            timer: null,
            select(i) {
                this.tab = (i + {{ count($tabs) }}) % {{ count($tabs) }};
                this.$nextTick(() => this.$refs.tabs.children[this.tab]?.focus());
            },
            copy() {
                const code = this.$refs.panels.children[this.tab]?.querySelector('code');
                if (! code) return;
                const clone = code.cloneNode(true);
                clone.querySelectorAll('.line-number').forEach((n) => n.remove());
                navigator.clipboard?.writeText(clone.textContent).then(() => {
                    this.copied = true;
                    clearTimeout(this.timer);
                    this.timer = setTimeout(() => (this.copied = false), 1800);
                }).catch(() => {});
            },
        }"
        {{ $attributes->class(['cv']) }}
    >
        <div class="cv__head">
            <span class="cv__k k k--caps" aria-hidden="true">Source</span>
            <div class="cv__tabs" role="tablist" aria-label="Source files" x-ref="tabs">
                @foreach ($tabs as $i => $t)
                    <button
                        type="button"
                        role="tab"
                        id="{{ $uid }}-tab-{{ $i }}"
                        aria-controls="{{ $uid }}-panel-{{ $i }}"
                        aria-selected="{{ $i === 0 ? 'true' : 'false' }}"
                        tabindex="{{ $i === 0 ? '0' : '-1' }}"
                        :aria-selected="tab === {{ $i }} ? 'true' : 'false'"
                        :tabindex="tab === {{ $i }} ? 0 : -1"
                        @click="tab = {{ $i }}"
                        @keydown.right.prevent="select({{ $i + 1 }})"
                        @keydown.left.prevent="select({{ $i - 1 }})"
                        @keydown.home.prevent="select(0)"
                        @keydown.end.prevent="select({{ count($tabs) - 1 }})"
                        class="cv__tab"
                        title="{{ $t['path'] }}"
                    >@if ($t['dir'])<span class="cv__tab-dir">{{ $t['dir'] }}</span>@endif{{ $t['name'] }}</button>
                @endforeach
            </div>
            <button
                type="button"
                class="cv__copy"
                :class="{ 'is-done': copied }"
                @click="copy()"
                aria-label="Copy source"
            >
                <span class="cv__copy-icons" aria-hidden="true">
                    <svg class="cv__copy-idle" viewBox="0 0 16 16" width="14" height="14" focusable="false">
                        <rect x="5.5" y="5.5" width="8" height="8" fill="none" stroke="currentColor" stroke-width="1.25" />
                        <path d="M10.5 3.5V2.5h-8v8h1" fill="none" stroke="currentColor" stroke-width="1.25" />
                    </svg>
                    <svg class="cv__copy-done" viewBox="0 0 16 16" width="14" height="14" focusable="false">
                        <path d="M3 8.5 6.5 12 13 4.5" fill="none" stroke="currentColor" stroke-width="1.5" />
                    </svg>
                </span>
                <span class="cv__copy-label" x-text="copied ? 'Copied' : 'Copy'">Copy</span>
            </button>
            <span class="sr-only" aria-live="polite" x-text="copied ? 'Copied to clipboard' : ''"></span>
        </div>

        <div class="cv__panels" x-ref="panels">
            @foreach ($tabs as $i => $t)
                <div
                    role="tabpanel"
                    id="{{ $uid }}-panel-{{ $i }}"
                    aria-labelledby="{{ $uid }}-tab-{{ $i }}"
                    class="cv__panel"
                    x-show="tab === {{ $i }}"
                    @if ($i > 0) x-cloak @endif
                >
                    <p class="cv__path k">
                        <span class="cv__path-file">{{ $t['path'] }}</span>
                        <span class="cv__path-lines">{{ $t['lines'] }} {{ Str::plural('line', $t['lines']) }}</span>
                    </p>
                    <div class="cv__code" tabindex="0" aria-label="{{ $t['label'] }} source">{!! $t['html'] !!}</div>
                </div>
            @endforeach
        </div>
    </div>
@endif
