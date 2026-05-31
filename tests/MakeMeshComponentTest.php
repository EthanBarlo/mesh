<?php

declare(strict_types=1);

use Illuminate\Support\Facades\File;

beforeEach(function () {
    $this->appBase = sys_get_temp_dir().'/mesh-make-'.uniqid();
    File::ensureDirectoryExists($this->appBase);

    // Point Laravel's base/app paths at our temp scratch dir.
    app()->setBasePath($this->appBase);
});

afterEach(function () {
    File::deleteDirectory($this->appBase);
});

it('creates a react component by default', function () {
    $this->artisan('make:mesh', ['name' => 'Counter'])
        ->assertExitCode(0);

    $phpFile = $this->appBase.'/app/Mesh/Counter.php';
    expect(File::exists($phpFile))->toBeTrue();

    $contents = File::get($phpFile);
    expect($contents)->toContain('class Counter extends Component');
    expect($contents)->not->toContain('function component()');

    $jsEntry = $this->appBase.'/resources/js/mesh/Counter/index.tsx';
    expect(File::exists($jsEntry))->toBeTrue();

    $jsContents = File::get($jsEntry);
    expect($jsContents)->not->toContain('registerComponent');
});

it('creates a nested component', function () {
    $this->artisan('make:mesh', ['name' => 'Forms/Input'])
        ->assertExitCode(0);

    $phpFile = $this->appBase.'/app/Mesh/Forms/Input.php';
    expect(File::exists($phpFile))->toBeTrue();

    $contents = File::get($phpFile);
    expect($contents)->toContain('namespace App\\Mesh\\Forms;');
    expect($contents)->toContain('class Input extends Component');

    $jsEntry = $this->appBase.'/resources/js/mesh/Forms/Input/index.tsx';
    expect(File::exists($jsEntry))->toBeTrue();
});

it('respects the renderer option', function () {
    $this->artisan('make:mesh', ['name' => 'Fancy', '--renderer' => 'react'])
        ->assertExitCode(0);

    $jsEntry = $this->appBase.'/resources/js/mesh/Fancy/index.tsx';
    expect(File::exists($jsEntry))->toBeTrue();
});

it('fails for unsupported renderer', function () {
    $this->artisan('make:mesh', ['name' => 'Broken', '--renderer' => 'vue'])
        ->assertExitCode(1);
});

it('does not overwrite an existing component', function () {
    File::ensureDirectoryExists($this->appBase.'/app/Mesh');
    File::put($this->appBase.'/app/Mesh/Counter.php', '<?php // existing');

    $this->artisan('make:mesh', ['name' => 'Counter'])
        ->assertExitCode(1);
});
