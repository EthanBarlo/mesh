<?php

namespace App\Mesh\Uploads;

use EthanBarlo\Mesh\Component;
use Livewire\Attributes\Validate;
use Livewire\WithFileUploads;

class Dropzone extends Component
{
    use WithFileUploads;

    /**
     * Server-enforced rules: images only, 2MB cap. Livewire validates the
     * temporary upload the moment it lands — before your code ever sees it.
     */
    #[Validate('image|max:2048')]
    public $photo = null;

    public function props(): array
    {
        return [
            'maxKilobytes' => 2048,
            'accept' => 'image/*',
        ];
    }

    /**
     * Called from React after the temporary upload finishes. The file only
     * exists in Livewire's temp storage — nothing is persisted.
     */
    public function inspect(): ?array
    {
        if (! $this->photo) {
            return null;
        }

        // The temp upload lands before property validation settles, so a
        // rejected file can still reach here — validate before touching it.
        $this->validate();

        return [
            'name' => $this->photo->getClientOriginalName(),
            'size' => $this->photo->getSize(),
            'mime' => $this->photo->getMimeType(),
            // Signed, short-lived URL served by Livewire's preview-file route.
            'previewUrl' => $this->photo->isPreviewable() ? $this->photo->temporaryUrl() : null,
            // Temp filename, needed by $wire.$removeUpload on the client.
            'tmpFilename' => $this->photo->getFilename(),
        ];
    }

    public function clear(): void
    {
        $this->photo = null;
        $this->resetValidation();
    }
}
