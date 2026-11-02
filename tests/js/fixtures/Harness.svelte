<script lang="ts">
    // Runs a callback during component init, so tests can call composables
    // (which need a component context for getContext/onDestroy) and capture
    // their results. `text` renders reactive state, to assert re-renders.
    let { run, text }: { run: () => void; text?: () => string } = $props();

    // svelte-ignore state_referenced_locally -- the initial value is exactly
    // what an init hook wants.
    run();
</script>

{text?.() ?? ""}
