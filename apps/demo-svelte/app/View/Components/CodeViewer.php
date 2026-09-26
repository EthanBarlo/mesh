<?php

namespace App\View\Components;

use Illuminate\Support\Facades\Cache;
use Illuminate\View\Component;
use Phiki\Grammar\Grammar;
use Phiki\Phiki;
use Phiki\Theme\Theme;

class CodeViewer extends Component
{
    /** @var array<int, array{label: string, html: string}> */
    public array $tabs = [];

    /**
     * @param  array<int, string>  $files  Paths relative to the app base path,
     *                                     restricted to app/ and resources/.
     */
    public function __construct(public array $files = [])
    {
        foreach ($files as $file) {
            $path = $this->resolvePath($file);

            if ($path === null) {
                continue;
            }

            $this->tabs[] = [
                'label' => $this->label($file),
                'html' => $this->highlight($path),
            ];
        }
    }

    protected function resolvePath(string $file): ?string
    {
        $path = realpath(base_path($file));

        $allowed = collect(['app', 'resources'])
            ->map(fn (string $dir) => realpath(base_path($dir)))
            ->filter()
            ->map(fn (string $dir) => $dir.DIRECTORY_SEPARATOR);

        if ($path === false || ! $allowed->contains(fn (string $dir) => str_starts_with($path, $dir))) {
            report(new \RuntimeException("CodeViewer: file [{$file}] is missing or outside the allowed directories."));

            return null;
        }

        return $path;
    }

    protected function label(string $file): string
    {
        $base = basename($file);

        return str_starts_with($base, 'index.')
            ? basename(dirname($file)).'/'.$base
            : $base;
    }

    protected function highlight(string $path): string
    {
        $key = 'code-viewer:'.$path.':'.filemtime($path);

        return Cache::remember($key, now()->addWeek(), function () use ($path) {
            return (string) (new Phiki)->codeToHtml(
                rtrim(file_get_contents($path)),
                $this->grammar($path),
                Theme::GithubDark,
            );
        });
    }

    protected function grammar(string $path): Grammar
    {
        return match (true) {
            str_ends_with($path, '.blade.php') => Grammar::Blade,
            str_ends_with($path, '.php') => Grammar::Php,
            str_ends_with($path, '.svelte') => Grammar::Svelte,
            str_ends_with($path, '.tsx') => Grammar::Tsx,
            str_ends_with($path, '.jsx') => Grammar::Jsx,
            str_ends_with($path, '.ts') => Grammar::Typescript,
            str_ends_with($path, '.json') => Grammar::Json,
            default => Grammar::Txt,
        };
    }

    public function render()
    {
        return view('components.code-viewer-view');
    }
}
