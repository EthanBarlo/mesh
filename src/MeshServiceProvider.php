<?php

namespace EthanBarlo\Mesh;

use EthanBarlo\Mesh\Commands\MakeMeshComponentCommand;
use Livewire\Livewire;
use Spatie\LaravelPackageTools\Package;
use Spatie\LaravelPackageTools\PackageServiceProvider;

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
    }
}
