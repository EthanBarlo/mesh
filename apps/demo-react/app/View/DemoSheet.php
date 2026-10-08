<?php

namespace App\View;

use Illuminate\Support\HtmlString;
use Livewire\Livewire;

/**
 * The drawing register for the demo shell: which sheet the current page is,
 * its number, group, drawing number and neighbours, all read from
 * config('demo.pages').
 */
final class DemoSheet
{
    /**
     * Every page in register order, each with its 1-based sheet number.
     *
     * @return list<array{group: string, route: string, label: string, blurb: string, view: string, number: int}>
     */
    public static function all(): array
    {
        return collect(config('demo.pages', []))
            ->values()
            ->map(fn (array $page, int $i) => [...$page, 'number' => $i + 1])
            ->all();
    }

    /**
     * The pages grouped by their sidebar heading, in register order.
     *
     * @return array<string, list<array{group: string, route: string, label: string, blurb: string, view: string, number: int}>>
     */
    public static function groups(): array
    {
        return collect(self::all())->groupBy('group')->map->all()->all();
    }

    public static function total(): int
    {
        return count(config('demo.pages', []));
    }

    /**
     * The page being viewed. Livewire update requests hit /livewire/update, so
     * match on the path the component was first rendered at, not the route.
     *
     * @return array{group: string, route: string, label: string, blurb: string, view: string, number: int}|null
     */
    public static function current(): ?array
    {
        $path = trim(Livewire::originalPath(), '/');

        foreach (self::all() as $page) {
            if (trim(route($page['route'], [], false), '/') === $path) {
                return $page;
            }
        }

        return null;
    }

    /**
     * @return array{group: string, route: string, label: string, blurb: string, view: string, number: int}|null
     */
    public static function at(int $number): ?array
    {
        return self::all()[$number - 1] ?? null;
    }

    public static function pad(int $number): string
    {
        return str_pad((string) $number, 2, '0', STR_PAD_LEFT);
    }

    public static function drawingNo(int $number): string
    {
        return config('demo.drawing_prefix').self::pad($number);
    }

    /**
     * A GitHub link to a file in this app, e.g. the page's Blade view.
     */
    public static function sourceUrl(string $path): string
    {
        return sprintf(
            '%s/blob/%s/%s/%s',
            rtrim(config('demo.github_url'), '/'),
            config('demo.github_branch', 'main'),
            trim(config('demo.source_path'), '/'),
            ltrim($path, '/'),
        );
    }

    /**
     * Escape a plain-text description, then set `backticked` spans as inline
     * code, so page copy can stamp identifiers without writing HTML.
     */
    public static function inlineCode(?string $text): HtmlString
    {
        // Short spans never wrap, so attribute syntax like #[On] can't split after the #.
        return new HtmlString(preg_replace_callback(
            '/`([^`]+)`/',
            fn (array $match): string => mb_strlen(html_entity_decode($match[1])) <= 24
                ? '<code class="whitespace-nowrap">'.$match[1].'</code>'
                : '<code>'.$match[1].'</code>',
            e((string) $text),
        ));
    }

    /**
     * The same page in a sibling demo: the routes match across the three apps.
     */
    public static function demoUrl(string $framework): string
    {
        $path = trim(Livewire::originalPath(), '/');

        return rtrim(config("demo.demos.{$framework}"), '/').'/'.$path;
    }
}
