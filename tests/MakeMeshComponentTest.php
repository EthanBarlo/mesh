<?php

use Illuminate\Support\Facades\File;

afterEach(function () {
    File::deleteDirectory(app_path('Mesh'));
    File::deleteDirectory(base_path('resources/js/mesh'));
    File::deleteDirectory(base_path('resources/custom'));
});

it('loads the default make renderer from config', function () {
    expect(config('mesh.make.renderer'))->toBe('react');
});

it('scaffolds a react mesh component', function () {
    $this->artisan('make:mesh', ['name' => 'Counter'])
        ->assertSuccessful();

    $path = app_path('Mesh/Counter.php');
    $componentPath = base_path('resources/js/mesh/Counter/Counter.tsx');
    $entryPath = base_path('resources/js/mesh/Counter/index.ts');

    expect(File::exists($path))->toBeTrue();
    expect(File::exists($componentPath))->toBeTrue();
    expect(File::exists($entryPath))->toBeTrue();

    $contents = File::get($path);

    expect($contents)
        ->toContain('namespace App\\Mesh;')
        ->toContain('class Counter extends MeshComponent')
        ->toContain('use EthanBarlo\\Mesh\\MeshComponent;')
        ->toContain("return 'resources/js/mesh/Counter/index.ts';");

    expect(File::get($componentPath))
        ->toContain('export default function Counter');

    expect(File::get($entryPath))
        ->toContain('import { registerComponent } from "@mesh";')
        ->toContain('import Counter from "./Counter";')
        ->toContain('registerComponent("react", "resources/js/mesh/Counter/index.ts", Counter);');
});

it('supports nested component names', function () {
    $this->artisan('make:mesh', ['name' => 'Forms/Input'])
        ->assertSuccessful();

    $path = app_path('Mesh/Forms/Input.php');
    $componentPath = base_path('resources/js/mesh/Forms/Input/Input.tsx');
    $entryPath = base_path('resources/js/mesh/Forms/Input/index.ts');

    expect(File::exists($path))->toBeTrue();
    expect(File::exists($componentPath))->toBeTrue();
    expect(File::exists($entryPath))->toBeTrue();

    expect(File::get($path))
        ->toContain('namespace App\\Mesh\\Forms;')
        ->toContain('class Input extends MeshComponent')
        ->toContain("return 'resources/js/mesh/Forms/Input/index.ts';");

    expect(File::get($entryPath))
        ->toContain('registerComponent("react", "resources/js/mesh/Forms/Input/index.ts", Input);');
});

it('uses the configured renderer when no renderer option is provided', function () {
    config()->set('mesh.make.renderer', 'vue');

    $this->artisan('make:mesh', ['name' => 'Counter'])
        ->assertFailed();

    expect(File::exists(app_path('Mesh/Counter.php')))->toBeFalse();
});

it('allows the renderer option to override config', function () {
    config()->set('mesh.make.renderer', 'vue');

    $this->artisan('make:mesh', ['name' => 'Counter', '--renderer' => 'react'])
        ->assertSuccessful();

    expect(File::get(base_path('resources/js/mesh/Counter/index.ts')))
        ->toContain('registerComponent("react", "resources/js/mesh/Counter/index.ts", Counter);');
});

it('honours a custom component_path for both the directory and the contract string', function () {
    config()->set('mesh.component_path', 'resources/custom');

    $this->artisan('make:mesh', ['name' => 'Counter'])
        ->assertSuccessful();

    $classPath = app_path('Mesh/Counter.php');
    $entryPath = base_path('resources/custom/Counter/index.ts');

    expect(File::exists($entryPath))->toBeTrue();
    expect(File::exists(base_path('resources/js/mesh/Counter/index.ts')))->toBeFalse();

    expect(File::get($classPath))
        ->toContain("return 'resources/custom/Counter/index.ts';");

    expect(File::get($entryPath))
        ->toContain('registerComponent("react", "resources/custom/Counter/index.ts", Counter);');
});

it('fails for unsupported renderer scaffolds without writing files', function () {
    $this->artisan('make:mesh', ['name' => 'Counter', '--renderer' => 'svelte'])
        ->assertFailed();

    expect(File::exists(app_path('Mesh/Counter.php')))->toBeFalse();
    expect(File::exists(base_path('resources/js/mesh/Counter/index.ts')))->toBeFalse();
});

it('does not overwrite existing generated files', function () {
    $this->artisan('make:mesh', ['name' => 'Counter'])->assertSuccessful();
    $this->artisan('make:mesh', ['name' => 'Counter'])->assertFailed();
});

it('fails when a frontend target already exists', function () {
    File::ensureDirectoryExists(base_path('resources/js/mesh/Counter'));
    File::put(base_path('resources/js/mesh/Counter/index.ts'), '// Existing entry');

    $this->artisan('make:mesh', ['name' => 'Counter'])
        ->assertFailed();

    expect(File::exists(app_path('Mesh/Counter.php')))->toBeFalse();
});
