<?php

declare(strict_types=1);

namespace EthanBarlo\Mesh\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Str;

class MakeMeshComponentCommand extends Command
{
    /**
     * The hardcoded base directory (relative to the host app root) for Mesh
     * frontend component entries. Mirrors the JS-side glob base and is NOT
     * configurable.
     */
    private const COMPONENT_BASE = 'resources/js/mesh';

    protected $signature = 'make:mesh {name} {--renderer=}';

    protected $description = 'Create a new Mesh component (PHP class + frontend entry).';

    public function handle(): int
    {
        $name = str_replace('\\', '/', (string) $this->argument('name'));
        $segments = array_filter(explode('/', $name));
        $segments = array_map(fn (string $s) => Str::studly($s), $segments);

        $relative = implode('/', $segments);
        $className = end($segments);
        $namespaceSuffix = count($segments) > 1
            ? '\\'.implode('\\', array_slice($segments, 0, -1))
            : '';

        $classNamespace = 'App\\Mesh'.$namespaceSuffix;

        // Resolve renderer
        $renderer = $this->option('renderer') ?: config('mesh.make.renderer', 'react');

        $phpTargetDir = app_path('Mesh'.($namespaceSuffix ? str_replace('\\', '/', $namespaceSuffix) : ''));
        $phpTarget = $phpTargetDir.'/'.$className.'.php';

        $jsTargetDir = base_path(self::COMPONENT_BASE.'/'.$relative);
        $jsEntry = $jsTargetDir.'/index.tsx';

        if (File::exists($phpTarget) || File::exists($jsTargetDir)) {
            $this->error('Component already exists.');

            return self::FAILURE;
        }

        // Validate renderer before writing anything.
        $rendererStubDir = __DIR__.'/../../stubs/renderers/'.$renderer;

        if (! File::isDirectory($rendererStubDir)) {
            $this->error("Unsupported renderer [{$renderer}].");

            return self::FAILURE;
        }

        // Read and prepare both stubs before writing anything, so a failure
        // reading the frontend stub can't leave a half-generated PHP component
        // behind (which would then block reruns as "already exists").
        $phpStub = str_replace(
            ['{{ namespace }}', '{{ class }}'],
            [$classNamespace, $className],
            File::get(__DIR__.'/../../stubs/mesh.component.stub')
        );

        $indexStub = str_replace(
            '{{ class }}',
            $className,
            File::get($rendererStubDir.'/index.tsx.stub')
        );

        // PHP class
        File::ensureDirectoryExists($phpTargetDir);
        File::put($phpTarget, $phpStub);

        // Frontend entry
        File::ensureDirectoryExists($jsTargetDir);
        File::put($jsEntry, $indexStub);

        $this->info('Mesh component created:');
        $this->line('  PHP:      '.$phpTarget);
        $this->line('  Frontend: '.$jsEntry);

        return self::SUCCESS;
    }
}
