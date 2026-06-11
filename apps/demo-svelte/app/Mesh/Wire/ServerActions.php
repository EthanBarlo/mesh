<?php

namespace App\Mesh\Wire;

use EthanBarlo\Mesh\Component;

class ServerActions extends Component
{
    /**
     * Roll three dice on the server. Called from Svelte via wire.$call('rollDice')
     * — the return value resolves the Promise on the client.
     */
    public function rollDice(): array
    {
        $dice = [random_int(1, 6), random_int(1, 6), random_int(1, 6)];

        return [
            'dice' => $dice,
            'total' => array_sum($dice),
        ];
    }

    /**
     * Analyze a piece of text server-side. Arguments passed to wire.$call()
     * arrive as ordinary method parameters.
     */
    public function analyze(string $text): array
    {
        $words = preg_split('/\s+/u', trim($text), -1, PREG_SPLIT_NO_EMPTY) ?: [];

        $longest = '';
        foreach ($words as $word) {
            $stripped = preg_replace('/[^\p{L}\p{N}\'-]/u', '', $word) ?? $word;
            if (mb_strlen($stripped) > mb_strlen($longest)) {
                $longest = $stripped;
            }
        }

        return [
            'words' => count($words),
            'characters' => mb_strlen($text),
            'longestWord' => $longest,
            // Proof the work happened on the server, not in the browser.
            'analyzedAt' => now()->format('H:i:s.v'),
        ];
    }

    public function props(): array
    {
        return [
            'placeholder' => 'Type a sentence, then let the server take it apart…',
        ];
    }
}
