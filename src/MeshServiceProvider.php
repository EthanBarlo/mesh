<?php

namespace EthanBarlo\Mesh;

use EthanBarlo\Mesh\Commands\MakeMeshComponentCommand;
use Livewire\Exceptions\MethodNotFoundException;
use Livewire\Livewire;
use Spatie\LaravelPackageTools\Package;
use Spatie\LaravelPackageTools\PackageServiceProvider;

use function Livewire\on;

class MeshServiceProvider extends PackageServiceProvider
{
    public function configurePackage(Package $package): void
    {
        /*
         * This class is a Package Service Provider
         *
         * More info: https://github.com/spatie/laravel-package-tools
         */
        $package
            ->name('mesh')
            ->hasConfigFile()
            ->hasViews()
            ->hasCommand(MakeMeshComponentCommand::class);
    }

    public function packageBooted(): void
    {
        // Resolve Mesh components from the dedicated App\Mesh namespace so they
        // are clearly separated from plain Livewire components in App\Livewire.
        Livewire::addNamespace(
            'mesh',
            classNamespace: 'App\\Mesh',
            classPath: app_path('Mesh'),
        );

        // Compile `<mesh:component />` Blade tags. Note: this 'mesh' Livewire
        // *class* namespace is distinct from the 'mesh' Blade *view* namespace
        // registered by ->hasViews() — they live in separate registries.
        $this->app['blade.compiler']->precompiler(new MeshTagPrecompiler);

        // Livewire only refuses client calls to methods declared on Livewire\Component
        // itself, so the public component() and props() hooks (and any subclass override)
        // would otherwise be callable as actions from the browser. A 'call' listener rather
        // than a ComponentHook: hooks registered after Livewire boots are never wired up,
        // and the provider boot order isn't guaranteed.
        on('call', function ($component, $method) {
            if ($component instanceof Component && in_array(strtolower((string) $method), ['component', 'props'], true)) {
                throw new MethodNotFoundException($method);
            }
        });
    }
}
