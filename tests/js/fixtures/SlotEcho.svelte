<script lang="ts">
    import type { Snippet } from "svelte";

    // Renders the Mesh default slot, which arrives as the `children` snippet.
    let { children }: { children?: Snippet } = $props();
</script>

<section>{@render children?.()}</section>
