<?php

/*
|--------------------------------------------------------------------------
| Demo shell
|--------------------------------------------------------------------------
|
| Everything the layouts, sidebar, sheet headers and title blocks need to
| know about this demo app. It is the only shell file that differs between
| the React, Vue and Svelte demos; every Blade view reads from here.
|
*/

return [

    // The renderer this app demonstrates. <html data-framework> picks the accent from it.
    'framework' => 'react',
    'framework_name' => 'React',
    'framework_version' => 'React 19',
    'extension' => 'tsx',

    // Drawing numbers read MESH-R03: the prefix, then the sheet number.
    'drawing_prefix' => 'MESH-R',

    // Keep in step with the package version (repo-root package.json / CHANGELOG).
    'revision' => '0.2.0',
    'package' => 'ethanbarlo/mesh',

    'docs_url' => env('MESH_DOCS_URL', 'https://mesh.ebarlow.dev'),
    'github_url' => 'https://github.com/EthanBarlo/mesh',
    'github_branch' => 'main',

    // This app's folder in the repo, for the "Source" links.
    'source_path' => 'apps/demo-react',

    // The sibling demos, for the framework switch in the masthead.
    'demos' => [
        'react' => env('MESH_DEMO_REACT_URL', 'https://mesh-demo-react.ebarlow.dev'),
        'vue' => env('MESH_DEMO_VUE_URL', 'https://mesh-demo-vue.ebarlow.dev'),
        'svelte' => env('MESH_DEMO_SVELTE_URL', 'https://mesh-demo-svelte.ebarlow.dev'),
    ],

    /*
    | The drawing register: the sidebar order, the sheet numbers and the home
    | page's demo index all come from this list. `view` is the page's Blade
    | view, relative to this app, for the title block's Source link.
    */
    'pages' => [
        [
            'group' => 'Introduction',
            'route' => 'home',
            'label' => 'Home',
            'blurb' => 'One Livewire property drives three counters: plain Livewire, Alpine and a React island.',
            'view' => 'resources/views/livewire/demo-page.blade.php',
        ],
        [
            'group' => 'Core',
            'route' => 'state',
            'label' => 'State & Props',
            'blurb' => 'Sync React state with a Livewire property, and patch props in place without a remount.',
            'view' => 'resources/views/livewire/pages/state.blade.php',
        ],
        [
            'group' => 'Core',
            'route' => 'wire',
            'label' => 'The $wire Bridge',
            'blurb' => 'Call PHP methods from React as promises, and talk over Livewire\'s event bus.',
            'view' => 'resources/views/livewire/pages/wire.blade.php',
        ],
        [
            'group' => 'Core',
            'route' => 'forms',
            'label' => 'Forms & Validation',
            'blurb' => 'Laravel validation rules run on the server; the error bag lands in the React form.',
            'view' => 'resources/views/livewire/pages/forms.blade.php',
        ],
        [
            'group' => 'Core',
            'route' => 'slots',
            'label' => 'Slots',
            'blurb' => 'Pass Blade content into React as children or named slots, and keep it reactive.',
            'view' => 'resources/views/livewire/pages/slots.blade.php',
        ],
        [
            'group' => 'Core',
            'route' => 'uploads',
            'label' => 'File Uploads',
            'blurb' => 'Upload from React through Livewire, with progress, validation and previews.',
            'view' => 'resources/views/livewire/pages/uploads.blade.php',
        ],
        [
            'group' => 'Ecosystem',
            'route' => 'table',
            'label' => 'Data Table',
            'blurb' => 'TanStack Table over orders built in PHP. Row actions are Livewire method calls.',
            'view' => 'resources/views/livewire/pages/table.blade.php',
        ],
        [
            'group' => 'Ecosystem',
            'route' => 'charts',
            'label' => 'Live Charts',
            'blurb' => 'ECharts survives every request, so new data animates from the old.',
            'view' => 'resources/views/livewire/pages/charts.blade.php',
        ],
        [
            'group' => 'Ecosystem',
            'route' => 'board',
            'label' => 'Drag & Drop Board',
            'blurb' => 'dnd-kit drags on the client; each move is saved with one $wire call.',
            'view' => 'resources/views/livewire/pages/board.blade.php',
        ],
        [
            'group' => 'Advanced',
            'route' => 'kanban',
            'label' => 'Blade-Composed Kanban',
            'blurb' => 'Livewire owns the board; each column and card is its own island in a Blade loop.',
            'view' => 'resources/views/livewire/pages/kanban.blade.php',
        ],
        [
            'group' => 'Under the Hood',
            'route' => 'architecture',
            'label' => 'Auto-discovery & Splitting',
            'blurb' => 'Every folder in resources/js/mesh becomes a component, split into its own lazy chunk.',
            'view' => 'resources/views/livewire/pages/architecture.blade.php',
        ],
    ],

];
