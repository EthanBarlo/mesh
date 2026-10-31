export type CleanupCallback = () => void;

// Vite's plain import.meta.glob returns Promise<unknown>; loadComponent checks
// for a default export when the chunk is actually loaded.
export type ComponentLoader = () => Promise<unknown>;

export type RegistryEntry = {
    renderer: string;
    load: ComponentLoader;
};

export type ComponentRegistry = {
    [id: string]: RegistryEntry;
};

export type GlobResult = Record<string, ComponentLoader>;

// An extra discovery input for components that live outside the host app's
// resources/js/mesh directory — e.g. inside a Composer package. import.meta.glob
// only accepts literal patterns, so the host app owns the glob and hands Mesh
// the result. Entries must still sit under a `resources/js/mesh/` directory
// somewhere in their path (that marker is where id derivation starts). The
// wrapped form namespaces every id from the source under `prefix`.
export type MeshSource =
    | GlobResult
    | { modules: GlobResult; prefix?: string };

export type MeshSlots = Record<string, string>;

// One slot's HTML string rendered into a framework node of type `T` — React
// `dangerouslySetInnerHTML`, Vue `v-html`, Svelte `{@html}`. `name` is
// "default" for the unnamed slot, or the named-slot key.
export type SlotRenderer<T> = (html: string, name: string) => T;

// The default-vs-named split of a component's slots, each already rendered
// through the renderer's `renderSlot`.
export type PreparedSlots<T> = {
    // The default slot, or `undefined` when its HTML is empty/absent.
    children: T | undefined;
    // Every named slot, kept verbatim (NOT filtered when empty).
    named: Record<string, T>;
    // True when there is at least one named slot key.
    hasNamed: boolean;
};

// What Mesh hands a renderer on mount and on every update: the latest props
// and prepared slots. The renderer's reserved-prop policy has already run.
export type RenderContext<T> = {
    props: Record<string, any>;
    slots: PreparedSlots<T>;
};

export interface LivewireSnapshot {
    // The serialized state of the component (public properties)
    data: Record<string, any>;

    // Long-standing information about the component
    memo: {
        // The component's unique ID
        id: string;

        // The component's name (e.g., 'counter')
        name: string;

        // The URI, method, and locale of the web page that the
        // component was originally loaded on
        path: string;
        method: string;
        locale: string;

        // A list of any nested "child" components
        // Keyed by internal template ID with component ID as values
        children: Record<string, [string, string]>;

        // Whether or not this component was "lazy loaded"
        lazyLoaded: boolean;

        // A list of any validation errors thrown during the last request
        errors: Record<string, string[]>;

        // Additional memo properties that may be added by features
        [key: string]: any;
    };

    // A securely encrypted hash of this snapshot
    checksum: string;
}

export type LivewireComponent = {
    el: HTMLElement;
    id: string;
    name: string;
    effects: any;
    canonical: any;
    ephemeral: any;
    reactive: any;
    $wire: Wire;
    children: any[];
    snapshot: LivewireSnapshot;
    snapshotEncoded: string;
};

// What an upload's `progress` callback receives: the XHR progress event, with
// Livewire's whole-number percentage added as `detail.progress`.
export type UploadProgressEvent = ProgressEvent & {
    detail: { progress: number };
};

// What `$errors` returns: Livewire's client-side take on Laravel's MessageBag
// (`js/features/supportErrors.js`). Reads the last request's validation
// errors; `clear()` only hides them locally until the next response.
export type WireErrors = {
    messages: () => Record<string, string[]>;
    keys: () => string[];
    // No keys: any error at all. Takes keys as arguments or one array.
    has: (...keys: string[] | [string[]]) => boolean;
    hasAny: (keys: string[]) => boolean;
    missing: (...keys: string[] | [string[]]) => boolean;
    // The first message for `key` (or overall), or "" when there is none.
    first: (key?: string | null) => string;
    get: (key: string) => string[];
    all: () => string[];
    isEmpty: () => boolean;
    isNotEmpty: () => boolean;
    any: () => boolean;
    count: () => number;
    // Clears one field, or every field when `field` is omitted.
    clear: (field?: string | null) => void;
};

