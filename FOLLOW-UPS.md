# Follow-ups

Issues found while rewriting the docs (October 2026, branch `feat/docs-revamp`).
Nothing here was changed on that branch. Where the new docs describe today's
behavior, the page is named so it can be updated when the fix lands.

Each item is marked:

- **Verified:** confirmed in the source.
- **Reported:** found by reading Livewire 4.3 or the code, but not reproduced
  in a running app.

## Runtime bugs (JS)

1. **React `useEntangle` writes back when it shouldn't.** Verified.
   - The `$set(key, value, live)` effect runs on mount and after every
     server-driven `$watch` update.
   - With `live = true`, every live binding sends a request on mount (which
     runs `updatedFoo()`), plus an echo request each time the server changes
     the value.
   - Vue and Svelte already guard against this: they only `$set` when
     `next !== wire.$get(key)`, and never on mount. Port that guard.
   - Code: `resources/js/react/hooks/useEntangle.ts`.
   - Docs to update when fixed: `docs/guides/state.mdx`,
     `docs/reference/hooks.mdx`, `docs/frameworks/react.mdx`.
2. **React hook effects have no cleanup.** Verified.
   - `useEntangle`'s `$watch` and `useErrorBag`'s commit hook never return the
     unwatch/unhook function.
   - Under the renderer's `StrictMode` they register twice in development, and
     changing `key` stacks extra watchers.
   - Code: `resources/js/react/hooks/useEntangle.ts`, `useErrorBag.ts`.
3. **Registry errors become silent unhandled rejections.** Verified.
   - `initMesh` is `async`, so errors thrown by `buildRegistry` surface as
     "Uncaught (in promise)". Affected cases: duplicate id, unknown extension,
     a `sources` entry outside a `resources/js/mesh/` directory.
   - When that happens, `window.Mesh` is never set and no island mounts.
   - Fix: make it synchronous, or catch and `console.error` with a `Mesh:`
     message.
   - Docs to update when fixed: `docs/advanced/troubleshooting.mdx`,
     `docs/reference/init-mesh.mdx`.
4. **`window.Mesh.renderedComponents` entries are never removed** when an island
   is torn down. Reported.
5. **`Wire` type disagrees with Livewire 4.3.** Reported, from Livewire's source.
   - `$set`, `$toggle` and `$commit` return Promises; they're typed `void`.
   - `$upload`, `$uploadMultiple` and `$removeUpload` return nothing; they're
     typed `Promise<void>`, so `await` doesn't wait for the upload.
   - Upload callbacks are typed as required, but Livewire gives them defaults.
   - `$removeUpload` has an `error` parameter that Livewire never calls.
   - The `cancelled` upload callback and `$cancelUpload` are missing.
   - `$dispatch`, `$dispatchTo` and `$dispatchSelf` require `params`, which
     Livewire makes optional.
   - `live` is required on `$set` and `$toggle`; Livewire defaults it to `true`.
   - `$parent` is typed `Wire | null` but is `undefined` at runtime.
   - Code: `resources/js/types.ts`. Docs: `docs/reference/wire.mdx`.

## PHP

6. **`Component::meshSlots()` is dead code.** Verified.
   - The view (`resources/views/component.blade.php`) calls `getSlots()`
     directly, so `meshSlots()`'s whitespace-only filtering never applies.
   - Either use it in the view or remove it.
7. **The tag precompiler is greedy.** Verified.
   - `MeshTagPrecompiler` rewrites any tag starting `<mesh-` or `<mesh:`,
     including custom elements named `mesh-*`.
   - The docs currently give `@verbatim` as the workaround.

## Features and design gaps

8. **The framework runtime isn't lazy.** Verified.
   - `@mesh/react`, `@mesh/vue` and `@mesh/svelte` statically import React DOM,
     Vue and Svelte, and `app.ts` imports the renderers. Every registered
     framework is in the main bundle on every page.
   - Only component code is lazy. A dynamic import inside each renderer's
     `mount` would make pages without islands free.
9. **Custom renderers can't claim a file extension.** Verified.
   - `inferRenderer` only knows `tsx`/`jsx`/`vue`/`svelte`.
   - The discovery glob in `initMesh.ts` is hardcoded to the same set.
10. **No hook for app-level renderer setup.** Today, adding React providers or
    a Vue `app.use(...)` means copying a whole renderer. A setup option would
    remove that.

## Laravel Boost skill (stale or misleading)

All of these are in `resources/boost/skills/mesh-development/references/`.

11. **`state.md` and `wire-api.md`:** say `$watch` is typed as returning
    `void`. It now returns the unwatch function.
12. **`state.md`:** calls the mount echo harmless. That's only true for
    deferred bindings (see item 1).
13. **`wire-api.md`:** implies `$on` hears any event. In Livewire 4 it only
    hears events that reach the component's own element. For sibling events,
    use `#[On]` or a `window` listener.
14. **`wire-api.md`:** says the upload `error` callback covers your validation
    rules. It only fires for transport failures and Livewire's temporary-upload
    rules. `#[Validate]` failures land in the error bag, and `finish` still
    fires.
15. **`setup-and-troubleshooting.md`:** says an id mismatch gives "no errors",
    but it logs `Mesh: component "…" is not registered`. Its
    `@livewireScriptConfig` row is also inaccurate.
16. **`slots.md`:** says whitespace-only slots are skipped (see item 6).
17. **`forms-and-validation.md`:** presents `updatedSlug()` → `validateOnly`
    as required for live validation. `#[Validate]` already runs
    `validateOnly` on every client update.

## Demo apps

18. **PriceWatcher has no effect cleanup.** Verified.
    - The `useEffect` calls `wire.$watch` without returning the unwatch, so in
      development each price probably gets appended twice.
    - Code: `apps/demo-react/resources/js/mesh/Wire/PriceWatcher/index.tsx`.
    - Check the Vue and Svelte demos for the same pattern.
19. **The demo PHP constraint is behind the package.** Verified. All three demo
    `composer.json` files require `php ^8.2`; the package requires `^8.3`.
20. **ProjectForm demo.** Reported.
    - `updatedSlug()` repeats what `#[Validate]` already does.
    - A comment says `$call` "may reject" on validation failure. For a normal
      method it resolves with `null`.
21. **`apps/demo-react/tsconfig.json` probably fails `tsc`.** Reported. It
    includes the vendored Vue and Svelte renderer files without `vue` or
    `svelte` installed. Not run.

## Packaging

22. **`.gitattributes` doesn't `export-ignore` `/apps` or `/docs`.** Verified.
    It still lists the old `/demo` path, so the demo apps and Markdown docs
    ship in the Composer dist archive.

## Docs site

23. **The home-page framework switch flashes React.** It reads the stored
    choice after hydration, so a returning Vue or Svelte user briefly sees
    React first.
24. **The masthead theme-switch styling leans on Fumadocs internals**
    (`[data-theme-toggle]`, `svg.bg-fd-accent`). Recheck it after Fumadocs
    upgrades.
25. **The Alpine callout in Fig. 1 is tiny on phones** (about 7px).
26. **`/hero-preview` is publicly reachable.** It's the earlier hero
    exploration page. Remove the route, or noindex it, before deploying if it
    isn't wanted.
27. **Claims documented from source but not run live.** Confirm these in a
    real app:
    - the symptom of a missing `@livewireScriptConfig` (double start, then
      failing requests)
    - Svelte `bind:value={box.value}`
    - the `$dispatchTo` target name for a Mesh component
      (`mesh::wire.event-bridge`)
    - whether `svelte.config.js` with `vitePreprocess` is strictly required
    - the host-app TypeScript config in `docs/installation.mdx`
