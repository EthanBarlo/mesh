<?php

namespace App\Mesh\Forms;

use EthanBarlo\Mesh\Component;
use Livewire\Attributes\Validate;

class ProjectForm extends Component
{
    #[Validate('required|min:3')]
    public string $name = '';

    #[Validate('required|regex:/^[a-z0-9-]+$/|min:3')]
    public string $slug = '';

    #[Validate('required|email')]
    public string $email = '';

    #[Validate('in:starter,pro,team')]
    public string $plan = 'starter';

    /**
     * The slug input is live-entangled on the Svelte side, so this hook
     * runs on every keystroke — re-validating just the slug each time.
     */
    public function updatedSlug(): void
    {
        $this->validateOnly('slug');
    }

    public function save(): array
    {
        $this->validate();

        // No persistence in this demo — return a fake created project
        // built from the submitted values.
        return [
            'ok' => true,
            'project' => [
                'id' => 'proj_'.substr(md5($this->slug), 0, 8),
                'name' => $this->name,
                'slug' => $this->slug,
                'owner' => $this->email,
                'plan' => $this->plan,
                'url' => 'https://mesh.test/projects/'.$this->slug,
            ],
        ];
    }

    public function props(): array
    {
        return [
            'plans' => [
                ['id' => 'starter', 'label' => 'Starter', 'price' => '$0', 'blurb' => 'Side projects & experiments'],
                ['id' => 'pro', 'label' => 'Pro', 'price' => '$12', 'blurb' => 'Solo builders shipping for real'],
                ['id' => 'team', 'label' => 'Team', 'price' => '$39', 'blurb' => 'Shared workspaces & roles'],
            ],
        ];
    }
}