// What an `onError` callback receives (action, message and request level).
// Calling `preventDefault` stops Livewire's default error modal.
export type WireErrorContext = {
    response: Response;
    body: string;
    preventDefault: () => void;
};

// The callback given to `$intercept` / `$interceptAction`, run once per
// action (method call) on this component (`js/request/index.js`). Each `on*`
// registers a lifecycle callback for that action.
export type WireActionInterceptor = (context: {
    // Livewire's internal Action (`name`, `params`, `metadata`, `cancel()`…).
    action: any;
    onSend: (callback: (context: { call: any }) => void) => void;
    onCancel: (callback: () => void) => void;
    // Receives the server method's return value.
    onSuccess: (callback: (result: any) => void) => void;
    onError: (callback: (context: WireErrorContext) => void) => void;
    // Network failures (the fetch itself threw).
    onFailure: (callback: (context: { error: any }) => void) => void;
    onFinish: (callback: () => void) => void;
}) => void;

// The response stages a message interceptor's `onSuccess` can hook, in the
// order Livewire runs them (`js/request/index.js`): `onSync` right after the
// new snapshot is merged, `onEffect` after effects are processed, `onMorph`
// (awaited) / `onMorphed` around the DOM morph, and `onRender` a
// requestAnimationFrame later. Each holds one callback; a second call
// replaces the first.
export type WireMessageSuccessContext = {
    // The response payload, with the snapshot already parsed.
    payload: { snapshot: LivewireSnapshot; effects: Record<string, any> };
    onSync: (callback: () => void) => void;
    onEffect: (callback: () => void) => void;
    onMorph: (callback: () => void | Promise<void>) => void;
    onMorphed: (callback: () => void) => void;
    onRender: (callback: () => void) => void;
};

// The callback given to `$interceptMessage`, run once per message (one
// component's share of a request) for this component
// (`js/request/interceptor.js`'s MessageInterceptor). Each `on*` holds one
// callback; a second call replaces the first.
export type WireMessageInterceptor = (context: {
    // Livewire's internal Message (`component`, `actions`, `payload`…).
    message: any;
    cancel: () => void;
    onSend: (callback: (context: { payload: any }) => void) => void;
    onCancel: (callback: () => void) => void;
    onFailure: (callback: (context: { error: any }) => void) => void;
    onError: (callback: (context: WireErrorContext) => void) => void;
    onStream: (
        callback: (context: { json: any }) => void | Promise<void>
    ) => void;
    onSuccess: (callback: (context: WireMessageSuccessContext) => void) => void;
    // A newer response superseded this one, so its payload was not applied.
    onSkipped: (callback: () => void) => void;
    onFinish: (callback: () => void) => void;
}) => void;

// The callback given to `$interceptRequest`, run once per HTTP request that
// carries a message for this component (`js/request/interceptor.js`'s
// RequestInterceptor). Each `on*` holds one callback.
export type WireRequestInterceptor = (context: {
    // Livewire's internal Request (`messages`, `uri`, `cancel()`…).
    request: any;
    onSend: (
        callback: (context: { responsePromise: Promise<Response> }) => void
    ) => void;
    onCancel: (callback: () => void) => void;
    onFailure: (callback: (context: { error: any }) => void) => void;
    onResponse: (callback: (context: { response: Response }) => void) => void;
    onParsed: (
        callback: (context: { response: Response; body: string }) => void
    ) => void;
    onError: (callback: (context: WireErrorContext) => void) => void;
    onStream: (callback: (context: { response: Response }) => void) => void;
    onRedirect: (
        callback: (context: { url: string; preventDefault: () => void }) => void
    ) => void;
    onDump: (
        callback: (context: { html: string; preventDefault: () => void }) => void
    ) => void;
    onSuccess: (
        callback: (context: {
            response: Response;
            body: string;
            json: any;
        }) => void
    ) => void;
    onFinish: (callback: () => void) => void;
}) => void;

