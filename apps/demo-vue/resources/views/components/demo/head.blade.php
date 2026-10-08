@props(['title' => null])

<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">

<title>{{ $title ?? 'Mesh '.config('demo.framework_name').' demo' }}</title>

{{--
    Theme before first paint: localStorage['mesh-demo-theme'] is light, dark or
    system (the default). Toggling flips .dark on <html> and dispatches
    window `demo:theme` ({ detail: { dark } }) so canvas/chart code can re-read
    the CSS variables. The same script wires the theme toggle, the mobile
    sheet index (drawer) and the framework switch with listeners on the
    document, so they keep working across body swaps (wire:navigate).
--}}
<script>
    (function () {
        var root = document.documentElement;
        var KEY = 'mesh-demo-theme';
        var media = window.matchMedia('(prefers-color-scheme: dark)');

        function stored() {
            try {
                var value = localStorage.getItem(KEY);

                return value === 'light' || value === 'dark' ? value : 'system';
            } catch (e) {
                return 'system';
            }
        }

        function apply(announce) {
            var pref = stored();
            var dark = pref === 'dark' || (pref === 'system' && media.matches);
            var changed = root.classList.contains('dark') !== dark;

            root.classList.toggle('dark', dark);
            root.style.colorScheme = dark ? 'dark' : 'light';
            root.setAttribute('data-theme-pref', pref);

            document.querySelectorAll('[data-theme-toggle]').forEach(function (button) {
                button.setAttribute('aria-pressed', dark ? 'true' : 'false');
            });

            if (announce && changed) {
                window.dispatchEvent(new CustomEvent('demo:theme', { detail: { dark: dark } }));
            }
        }

        apply(false);

        if (window.__meshDemoShell) {
            return;
        }
        window.__meshDemoShell = true;

        function setTheme(value) {
            try {
                localStorage.setItem(KEY, value);
            } catch (e) {}

            // Swap colours in one frame, without every hover transition easing along.
            root.classList.add('theme-switching');
            apply(true);
            requestAnimationFrame(function () {
                requestAnimationFrame(function () {
                    root.classList.remove('theme-switching');
                });
            });
        }

        function setNav(open, restoreFocus) {
            root.classList.toggle('nav-open', open);

            document.querySelectorAll('[data-nav-toggle]').forEach(function (button) {
                button.setAttribute('aria-expanded', open ? 'true' : 'false');
            });

            if (open) {
                var nav = document.getElementById('demo-nav');
                var target = nav && (nav.querySelector('[aria-current="page"]') || nav.querySelector('a'));

                if (target) {
                    target.focus();
                }
            } else if (restoreFocus) {
                var toggle = document.querySelector('[data-nav-toggle]');

                if (toggle) {
                    toggle.focus();
                }
            }
        }

        function resetSwitches() {
            document.querySelectorAll('.fw-switch__track[data-current]').forEach(function (track) {
                var current = track.getAttribute('data-current');

                track.setAttribute('data-active', current);
                track.querySelectorAll('[data-fw-index]').forEach(function (option) {
                    if (option.getAttribute('data-fw-index') === current) {
                        option.setAttribute('data-state', 'active');
                    } else {
                        option.removeAttribute('data-state');
                    }
                });
            });
        }

        document.addEventListener('click', function (event) {
            var el = event.target instanceof Element ? event.target : null;

            if (! el) {
                return;
            }

            if (el.closest('[data-theme-toggle]')) {
                setTheme(root.classList.contains('dark') ? 'light' : 'dark');

                return;
            }

            if (el.closest('[data-nav-toggle]')) {
                setNav(! root.classList.contains('nav-open'));

                return;
            }

            if (el.closest('[data-nav-close]')) {
                setNav(false);

                return;
            }

            // Framework switch: slide the ink block to the chosen renderer while the sibling demo loads.
            var option = el.closest('[data-fw-index]');

            if (option && event.button === 0 && ! event.metaKey && ! event.ctrlKey && ! event.shiftKey && ! event.altKey) {
                var track = option.closest('.fw-switch__track');

                if (track) {
                    track.setAttribute('data-active', option.getAttribute('data-fw-index'));
                    track.querySelectorAll('[data-fw-index]').forEach(function (other) {
                        if (other === option) {
                            other.setAttribute('data-state', 'active');
                        } else {
                            other.removeAttribute('data-state');
                        }
                    });
                }
            }
        });

        document.addEventListener('keydown', function (event) {
            if (event.key === 'Escape' && root.classList.contains('nav-open')) {
                setNav(false, true);
            }
        });

        window.matchMedia('(min-width: 1024px)').addEventListener('change', function (event) {
            if (event.matches) {
                setNav(false);
            }
        });

        media.addEventListener('change', function () {
            if (stored() === 'system') {
                apply(true);
            }
        });

        // Back/forward cache: restore the switch and close the drawer.
        window.addEventListener('pageshow', function (event) {
            if (event.persisted) {
                resetSwitches();
                setNav(false);
            }
        });

        document.addEventListener('DOMContentLoaded', function () {
            apply(false);
        });

        document.addEventListener('livewire:navigated', function () {
            apply(false);
            setNav(false);
        });
    })();
</script>

<link rel="preconnect" href="https://fonts.bunny.net">
<link href="https://fonts.bunny.net/css?family=inter-tight:400,500,600,700|ibm-plex-mono:400,500&display=swap" rel="stylesheet" />

@livewireStyles
{{-- React's Fast Refresh preamble must load before the app in Vite dev; it prints nothing in a production build. --}}
@if (config('demo.framework') === 'react')
    @viteReactRefresh
@endif
@vite(['resources/css/app.css', 'resources/js/app.ts'])

<style>
    [x-cloak] { display: none !important; }
</style>
