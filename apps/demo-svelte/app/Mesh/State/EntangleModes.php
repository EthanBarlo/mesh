<?php

namespace App\Mesh\State;

use EthanBarlo\Mesh\Component;

class EntangleModes extends Component
{
    /** Bound with useEntangle("message") — deferred, batches with the next request. */
    public string $message = '';

    /** Bound with useEntangle("liveMessage", true) — committed on every change. */
    public string $liveMessage = '';

    /** How many round-trips have delivered a property update to the server. */
    public int $requests = 0;

    /**
     * Not a Livewire property (protected props aren't persisted), so it resets
     * on every request — perfect for counting each round-trip exactly once,
     * even when a single request commits both messages at the same time.
     */
    protected bool $tallied = false;

    public function updated(string $property): void
    {
        $this->tallyRequest();
    }

    public function updatedLiveMessage(): void
    {
        // Live updates trigger their own round-trip the moment you type.
        $this->tallyRequest();
    }

    protected function tallyRequest(): void
    {
        if ($this->tallied) {
            return;
        }

        $this->requests++;
        $this->tallied = true;
    }

    public function props(): array
    {
        return [
            'requests' => $this->requests,
            // The values as the *server* currently knows them — so you can see
            // exactly when each sync mode actually reached PHP.
            'serverMessage' => $this->message,
            'serverLiveMessage' => $this->liveMessage,
        ];
    }
}
