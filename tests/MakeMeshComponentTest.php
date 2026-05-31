<?php

use Illuminate\Support\Facades\File;

afterEach(function () {
    File::deleteDirectory(app_path('Mesh'));
    File::deleteDirectory(resource_path('mesh'));
});

it('loads the default make renderer from config', function () {
    expect(config('mesh.make.renderer'))->toBe('react');
});

it('scaffolds a react mesh component', function () {
    $this->artisan('make:mesh', ['name' => 'Counter'])
        ->assertSuccessful();

    $path = app_path('Mesh/Counter.php');
    $componentPath = resource_path('mesh/Counter/Counter.tsx');
    $entryPath = resource_path('mesh/Counter/index.ts');

    expect(File::exists($path))->toBeTrue();
    expect(File::exists($componentPath))->toBeTrue();
    expect(File::exists($entryPath))->toBeTrue();

    $contents = File::get($path);

    expect($contents)
        ->toContain('namespace App\\Mesh;')
        ->toContain('class Counter extends MeshComponent')
        ->toContain('use EthanBarlo\\Mesh\\MeshComponent;')
        ->toContain("return 'resources/mesh/Counter/index.ts';");

    expect(File::get($componentPath))
        ->toContain('export default function Counter');

    expect(File::get($entryPath))
        ->toContain('import { registerComponent } from "@mesh";')
        ->toContain('import Counter from "./Counter";')
        ->toContain('registerComponent("react", "resources/mesh/Counter/index.ts", Counter);');
});

it('supports nested component names', function () {
    $this->artisan('make:mesh', ['name' => 'Forms/Input'])
        ->assertSuccessful();

    $path = app_path('Mesh/Forms/Input.php');
    $componentPath = resource_path('mesh/Forms/Input/Input.tsx');
    $entryPath = resource_path('mesh/Forms/Input/index.ts');

    expect(File::exists($path))->toBeTrue();
    expect(File::exists($componentPath))->toBeTrue();
    expect(File::exists($entryPath))->toBeTrue();

    expect(File::get($path))
        ->toContain('namespace App\\Mesh\\Forms;')
        ->toContain('class Input extends MeshComponent')
        ->toContain("return 'resources/mesh/Forms/Input/index.ts';");

    expect(File::get($entryPath))
        ->toContain('registerComponent("react", "resources/mesh/Forms/Input/index.ts", Input);');
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

    expect(File::get(resource_path('mesh/Counter/index.ts')))
        ->toContain('registerComponent("react", "resources/mesh/Counter/index.ts", Counter);');
});

it('fails for unsupported renderer scaffolds without writing files', function () {
    $this->artisan('make:mesh', ['name' => 'Counter', '--renderer' => 'svelte'])
        ->assertFailed();

    expect(File::exists(app_path('Mesh/Counter.php')))->toBeFalse();
    expect(File::exists(resource_path('mesh/Counter/index.ts')))->toBeFalse();
});

it('does not overwrite existing generated files', function () {
    $this->artisan('make:mesh', ['name' => 'Counter'])->assertSuccessful();
    $this->artisan('make:mesh', ['name' => 'Counter'])->assertFailed();
});

it('fails when a frontend target already exists', function () {
    File::ensureDirectoryExists(resource_path('mesh/Counter'));
    File::put(resource_path('mesh/Counter/index.ts'), '// Existing entry');

    $this->artisan('make:mesh', ['name' => 'Counter'])
        ->assertFailed();

    expect(File::exists(app_path('Mesh/Counter.php')))->toBeFalse();
});
