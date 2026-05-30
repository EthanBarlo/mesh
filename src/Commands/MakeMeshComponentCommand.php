<?php

namespace EthanBarlo\Mesh\Commands;

use Illuminate\Console\Command;
use Illuminate\Filesystem\Filesystem;
use Illuminate\Support\Str;

class MakeMeshComponentCommand extends Command
{
    protected $signature = 'make:mesh {name : The component name, e.g. Counter or Forms/Input}
                                      {--force : Overwrite the component if it already exists}';

    protected $description = 'Create a new Mesh component class';

    public function handle(Filesystem $files): int
    {
        // Normalize separators and studly-case each segment: "forms/input" -> "Forms/Input".
        $relative = collect(preg_split('/[\\/\\\\]+/', $this->argument('name')))
            ->filter()
            ->map(fn ($segment) => Str::studly($segment))
            ->implode('/');

        $class = class_basename(str_replace('/', '\\', $relative));

        $namespace = 'App\\Mesh';
        if (str_contains($relative, '/')) {
            $namespace .= '\\'.str_replace('/', '\\', dirname($relative));
        }

        $path = app_path('Mesh/'.$relative.'.php');

        if ($files->exists($path) && ! $this->option('force')) {
            $this->components->error("Mesh component already exists: {$path}");

            return self::FAILURE;
        }

        $files->ensureDirectoryExists(dirname($path));
        $files->put($path, $this->buildClass($namespace, $class));

        $this->components->info("Mesh component [{$path}] created successfully.");

        return self::SUCCESS;
    }

    protected function buildClass(string $namespace, string $class): string
    {
        $stub = file_get_contents(__DIR__.'/../../stubs/mesh.component.stub');

        return str_replace(
            ['{{ namespace }}', '{{ class }}'],
            [$namespace, $class],
            $stub
        );
    }
}
