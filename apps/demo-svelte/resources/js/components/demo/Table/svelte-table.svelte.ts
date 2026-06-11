import type { Component, ComponentProps, Snippet } from "svelte";
import {
    createTable,
    type RowData,
    type Table,
    type TableOptions,
    type TableOptionsResolved,
    type TableState,
    type Updater,
} from "@tanstack/table-core";

/**
 * Small Svelte 5 adapter for @tanstack/table-core (the well-known
 * shadcn-svelte pattern): table state lives in a $state rune, and option
 * objects are merged lazily so getter-based options (reactive `data`,
 * `columns`, controlled `state`) are read at access time inside whatever
 * effect or template is consuming the table.
 */

type MaybeThunk<T extends object> = T | (() => T | null | undefined);

/**
 * Lazily merges several objects (or thunks returning objects) while
 * preserving getter semantics from every source. Later sources win.
 */
export function mergeObjects<T>(...sources: MaybeThunk<object>[]): T {
    const resolve = (source: MaybeThunk<object>): object | undefined =>
        typeof source === "function" ? (source() ?? undefined) : source;

    const findSourceWithKey = (key: PropertyKey): object | undefined => {
        for (let i = sources.length - 1; i >= 0; i--) {
            const obj = resolve(sources[i]);
            if (obj && key in obj) return obj;
        }
        return undefined;
    };

    return new Proxy(Object.create(null), {
        get(_, key) {
            const source = findSourceWithKey(key) as
                | Record<PropertyKey, unknown>
                | undefined;
            return source?.[key];
        },
        has(_, key) {
            return !!findSourceWithKey(key);
        },
        ownKeys() {
            const keys = new Set<string | symbol>();
            for (const source of sources) {
                const obj = resolve(source);
                if (obj) {
                    for (const key of Reflect.ownKeys(obj)) keys.add(key);
                }
            }
            return [...keys];
        },
        getOwnPropertyDescriptor(_, key) {
            const source = findSourceWithKey(key);
            if (!source) return undefined;
            return {
                configurable: true,
                enumerable: true,
                value: (source as Record<PropertyKey, unknown>)[key],
                writable: true,
            };
        },
    }) as T;
}

/** Creates a reactive TanStack table backed by Svelte 5 runes. */
export function createSvelteTable<TData extends RowData>(
    options: TableOptions<TData>,
): Table<TData> {
    const resolvedOptions = mergeObjects<TableOptionsResolved<TData>>(
        {
            state: {},
            onStateChange() {},
            renderFallbackValue: null,
            mergeOptions: (
                defaultOptions: TableOptions<TData>,
                newOptions: Partial<TableOptions<TData>>,
            ) => mergeObjects(defaultOptions, newOptions),
        },
        options,
    );

    const table = createTable(resolvedOptions);
    let state = $state<Partial<TableState>>(table.initialState);

    function updateOptions() {
        table.setOptions((prev) =>
            mergeObjects(prev, options, {
                // Internal $state first so caller-controlled slices
                // (e.g. sorting/globalFilter getters) shadow it.
                state: mergeObjects(() => state, options.state ?? {}),
                onStateChange: (updater: Updater<TableState>) => {
                    if (updater instanceof Function) {
                        state = updater(state as TableState);
                    } else {
                        state = mergeObjects<Partial<TableState>>(state, updater);
                    }
                    options.onStateChange?.(updater);
                },
            }),
        );
    }

    updateOptions();

    $effect.pre(() => {
        updateOptions();
    });

    return table;
}

/** Marker consumed by FlexRender: render a component with the given props. */
export class RenderComponentConfig<TComponent extends Component<any>> {
    constructor(
        readonly component: TComponent,
        readonly props: ComponentProps<TComponent>,
    ) {}
}

/** Marker consumed by FlexRender: render a snippet with the given params. */
export class RenderSnippetConfig<TProps> {
    constructor(
        readonly snippet: Snippet<[TProps]>,
        readonly params: TProps,
    ) {}
}

export function renderComponent<TComponent extends Component<any>>(
    component: TComponent,
    props: ComponentProps<TComponent> = {} as ComponentProps<TComponent>,
): RenderComponentConfig<TComponent> {
    return new RenderComponentConfig(component, props);
}

export function renderSnippet<TProps>(
    snippet: Snippet<[TProps]>,
    params: TProps,
): RenderSnippetConfig<TProps> {
    return new RenderSnippetConfig(snippet, params);
}
