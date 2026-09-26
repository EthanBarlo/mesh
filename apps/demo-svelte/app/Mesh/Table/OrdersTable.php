<?php

namespace App\Mesh\Table;

use DateInterval;
use DateTimeImmutable;
use EthanBarlo\Mesh\Component;

class OrdersTable extends Component
{
    /**
     * The full dataset lives on the Livewire component, so server methods can
     * mutate it and props() hands the fresh copy back to Svelte each render.
     *
     * @var array<int, array{id: int, customer: string, status: string, amount: int, date: string, flagged: bool}>
     */
    public array $orders = [];

    public function mount(): void
    {
        $this->orders = $this->buildOrders();
    }

    /**
     * Toggle the flag on a single order. Livewire re-renders, props()
     * recomputes, and Mesh patches the new rows into the Svelte table.
     */
    public function flagOrder(int $id): void
    {
        foreach ($this->orders as $index => $order) {
            if ($order['id'] === $id) {
                $this->orders[$index]['flagged'] = ! $order['flagged'];

                return;
            }
        }
    }

    public function props(): array
    {
        return [
            'orders' => $this->orders,
        ];
    }

    /**
     * 250 deterministic fake orders — the RNG is seeded, so every page load
     * (and every visitor) sees exactly the same dataset. No faker, no DB.
     *
     * @return array<int, array{id: int, customer: string, status: string, amount: int, date: string, flagged: bool}>
     */
    protected function buildOrders(): array
    {
        mt_srand(42);

        $firstNames = [
            'Ada', 'Grace', 'Alan', 'Edsger', 'Barbara', 'Donald', 'Margaret',
            'Linus', 'Bjarne', 'Anders', 'Yukihiro', 'Brendan', 'Rasmus',
            'Guido', 'Dennis', 'Ken', 'Radia', 'Frances', 'Katherine', 'Tim',
        ];

        $lastNames = [
            'Lovelace', 'Hopper', 'Turing', 'Dijkstra', 'Liskov', 'Knuth',
            'Hamilton', 'Torvalds', 'Stroustrup', 'Hejlsberg', 'Matsumoto',
            'Eich', 'Lerdorf', 'van Rossum', 'Ritchie', 'Thompson', 'Perlman',
            'Allen', 'Johnson', 'Berners-Lee',
        ];

        $statuses = ['pending', 'paid', 'shipped', 'refunded'];

        // Fixed anchor date keeps the dataset byte-identical across requests.
        $anchor = new DateTimeImmutable('2026-06-01');

        $orders = [];

        for ($i = 1; $i <= 250; $i++) {
            $daysAgo = mt_rand(0, 364);

            $orders[] = [
                'id' => 1000 + $i,
                'customer' => $firstNames[mt_rand(0, count($firstNames) - 1)]
                    .' '
                    .$lastNames[mt_rand(0, count($lastNames) - 1)],
                'status' => $statuses[mt_rand(0, count($statuses) - 1)],
                // Amount in cents: $4.50 – $985.00
                'amount' => mt_rand(450, 98500),
                'date' => $anchor->sub(new DateInterval("P{$daysAgo}D"))->format('Y-m-d'),
                'flagged' => mt_rand(1, 100) <= 6,
            ];
        }

        return $orders;
    }
}
