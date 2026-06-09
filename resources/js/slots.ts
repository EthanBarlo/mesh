import {
    LivewireComponent,
    MeshRenderer,
    MeshSlots,
    PreparedSlots,
    RenderedComponent,
    SlotRenderer,
} from "./types";

// Internal core driver around a renderer. A renderer implements only the two
// genuinely framework-specific operations — `renderSlot` (HTML string -> node)
// and `mount` (paint/update/teardown). Everything else lives here, in one
// tested place: the default-vs-named slot split, the reserved-prop guard, the
// props dirty-check, and the update bookkeeping that keeps slot node
// references stable across props-only updates.

// Split `MeshSlots` into the default slot vs named slots and render each through
// `renderSlot`. The default slot is dropped when its HTML is empty; named slots
// are all kept (even empty) so a component can still match on their presence.
export function prepareSlots<T>(
    slots: MeshSlots,
    renderSlot: SlotRenderer<T>
): PreparedSlots<T> {
    const { default: def, ...named } = slots;

    const children = def ? renderSlot(def, "default") : undefined;

    const renderedNamed: Record<string, T> = Object.fromEntries(
        Object.entries(named).map(([name, html]) => [
            name,
            renderSlot(html, name),
        ])
    );

    return {
        children,
        named: renderedNamed,
        hasNamed: Object.keys(renderedNamed).length > 0,
    };
}

// Fail fast when `props()` returns a key reserved for slot content. Must run on
// every render because props can change (via `updateProps`) while the slots
// stay fixed.
export function assertNoReservedProps<T>(
    props: Record<string, any>,
    prepared: PreparedSlots<T>
): void {
    if ((prepared.children || prepared.hasNamed) && "children" in props) {
        throw new Error(
            "Mesh: `children` is reserved for slot content — rename the prop from props()."
        );
    }
    if (prepared.hasNamed && "slots" in props) {
        throw new Error(
            "Mesh: `slots` is reserved for named slot content — rename the prop from props()."
        );
    }
}

// Find the `.mesh-root` element a renderer mounts into.
export function getMeshRoot(livewireComponent: LivewireComponent): HTMLElement {
    const root =
        livewireComponent.el.querySelector<HTMLElement>(".mesh-root");
    if (!root) {
        throw new Error("Mesh root element not found");
    }
    return root;
}

// Mount a component through its renderer and return the internal handle the
// core drives on prop/slot changes. `updateProps` deliberately does NOT
// re-prepare the slots so their node references stay stable across props-only
// updates — a renderer's reconciler can then skip the unchanged slot subtrees.
export function mountComponent<TNode>(
    renderer: MeshRenderer<TNode>,
    livewireComponent: LivewireComponent,
    Component: any,
    props: Record<string, any>,
    slots: MeshSlots
): RenderedComponent {
    let currentProps = props;
    let prepared = prepareSlots(slots, renderer.renderSlot);

    assertNoReservedProps(currentProps, prepared);
    const handle = renderer.mount({
        el: getMeshRoot(livewireComponent),
        livewireComponent,
        Component,
        ctx: { props: currentProps, slots: prepared },
    });

    // Validate-then-commit: candidate state is adopted only after the guard
    // and the renderer's update succeed. A failed update therefore never
    // poisons the dirty-check baseline (the next identical morph retries
    // instead of being silently no-oped) and never leaves prepared slot nodes
    // around that were not actually rendered.
    const apply = (
        nextProps: Record<string, any>,
        nextPrepared: PreparedSlots<TNode>
    ) => {
        assertNoReservedProps(nextProps, nextPrepared);
        handle.update({ props: nextProps, slots: nextPrepared });
        currentProps = nextProps;
        prepared = nextPrepared;
    };

    return {
        updateProps: (props) => {
            // Dirty-check here (the single source of truth for current props)
            // so Livewire morphs that didn't touch the props are free.
            if (JSON.stringify(props) === JSON.stringify(currentProps)) {
                return;
            }
            apply(props, prepared);
        },
        updateSlots: (slots) => {
            apply(currentProps, prepareSlots(slots, renderer.renderSlot));
        },
        cleanup: () => handle.cleanup(),
    };
}