// The `$intercept*` signature: intercept every action, or pass a method name
// first to only intercept messages/requests that include that action.
// Returns Livewire's unsubscribe function.
export type WireIntercept<TCallback> = {
    (callback: TCallback): () => void;
    (action: string, callback: TCallback): () => void;
};

// Livewire's `$wire` proxy, typed from Livewire 4.3's `js/$wire.js`. Methods
// that send a request return a Promise; the upload and dispatch helpers fire
// and forget, so they return nothing — use their callbacks instead of `await`.
// Every upload callback is optional (Livewire defaults each to a no-op).
export type Wire = {
    // The nearest parent Livewire component's wire, or undefined at the top.
    $parent: Wire | undefined;
    $el: HTMLElement;
    $id: string;
    // `reactive: false` reads the last server value instead of the local one.
    $get: (key: string, reactive?: boolean) => any;
    // `live` defaults to true (send a request now); pass false to defer.
    $set: (key: string, value: any, live?: boolean) => Promise<void>;
    $toggle: (key: string, live?: boolean) => Promise<void>;
    $call: (method: string, ...args: any[]) => Promise<any>;
    // Returns Livewire's unsubscribe function (also auto-cleaned on
    // component teardown via addCleanup).
    $watch: (key: string, callback: (value: any) => void) => () => void;
    $refresh: () => Promise<void>;
    $commit: () => Promise<void>;
    // Adds a listener on `$el` that is never removed, so it outlives an
    // island that unmounts first. Prefer Mesh's `useWireEvent`.
    $on: (event: string, callback: (...args: any[]) => void) => void;
    // Returns Livewire's unhook function (also auto-cleaned on teardown).
    $hook: (event: string, callback: (...args: any[]) => void) => () => void;
    // Component-scoped request interceptors. They are not cleaned up on
    // teardown, so call the returned unsubscribe when you are done.
    // `$intercept` is an alias of `$interceptAction`.
    $intercept: WireIntercept<WireActionInterceptor>;
    $interceptAction: WireIntercept<WireActionInterceptor>;
    $interceptMessage: WireIntercept<WireMessageInterceptor>;
    $interceptRequest: WireIntercept<WireRequestInterceptor>;
    // The current validation errors (a fresh object per read).
    $errors: WireErrors;
    // Whether the property (any of the properties, or any property when
    // omitted) differs from the last server value.
    $dirty: (property?: string | string[]) => boolean;
    // Call to register a JS action, read one as `$js.name(...)`, or assign
    // `$js.name = fn`.
    $js: ((name: string, action: (...args: any[]) => any) => void) & {
        [name: string]: (...args: any[]) => any;
    };
    // `$refs('name')` or `$refs.name`: the element with `wire:ref="name"`
    // inside this component, or undefined (Livewire logs an error).
    $refs: ((name: string) => HTMLElement | undefined) & {
        readonly [name: string]: HTMLElement | undefined;
    };
    // Scopes the next action to a named island and returns this wire for
    // chaining: `$wire.$island("feed", { mode: "append" }).loadMore()`.
    $island: (
        name: string,
        options?: { mode?: "morph" | "append" | "prepend"; [key: string]: any }
    ) => Wire;
    // Alpine-only: returns an Alpine interceptor meant for `x-data`. In an
    // island use Mesh's `useEntangle` instead.
    $entangle: (name: string, live?: boolean) => unknown;
    // Runs an Alpine effect, disposed on component teardown. Returns
    // Alpine's effect runner.
    $effect: (callback: () => void) => unknown;
    $dispatch: (event: string, params?: object) => void;
    $dispatchTo: (component: string, event: string, params?: object) => void;
    $dispatchSelf: (event: string, params?: object) => void;
    // Dispatches (non-bubbling) to every element inside this component
    // matching `selector`.
    $dispatchEl: (selector: string, event: string, params?: object) => void;
    // Dispatches (non-bubbling) to this component's `wire:ref="ref"` element.
    $dispatchRef: (ref: string, event: string, params?: object) => void;
    $upload: (
        name: string,
        file: File,
        // Receives the temporary filename.
        finish?: (tmpFilename: string) => void,
        // Transport failures and Livewire's temporary-upload rules only.
        error?: () => void,
        progress?: (event: UploadProgressEvent) => void,
        cancelled?: () => void
    ) => void;
    $uploadMultiple: (
        name: string,
        files: File[] | FileList,
        // Receives the temporary filenames.
        finish?: (tmpFilenames: string[]) => void,
        error?: () => void,
        progress?: (event: UploadProgressEvent) => void,
        cancelled?: () => void,
        // Add to the files already in the property (Livewire's default)
        // instead of replacing them.
        append?: boolean
    ) => void;
    $removeUpload: (
        name: string,
        tmpFilename: string,
        // Receives the removed temporary filename.
        finish?: (tmpFilename: string) => void
    ) => void;
    // Aborts the property's in-flight upload, if any.
    $cancelUpload: (name: string, cancelled?: () => void) => void;
    __instance: LivewireComponent;
};

