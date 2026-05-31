<?php

return [
    'make' => [
        'renderer' => 'react',
    ],

    /*
     * The base directory (relative to the application root) where Mesh
     * frontend components live. This value also forms the build-path
     * contract returned by each component's component() method, so it
     * must match the path used in your Vite input entries.
     */
    'component_path' => 'resources/js/mesh',
];
