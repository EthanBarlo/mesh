<?php

use Illuminate\Routing\Route;
use Illuminate\Support\Facades\Route as Router;

// Every page in routes/web.php. The last test fails when a page route is
// added or removed without updating this list.
$pages = [
    'home' => '/',
    'state' => '/state',
    'wire' => '/wire',
    'forms' => '/forms',
    'slots' => '/slots',
    'uploads' => '/uploads',
    'table' => '/table',
    'charts' => '/charts',
    'board' => '/board',
    'kanban' => '/kanban',
    'architecture' => '/architecture',
];

test('the demo page renders', function (string $uri) {
    $this->withoutVite()->get($uri)->assertOk();
})->with($pages);

test('every demo page route is listed', function () use ($pages) {
    $routes = collect(Router::getRoutes()->getRoutes())
        ->filter(fn (Route $route) => in_array('GET', $route->methods())
            && str_starts_with($route->getActionName(), 'App\\'))
        ->map(fn (Route $route) => $route->uri() === '/' ? '/' : '/'.$route->uri())
        ->sort()
        ->values()
        ->all();

    expect($routes)->toBe(collect($pages)->sort()->values()->all());
});
