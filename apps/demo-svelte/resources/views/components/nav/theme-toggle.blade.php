{{-- Sheet colour: one button, two cells. The inked cell follows .dark on <html>, so it is right before any script runs. --}}
<button
    type="button"
    {{ $attributes->class(['theme-tg']) }}
    data-theme-toggle
    aria-pressed="false"
    aria-label="Dark theme"
    title="Toggle dark theme"
>
    <span class="theme-tg__cell theme-tg__cell--light" aria-hidden="true">
        <svg viewBox="0 0 16 16" width="14" height="14" focusable="false">
            <circle cx="8" cy="8" r="2.75" fill="none" stroke="currentColor" stroke-width="1.25" />
            <path d="M8 1.5v1.75M8 12.75v1.75M1.5 8h1.75M12.75 8h1.75M3.4 3.4l1.24 1.24M11.36 11.36l1.24 1.24M3.4 12.6l1.24-1.24M11.36 4.64l1.24-1.24" fill="none" stroke="currentColor" stroke-width="1.25" />
        </svg>
    </span>
    <span class="theme-tg__cell theme-tg__cell--dark" aria-hidden="true">
        <svg viewBox="0 0 16 16" width="14" height="14" focusable="false">
            <path d="M13.25 9.9A5.5 5.5 0 0 1 6.1 2.75a5.5 5.5 0 1 0 7.15 7.15Z" fill="none" stroke="currentColor" stroke-width="1.25" stroke-linejoin="round" />
        </svg>
    </span>
</button>
