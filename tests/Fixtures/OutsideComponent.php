<?php

namespace EthanBarlo\Mesh\Tests\Fixtures;

use EthanBarlo\Mesh\MeshComponent;

// A component that lives OUTSIDE the App\Mesh namespace and does NOT override
// component(), so the base MeshComponent::component() derivation runs and throws.
class OutsideComponent extends MeshComponent
{
    //
}
