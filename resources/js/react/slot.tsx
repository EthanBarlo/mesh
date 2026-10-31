// Slot content is mirrored as static HTML. A wrapper element is unavoidable
// (React Fragments can't take dangerouslySetInnerHTML); `display: contents`
// drops the wrapper box so it doesn't affect layout.
//
// `x-ignore` keeps Alpine from initialising the copy: its directives would bind
// to the Mesh component instead of the slot's parent. It covers only the slot,
// so Alpine (wire:navigate, wire:current) still works in framework markup.
//
// Security: `html` is server-rendered slot content from Blade. Blade escapes
// `{{ }}` interpolation, so it is safe by default; only `{!! … !!}` (or other
// unescaped output) injects raw HTML, which is the caller's responsibility —
// never pass unsanitised user input through a slot.
export function MeshSlot({ html }: { html: string }) {
    return (
        <div
            style={{ display: "contents" }}
            x-ignore=""
            dangerouslySetInnerHTML={{ __html: html }}
        />
    );
}
