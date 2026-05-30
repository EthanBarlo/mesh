<?php

use Illuminate\Support\Facades\File;

afterEach(function () {
    File::deleteDirectory(app_path('Mesh'));
});

it('scaffolds a mesh component into app/Mesh', function () {
    $this->artisan('make:mesh', ['name' => 'Counter'])
        ->assertSuccessful();

    $path = app_path('Mesh/Counter.php');

    expect(File::exists($path))->toBeTrue();

    $contents = File::get($path);

    expect($contents)
        ->toContain('namespace App\\Mesh;')
        ->toContain('class Counter extends MeshComponent')
        ->toContain('use EthanBarlo\\Mesh\\MeshComponent;');
});

it('supports nested component names', function () {
    $this->artisan('make:mesh', ['name' => 'Forms/Input'])
        ->assertSuccessful();

    $path = app_path('Mesh/Forms/Input.php');

    expect(File::exists($path))->toBeTrue();
    expect(File::get($path))
        ->toContain('namespace App\\Mesh\\Forms;')
        ->toContain('class Input extends MeshComponent');
});

it('does not overwrite an existing component without --force', function () {
    $this->artisan('make:mesh', ['name' => 'Counter'])->assertSuccessful();
    $this->artisan('make:mesh', ['name' => 'Counter'])->assertFailed();

    $this->artisan('make:mesh', ['name' => 'Counter', '--force' => true])->assertSuccessful();
});
