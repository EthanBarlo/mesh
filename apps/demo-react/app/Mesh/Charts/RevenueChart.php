<?php

namespace App\Mesh\Charts;

use Carbon\CarbonImmutable;
use EthanBarlo\Mesh\Component;

class RevenueChart extends Component
{
    public string $range = '30d';

    public function props(): array
    {
        $data = $this->seriesFor($this->range);

        return [
            'labels' => $data['labels'],
            'series' => [
                'revenue' => $data['revenue'],
                'orders' => $data['orders'],
            ],
            'range' => $this->range,
        ];
    }

    /**
     * Deterministic, seeded revenue data. The same range always produces the
     * same series — the only thing that changes the chart is the range itself,
     * recomputed here on the server every Livewire render.
     *
     * @return array{labels: list<string>, revenue: list<int>, orders: list<int>}
     */
    private function seriesFor(string $range): array
    {
        // 7d / 30d are daily points; 90d switches to weekly buckets.
        [$points, $stepDays] = match ($range) {
            '7d' => [7, 1],
            '90d' => [13, 7],
            default => [30, 1],
        };

        $end = CarbonImmutable::create(2026, 6, 7);
        $start = $end->subDays(($points - 1) * $stepDays);

        $labels = [];
        $revenue = [];
        $orders = [];

        for ($i = 0; $i < $points; $i++) {
            $date = $start->addDays($i * $stepDays);
            $d = $date->dayOfYear;

            // Pseudo-random but fully deterministic:
            // steady growth + a weekly cycle + two sine "noise" terms.
            $rev = 5200.0
                + $d * 28
                + sin($d * 2 * M_PI / 7) * 600
                + sin($d * 12.9898) * 340
                + cos($d * 4.1414) * 260;

            $ord = 96.0
                + $d * 0.45
                + sin($d * 2 * M_PI / 7 + 1.3) * 14
                + cos($d * 7.7) * 8;

            $labels[] = $date->format('M j');

            // Weekly buckets aggregate ~7 days of sales.
            $revenue[] = (int) round($rev * $stepDays);
            $orders[] = (int) round($ord * $stepDays);
        }

        return ['labels' => $labels, 'revenue' => $revenue, 'orders' => $orders];
    }
}
