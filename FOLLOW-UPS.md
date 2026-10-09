# Follow-ups

The October 2026 list (items 1–29, found during the docs and demo redraws)
was resolved on branch `fix/follow-ups`. See the `Unreleased` section of
`CHANGELOG.md`. What's left needs a real device, or is a known edge case
rather than a bug.

## Needs checking on real hardware

1. **Board touch drags.** The Vue and Svelte boards now record a drag's origin
   in formkit's `dragstartClasses` hook, which runs for touch as well as mouse
   drags. Confirm on a phone that a touch move survives a refresh.

## Known edge cases

2. **`<mesh-x>` collisions.** A custom element whose name matches a real Mesh
   component is still rewritten. A view compiled before its component class
   existed keeps the raw tag until `php artisan view:clear`. Both are
   documented in `docs/reference/blade.mdx`.
3. **Renderer factory options are eager.** Whatever `app.ts` imports for
   `wrap`, `setup` or `context` (providers, plugins) is in the entry chunk.
   `docs/reference/renderer.mdx` shows how to keep it lazy.

## Tooling gaps

4. **No template type-checking in the Vue and Svelte demos.** Neither app has
   `vue-tsc` or `svelte-check`, so `.vue` and `.svelte` files are compiled
   but never type-checked. Their `components/ui/index.ts` also re-exports
   named types from component files, which plain `tsc` rejects.
5. **The docs dev server restarts under memory pressure** after compiling many
   pages ("approaching the used memory threshold"). Harmless, but a long
   `curl` sweep can see a few refused connections while it restarts.
