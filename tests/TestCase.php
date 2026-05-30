<?php

namespace EthanBarlo\Mesh\Tests;

use EthanBarlo\Mesh\MeshServiceProvider;
use Livewire\LivewireServiceProvider;
use Orchestra\Testbench\TestCase as Orchestra;

class TestCase extends Orchestra
{
    protected function getPackageProviders($app)
    {
        return [
            LivewireServiceProvider::class,
            MeshServiceProvider::class,
        ];
    }

    protected function getEnvironmentSetUp($app): void
    {
        // Livewire encrypts component snapshots, which requires an app key.
        $app['config']->set('app.key', 'base64:'.base64_encode(random_bytes(32)));
    }
}