// A renderer that is loaded on demand. `initMesh` only holds this small
// descriptor; the core calls `load()` (once per type, cached) the first time
// an island of this type mounts, so the framework runtime is fetched only on
// pages that have such an island.
export type LazyMeshRenderer = {
    type: string;
    // Extra entry-file extensions (without the dot) that map to this type.
    extensions?: string[];
    load: () => Promise<MeshRenderer<any>>;
};

// What `Config.renderers` accepts: a full renderer object, or a lazy
// descriptor (what `@mesh/react`, `@mesh/vue` and `@mesh/svelte` export).
export type MeshRendererDefinition = MeshRenderer<any> | LazyMeshRenderer;

export type Config = {
    renderers: MeshRendererDefinition[];
    // Additional component sources beyond the host app's resources/js/mesh
    // (see MeshSource). Ids must not collide with auto-discovered ones.
    sources?: MeshSource[];
    debug?: boolean;
};

// Internal handle the core driver builds around a mounted renderer. Renderers
// never construct this — they implement `MeshRenderer` and the core owns the
// props/slots bookkeeping behind these methods.
export type RenderedComponent = {
    updateProps: (props: Record<string, any>) => void;
    updateSlots: (slots: MeshSlots) => void;
    cleanup: CleanupCallback;
};

// A renderer supplies only the two genuinely framework-specific operations:
// turning a slot's HTML string into a node, and mounting/updating/unmounting
// a component. Everything else (the default-vs-named slot split, the reserved
// `children`/`slots` prop guard, props dirty-checking, and keeping slot node
// references stable across props-only updates) is owned by the Mesh core.
export type MeshRenderer<TNode = unknown> = {
    type: string;
    // Extra entry-file extensions (without the dot) that map to this type,
    // on top of the built-in tsx/jsx -> react, vue -> vue, svelte -> svelte.
    extensions?: string[];
    // Native slot APIs keep Blade slots separate from ordinary component props.
    // Omit this for renderers that pass slot content through `children`/`slots`.
    nativeSlots?: boolean;
    // HTML string -> framework node. Must be pure: it is called per slot,
    // outside any mount, so it cannot rely on per-mount state.
    renderSlot: SlotRenderer<TNode>;
    mount: (args: {
        // The resolved `.mesh-root` element to mount into.
        el: HTMLElement;
        livewireComponent: LivewireComponent;
        Component: any;
        // Initial props + prepared slots; the reserved-prop guard already ran.
        ctx: RenderContext<TNode>;
    }) => {
        // Called with the latest context whenever props or slots change.
        update: (ctx: RenderContext<TNode>) => void;
        cleanup: CleanupCallback;
    };
};

declare global {
    interface Window {
        Mesh:
            | {
                  registry: ComponentRegistry;
                  resolved: {
                      [id: string]: Promise<any>;
                  };
                  renderedComponents: {
                      [key: string]: RenderedComponent;
                  };
                  config: {
                      debug?: boolean;
                      // As passed to initMesh, keyed by type: full
                      // renderers or lazy descriptors.
                      renderers: {
                          [key: string]: MeshRendererDefinition;
                      };
                  };
              }
            | undefined;
    }
}
