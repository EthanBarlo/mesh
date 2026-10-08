<?php

namespace App\View\Components;

use Illuminate\Support\Facades\Cache;
use Illuminate\View\Component;
use Phiki\Grammar\Grammar;
use Phiki\Phiki;
use Phiki\Theme\ParsedTheme;
use Phiki\Theme\ThemeParser;

class CodeViewer extends Component
{
    /** Bump when the theme, grammar mapping or markup changes to drop cached highlights. */
    protected const CACHE_VERSION = 'drafting-2';

    protected const THEME = 'drafting';

    /** @var array<int, array{label: string, dir: string, name: string, path: string, lines: int, html: string}> */
    public array $tabs = [];

    /** A stable id prefix for the tab/panel ARIA wiring (stable across Livewire re-renders). */
    public string $uid;

    /**
     * @param  array<int, string>  $files  Paths relative to the app base path,
     *                                     restricted to app/ and resources/.
     */
    public function __construct(public array $files = [])
    {
        $this->uid = 'cv-'.substr(md5(implode('|', $files)), 0, 8);

        foreach ($files as $file) {
            $path = $this->resolvePath($file);

            if ($path === null) {
                continue;
            }

            [$dir, $name] = $this->labelParts($file);

            $this->tabs[] = [
                'label' => $dir.$name,
                'dir' => $dir,
                'name' => $name,
                'path' => ltrim($file, '/'),
                'lines' => substr_count(rtrim(file_get_contents($path)), "\n") + 1,
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

    /**
     * Tab label as [dimmed directory, file name]. Mesh entry files are all
     * called index.*, so they keep their component folder: "Counter/index.tsx".
     *
     * @return array{0: string, 1: string}
     */
    protected function labelParts(string $file): array
    {
        $base = basename($file);

        return str_starts_with($base, 'index.')
            ? [basename(dirname($file)).'/', $base]
            : ['', $base];
    }

    protected function highlight(string $path): string
    {
        $theme = $this->themePath();

        $key = implode(':', [
            'code-viewer',
            self::CACHE_VERSION,
            $path,
            filemtime($path),
            filemtime($theme),
        ]);

        return Cache::remember($key, now()->addWeek(), function () use ($path, $theme) {
            return (string) (new Phiki)
                ->theme(self::THEME, $this->parseTheme($theme))
                ->codeToHtml(rtrim(file_get_contents($path)), $this->grammar($path), self::THEME)
                ->withGutter();
        });
    }

    protected function themePath(): string
    {
        return resource_path('themes/'.self::THEME.'.json');
    }

    /**
     * The theme's colours are CSS variables (var(--code-keyword) and so on),
     * which Phiki passes through untouched, so one theme follows light, dark
     * and every framework accent. Each rule is split to one selector apiece:
     * Phiki scores a rule by its first matching selector, so a grouped rule
     * would let `punctuation` beat `punctuation.definition.string`.
     */
    protected function parseTheme(string $path): ParsedTheme
    {
        $theme = json_decode(file_get_contents($path), true, flags: JSON_THROW_ON_ERROR);

        $theme['tokenColors'] = collect($theme['tokenColors'])
            ->flatMap(fn (array $rule) => collect((array) ($rule['scope'] ?? []))
                ->map(fn (string $scope) => [...$rule, 'scope' => $scope]))
            ->all();

        return (new ThemeParser)->parse($theme);
    }

    protected function grammar(string $path): Grammar
    {
        return match (true) {
            str_ends_with($path, '.blade.php') => Grammar::Blade,
            str_ends_with($path, '.php') => Grammar::Php,
            str_ends_with($path, '.tsx') => Grammar::Tsx,
            str_ends_with($path, '.jsx') => Grammar::Jsx,
            str_ends_with($path, '.vue') => Grammar::Vue,
            str_ends_with($path, '.svelte') => Grammar::Svelte,
            str_ends_with($path, '.ts') => Grammar::Typescript,
            str_ends_with($path, '.js') => Grammar::Javascript,
            str_ends_with($path, '.json') => Grammar::Json,
            str_ends_with($path, '.css') => Grammar::Css,
            default => Grammar::Txt,
        };
    }

    public function render()
    {
        return view('components.code-viewer-view');
    }
}
