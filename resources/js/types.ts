export type CleanupCallback = () => void;

export type ComponentLoader = () => Promise<{ default: any }>;

export type RegistryEntry = {
    renderer: string;
    load: ComponentLoader;
};

export type ComponentRegistry = {
    [id: string]: RegistryEntry;
};

export type GlobResult = Record<string, ComponentLoader>;

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
// and prepared slots. The reserved-prop guard has already run.
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

export type Wire = {
    $parent: Wire | null;
    $el: HTMLElement;
    $id: string;
    $get: (key: string) => any;
    $set: (key: string, value: any, live: boolean) => void;
    $toggle: (key: string, live: boolean) => void;
    $call: (method: string, ...args: any[]) => Promise<any>;
    $watch: (key: string, callback: (value: any) => void) => void;
    $refresh: () => Promise<void>;
    $commit: () => void;
    $on: (event: string, callback: (...args: any[]) => void) => void;
    $hook: (event: string, callback: (...args: any[]) => void) => void;
    $dispatch: (event: string, params: object) => void;
    $dispatchTo: (component: string, event: string, params: object) => void;
    $dispatchSelf: (event: string, params: object) => void;
    $upload: (
        name: string,
        file: File,
        finish: (response: any) => void,
        error: (response: any) => void,
        progress: (event: { detail: { progress: number } }) => void
    ) => Promise<void>;
    $uploadMultiple: (
        name: string,
        files: File[],
        finish: (response: any) => void,
        error: (response: any) => void,
        progress: (event: { detail: { progress: number } }) => void
    ) => Promise<void>;
    $removeUpload: (
        name: string,
        tmpFilename: string,
        finish: (response: any) => void,
        error: (response: any) => void
    ) => Promise<void>;
    __instance: LivewireComponent;
};

export type Config = {
    renderers: MeshRenderer<any>[];
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
                      renderers: {
                          [key: string]: MeshRenderer<any>;
                      };
                  };
              }
            | undefined;
    }
}
