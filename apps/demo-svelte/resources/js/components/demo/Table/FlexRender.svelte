<!--
    Renders a TanStack column definition template (header or cell): plain
    strings render as text; functions may return a string, a component
    config (renderComponent), or a snippet config (renderSnippet).
-->
<script
    lang="ts"
    generics="TData, TValue, TContext extends HeaderContext<TData, TValue> | CellContext<TData, TValue>"
>
    import type {
        CellContext,
        ColumnDefTemplate,
        HeaderContext,
    } from "@tanstack/table-core";
    import {
        RenderComponentConfig,
        RenderSnippetConfig,
    } from "./svelte-table.svelte";

    interface Props {
        /** The `header` or `cell` field of the column definition. */
        content?: ColumnDefTemplate<TContext>;
        /** The result of the header's or cell's `getContext()`. */
        context: TContext;
    }

    let { content, context }: Props = $props();
</script>

{#if typeof content === "string"}
    {content}
{:else if content instanceof Function}
    {@const result = content(context as any)}
    {#if result instanceof RenderComponentConfig}
        {@const { component: Component, props } = result}
        <Component {...props} />
    {:else if result instanceof RenderSnippetConfig}
        {@const { snippet, params } = result}
        {@render snippet(params)}
    {:else}
        {result}
    {/if}
{/if}
