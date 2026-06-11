<script lang="ts">
    // Echoes a prop and reports each component init, so tests can assert
    // that prop updates re-render in place rather than remounting.
    let { label, onInit }: { label: string; onInit?: () => void } = $props();

    // svelte-ignore state_referenced_locally -- the initial value is exactly
    // what an init hook wants.
    onInit?.();
</script>

<p>hello {label}</p>
