// Slot content is mirrored as static HTML. A wrapper element is unavoidable
// (React Fragments can't take dangerouslySetInnerHTML); `display: contents`
// drops the wrapper box so it doesn't affect layout.
//
// Security: `html` is server-rendered slot content from Blade. Blade escapes
// `{{ }}` interpolation, so it is safe by default; only `{!! … !!}` (or other
// unescaped output) injects raw HTML, which is the caller's responsibility —
// never pass unsanitised user input through a slot.
export function MeshSlot({ html }: { html: string }) {
    return (
        <div
            style={{ display: "contents" }}
            dangerouslySetInnerHTML={{ __html: html }}
        />
    );
}
