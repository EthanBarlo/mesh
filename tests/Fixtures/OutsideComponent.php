<?php

namespace EthanBarlo\Mesh\Tests\Fixtures;

use EthanBarlo\Mesh\Component;

// A component that lives OUTSIDE the App\Mesh namespace and does NOT override
// component(), so the base Component::component() derivation runs and throws.
class OutsideComponent extends Component
{
    //
}
