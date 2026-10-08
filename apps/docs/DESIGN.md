# Mesh docs — drawing set MESH-001

The docs are drawn like a technical drawing set: warm drafting paper, graphite
ink, one safety-orange accent, mono annotations, numbered sheets, figures with
captions, and a title block on every page. Dark mode is the same sheet under a
lamp — graphite paper, chalk ink — not a different brand.

Read this before adding pages, figures, or UI.

## Tokens

Defined in `src/app/global.css` on `:root` and redefined under `.dark`. Use the
tokens, never raw colours, so both themes keep working.

| Token | Use |
| --- | --- |
| `--paper`, `--paper-2`, `--paper-3` | Sheet, recessed panels (code, inline code), deepest faces |
| `--ink`, `--ink-2`, `--ink-3` | Primary text + structural lines, body copy, annotations |
| `--line`, `--line-2`, `--line-3` | Hairlines: faint, standard, strong |
| `--grid`, `--dot` | Figure grid, page dot grid |
| `--accent`, `--accent-ink`, `--accent-wash` | The one accent: marks/fills, accent text, tinted background |
| `--blueline` | "Non-photo blue": construction lines and string literals only |

Tailwind exposes them as colours: `text-ink-2`, `bg-paper-2`, `border-line-2`,
`text-accent-ink`, `bg-accent-wash`, `text-blueline`, …

Type: `font-sans` is Inter Tight (text), `font-mono` is IBM Plex Mono
(annotations, code, labels). All Fumadocs radii are zero — nothing is rounded
except balloons and status dots.

Motion: `--ease-out`, `--ease-spring`, `--t-fast` (150ms), `--t-med` (240ms).
Every animation needs a `prefers-reduced-motion` fallback that shows the final
state.

## Voice

- **Annotation voice** (`.k`, add `.k--caps` for tracked caps): mono, 11px —
  sheet numbers, figure captions, table headers, labels, metadata.
- **Accent is rare.** Sheet numbers, the active item, a single highlighted wire
  in a figure, the corner square on a primary button. If two things on screen
  are orange, ask whether one should be ink.
- **Copy is plain and specific.** Short sentences, concrete nouns, no hype.
  British/American spelling as in the existing docs (American: "color", "behavior").

## Primitives (`src/app/drafting.css`)

| Class | What |
| --- | --- |
| `.sheet-head` + `__no` `__title` `__meta` `__rule` | Numbered sheet header with the ticked rule that draws in |
| `.fig-cap` | Figure caption (prefixed "Fig. N ·" automatically inside docs pages) |
| `.tag`, `.balloon` | Square item tag; round balloon number |
| `.btn` `.btn--solid` `.btn--line` `.btn--sm` | Buttons; solid gets the accent corner square |
| `.link`, `.link--mono` | Underlined link; mono caps link |
| `.notes__k` + `.notes__list` | "General notes" numbered list |
| `.tblock` / `.tb` | Title block grid (use `<TitleBlock>`) |
| `.brand` | The MS mark + name + revision |
| `[data-draw] .ln` (`--fine` `--accent` `--blue` `--dash` `--center` `--wall`) | SVG line weights; `.fill-paper`, `.fill-paper-2`, `.fill-ink`, `.fill-accent` for fills; `.svg-k` for SVG text |

SVG drawings: put `data-draw` on the `<svg>`, draw with `class="ln"` paths and
`vector-effect: non-scaling-stroke` (already in the class), keep labels in
`.svg-k`. Use `currentColor` or tokens, never hex.

## MDX components

Registered in `src/components/mdx.tsx`, usable in any page under `/docs`:

- `<Callout type="info|warn|error|idea" title="…">` — drawn as a note with a
  box / triangle / circle mark. Use sparingly; one or two per page.
- `<Frameworks>` + `<Tab value="React|Vue|Svelte">` — the framework switcher.
  The choice is shared and persisted site-wide, so always use these exact
  values.
- `<Tabs items={[…]}>` + `<Tab>` — generic tabs.
- `<Steps>` + `<Step>` — numbered procedure (balloons on an ink rail).
- `<Files>` / `<Folder name defaultOpen>` / `<File name>` — file trees.
- `<TypeTable type={{ … }} />` — props/options tables.
- `<Accordions>` / `<Accordion title>` — FAQs.
- `<Cards>` / `<Card title href>` — link grids.
- `<Figure caption="…">` — gridded stage with registration marks and an
  auto-numbered caption. Put a diagram component inside.
- `<TitleBlock title rows />` — rarely needed in content; every page already
  ends with one.

Page-specific diagrams live in `src/components/figures/`, exported from the
section's registry (`getting-started.tsx`, `guides.tsx`, `reference.tsx`).

## Pages

Every docs page renders: a sheet header (`Sheet 04 / 24 · Guides`, title,
drawing number, revision), the description as a lead, the page actions, the
body, and a title block. **Do not** start MDX with a `# Title` heading — the
sheet header is the title. H2s are auto-numbered (`01`, `02`…) and ruled; H3s
get `01.1`-style numbers.
