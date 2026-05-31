<?php

namespace EthanBarlo\Mesh\Commands;

use Illuminate\Console\Command;
use Illuminate\Filesystem\Filesystem;
use Illuminate\Support\Str;

class MakeMeshComponentCommand extends Command
{
    protected $signature = 'make:mesh {name : The component name, e.g. Counter or Forms/Input}
                                      {--force : Reserved for compatibility; generated files are not overwritten}
                                      {--renderer= : The frontend renderer scaffold to generate}';

    protected $description = 'Create a new Mesh component class';

    public function handle(Filesystem $files): int
    {
        // Normalize separators and studly-case each segment: "forms/input" -> "Forms/Input".
        $relative = collect(preg_split('/[\\/\\\\]+/', $this->argument('name')))
            ->filter()
            ->map(fn ($segment) => Str::studly($segment))
            ->implode('/');

        $class = class_basename(str_replace('/', '\\', $relative));
        $renderer = $this->renderer();
        $component = 'resources/mesh/'.$relative.'/index.ts';

        $namespace = 'App\\Mesh';
        if (str_contains($relative, '/')) {
            $namespace .= '\\'.str_replace('/', '\\', dirname($relative));
        }

        $path = app_path('Mesh/'.$relative.'.php');
        $frontendDirectory = resource_path('mesh/'.$relative);
        $frontendFiles = $this->frontendFiles($files, $renderer, $frontendDirectory, $class);

        if ($frontendFiles === []) {
            return self::FAILURE;
        }

        foreach ([$path, ...array_values($frontendFiles)] as $target) {
            if ($files->exists($target)) {
                $this->components->error("Mesh component target already exists: {$target}");

                return self::FAILURE;
            }
        }

        $files->ensureDirectoryExists(dirname($path));
        $files->put($path, $this->buildClass($namespace, $class, $component));

        $files->ensureDirectoryExists($frontendDirectory);
        foreach ($frontendFiles as $stub => $target) {
            $files->put($target, $this->buildFrontend($stub, $renderer, $component, $class));
        }

        $this->components->info("Mesh component [{$path}] created successfully.");
        $this->components->info("Mesh {$renderer} files [{$frontendDirectory}] created successfully.");

        return self::SUCCESS;
    }

    protected function renderer(): string
    {
        return Str::lower($this->option('renderer') ?: config('mesh.make.renderer', 'react') ?: 'react');
    }

    /**
     * @return array<string, string>
     */
    protected function frontendFiles(Filesystem $files, string $renderer, string $directory, string $class): array
    {
        $stubDirectory = __DIR__.'/../../stubs/renderers/'.$renderer;

        if (! $files->isDirectory($stubDirectory)) {
            $this->components->error("Mesh renderer scaffold [{$renderer}] is not supported.");

            return [];
        }

        $stubs = collect($files->files($stubDirectory))
            ->filter(fn ($file) => str_ends_with($file->getFilename(), '.stub'))
            ->sortBy(fn ($file) => $file->getFilename());

        if ($stubs->isEmpty()) {
            $this->components->error("Mesh renderer scaffold [{$renderer}] does not contain any stubs.");

            return [];
        }

        return $stubs
            ->mapWithKeys(fn ($file) => [
                $file->getRealPath() => $directory.'/'.$this->buildStubFilename($file->getFilename(), $class),
            ])
            ->all();
    }

    protected function buildStubFilename(string $filename, string $class): string
    {
        return str_replace(
            ['{{ class }}'],
            [$class],
            Str::beforeLast($filename, '.stub')
        );
    }

    protected function buildClass(string $namespace, string $class, string $component): string
    {
        $stub = file_get_contents(__DIR__.'/../../stubs/mesh.component.stub');

        return str_replace(
            ['{{ namespace }}', '{{ class }}', '{{ component }}'],
            [$namespace, $class, $component],
            $stub
        );
    }

    protected function buildFrontend(string $stub, string $renderer, string $component, string $class): string
    {
        return str_replace(
            ['{{ renderer }}', '{{ component }}', '{{ class }}'],
            [$renderer, $component, $class],
            file_get_contents($stub)
        );
    }
}
