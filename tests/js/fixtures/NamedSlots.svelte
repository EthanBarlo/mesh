<script lang="ts">
    import type { Snippet } from "svelte";

    // Named Blade slots arrive as the `slots` record; the default slot stays
    // on `children` — the same contract as the React renderer.
    let {
        children,
        slots,
    }: { children?: Snippet; slots: Record<string, Snippet> } = $props();
</script>

<div>
    <header>{@render slots.header?.()}</header>
    <main>{@render children?.()}</main>
</div>
