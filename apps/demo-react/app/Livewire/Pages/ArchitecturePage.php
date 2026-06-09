<?php

namespace App\Livewire\Pages;

use FilesystemIterator;
use Livewire\Attributes\Layout;
use Livewire\Attributes\Title;
use Livewire\Component;
use RecursiveDirectoryIterator;
use RecursiveIteratorIterator;
use SplFileInfo;

#[Layout('components.layouts.demo')]
#[Title('Auto-discovery & Code Splitting · Mesh Demo')]
class ArchitecturePage extends Component
{
    /**
     * Which demo components are currently rendered. Everything starts off,
     * so none of their JS chunks are requested until you toggle them on.
     *
     * @var array<int, string>
     */
    public array $loaded = [];

    public function toggle(string $key): void
    {
        $this->loaded = in_array($key, $this->loaded, true)
            ? array_values(array_diff($this->loaded, [$key]))
            : [...$this->loaded, $key];
    }

    /**
     * The same discovery Mesh performs at build time, re-done live for this
     * page: every folder under resources/js/mesh with an index.tsx/index.jsx
     * is a component. The id is the folder path, and the PHP class is derived
     * from it by swapping slashes for namespace separators.
     *
     * @return array<int, array{id: string, entry: string, class: string, classExists: bool}>
     */
    protected function manifest(): array
    {
        $base = resource_path('js/mesh');
        $entries = [];

        $files = new RecursiveIteratorIterator(
            new RecursiveDirectoryIterator($base, FilesystemIterator::SKIP_DOTS)
        );

        /** @var SplFileInfo $file */
        foreach ($files as $file) {
            if (! in_array($file->getFilename(), ['index.tsx', 'index.jsx'], true)) {
                continue;
            }

            $id = str_replace('\\', '/', substr($file->getPath(), strlen($base) + 1));

            $entries[] = [
                'id' => $id,
                'entry' => 'resources/js/mesh/'.$id.'/'.$file->getFilename(),
                'class' => 'App\\Mesh\\'.str_replace('/', '\\', $id),
                'classExists' => file_exists(app_path('Mesh/'.$id.'.php')),
            ];
        }

        usort($entries, fn (array $a, array $b) => strcmp($a['id'], $b['id']));

        return $entries;
    }

    public function render()
    {
        return view('livewire.pages.architecture', [
            'manifest' => $this->manifest(),
        ]);
    }
}
