# Styles

Styling in this app is a **two-layer system**. Mantine v9 is the primary UI
library; SCSS modules + BEM handle layout and bespoke visuals. The two coexist
in nearly every component — most components carry both a Mantine tree and a
co-located `styles.module.scss`.

## 1. The two layers and the decision rule

**(a) Mantine theme + component props / style props.** Global and per-component
design defaults live in `src/modules/shared/theme.ts`. One-off spacing and
alignment use Mantine style props directly on primitives.

**(b) SCSS modules + BEM.** Custom layout, grid, borders, backgrounds,
responsive breakpoints, and any bespoke visual live in a co-located
`styles.module.scss`.

Decision rule:

| Need | Use |
| --- | --- |
| Global or per-component design default (radius, size, colors, variants) | `theme.ts` `components.<X>.defaultProps` / `styles` |
| Small one-off spacing/alignment (`h`, `w`, `p*`, `gap`, `justify`, `fw`, `ta`, `c`) | Mantine **style props** on the element |
| Custom layout / grid / borders / backgrounds / responsive / bespoke visuals | **SCSS module** (`styles.module.scss`) |
| Override a Mantine internal part | `classNames={{ part: styles.bemClass }}` (preferred) |

Canonical mixed example: `src/modules/dashboard/features/layout/index.tsx`
applies SCSS module classes (`styles.layout__headerInner`) **and** Mantine style
props (`h="100%"`, `justify="space-between"`, `gap={4}`, `fw={700}`, `pt={0}`) on
the same elements. The custom grid, borders and backgrounds live in
`styles.module.scss`; the small alignment tweaks stay inline.

> Detailed component-level Mantine usage (which primitive to reach for, slots,
> wrappers) lives in `references/ui-and-mantine.md`. This file is about the
> styling mechanics.

## 2. Mantine theme & bootstrap

`src/modules/shared/theme.ts` is the single source of design tokens and
per-component defaults, built with `createTheme`:

```ts
import { createTheme } from '@mantine/core'

export const theme = createTheme({
    primaryColor: 'indigo',
    defaultRadius: 'sm',
    components: {
        Button: { defaultProps: { type: 'button', radius: 'sm', size: 'md' } },
        TextInput: { defaultProps: { radius: 'sm', size: 'md' } },
        Modal: {
            defaultProps: { centered: true, radius: 'md', zIndex: 1200 },
            styles: { title: { fontWeight: 700 } },
        },
        Select: {
            defaultProps: {
                radius: 'sm',
                size: 'md',
                comboboxProps: { withinPortal: true, zIndex: 1400 },
            },
        },
        // Card, ThemeIcon, ActionIcon, Tooltip, PasswordInput, Fieldset ...
    },
})
```

Configure component defaults here, **not** at each call site. The theme is
applied through `<MantineProvider theme={theme}>` in
`src/modules/shared/provider.tsx`.

**Bootstrap order (`src/app/layout.tsx`).** Mantine CSS must be imported in this
order, and **before** `globals.scss`:

```ts
import '@mantine/core/styles.css'
import '@mantine/dropzone/styles.css'
import '@mantine/nprogress/styles.css'
import '@mantine/notifications/styles.css'
import '@/styles/globals.scss'
import { ColorSchemeScript, mantineHtmlProps } from '@mantine/core'
```

`<html {...mantineHtmlProps}>` and `<ColorSchemeScript defaultColorScheme="light" />`
(rendered in `<head>`) are required; `defaultColorScheme="light"` is also passed
into `SharedProvider`.

## 3. SCSS module base pattern

Every component owns a co-located `styles.module.scss` imported as:

```ts
import styles from './styles.module.scss'
```

**Every** SCSS module starts with this exact line:

```scss
@use "~styles/app.scss" as *;
```

`~styles/app.scss` resolves via the tsconfig `"styles/app.scss"` path mapping
combined with Next's built-in Sass support (no custom `sassOptions`). The
`@styles/*` alias (`./src/styles/*`) also exists for deep imports under
`src/styles`.

`src/styles/app.scss` only forwards the shared variables and mixins — it emits no
CSS itself:

```scss
@forward "variables/index";
@forward "mixins/index";
```

So after the `@use` line, every module has `$tokens` and `@include` mixins
available. See `src/modules/dashboard/features/layout/styles.module.scss`.

## 4. BEM conventions

Block + `&__element` + `&_modifier` (modifiers are rare in this codebase):

```scss
.layout {
    &__header { /* element */ }

    &__headerInner {
        @include mobile { /* responsive nested inside the element */ }
    }

    &__brandName {
        @include cutText(280px);
    }
}
```

Rules:

- 4-space indentation.
- Element segments are **camelCase**: `&__headerInner`, `&__brandName`,
  `&__paginationMobile`.
- Responsive is handled by nesting `@include mobile/tablet/desktop-small` etc.
  **inside** the element rule — this is the dominant pattern across the app (see
  `layout/styles.module.scss` and `components/table/styles.module.scss`).

## 5. Variables

Shared tokens live in `src/styles/variables/_variables.scss`. The colors are
**not hex** — every color token maps to a Mantine CSS variable. This is the
SCSS↔Mantine bridge: SCSS and Mantine resolve to the same palette.

```scss
// Colors  (src/styles/variables/_variables.scss)
$body-bg-color: var(--mantine-color-gray-0);
$surface-color: var(--mantine-color-white);
$black-color: var(--mantine-color-dark-7);
$text-muted-color: var(--mantine-color-gray-6);
$gray-bg-color: var(--mantine-color-gray-1);
$border-color: var(--mantine-color-gray-2);

// Devices (breakpoints)
$screen-mobile-small: 420px;
$screen-mobile: 768px;
$screen-tablet: 1024px;
$screen-desktop-small: 1240px;
$screen-desktop: 1025px;
```

There is **no** `$white-color`, `$primary-color`, `$secondary-color`,
`$font-secondary-color`, `$modal-overlay-color`, or `$container-width`.

**Policy:** prefer the shared `$tokens`. For an ad-hoc shade not covered by a
token, fall back to `var(--mantine-color-*)` directly (e.g.
`var(--mantine-color-indigo-7)`, `var(--mantine-color-gray-4)` as in
`src/app/not-found.module.scss`) rather than inventing a new variable or a raw
hex.

## 6. Mixins

The full real set lives in `src/styles/mixins/_general.scss`:

```scss
@mixin transition() {
    transition: all 0.15s cubic-bezier(0.39, 0.58, 0.57, 1);
}

// Breakpoints
@mixin mobile-small   { @media (max-width: #{$screen-mobile-small})   { @content; } }
@mixin mobile         { @media (max-width: #{$screen-mobile})         { @content; } }
@mixin tablet         { @media (max-width: #{$screen-tablet})         { @content; } }
@mixin desktop-small  { @media (max-width: #{$screen-desktop-small})  { @content; } }
@mixin desktop        { @media (min-width: #{$screen-desktop})        { @content; } } // min-width

@mixin maxWidth($width) { @media (max-width: #{$width}) { @content; } }

@mixin cutText($maxWidth) {
    max-width: $maxWidth;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
}
```

Notes:

- `transition()` takes **no** argument — the duration is fixed.
- `mobile-small`, `mobile`, `tablet`, `desktop-small` are `max-width`; `desktop`
  is `min-width`. `maxWidth($width)` is the generic escape hatch.
- There is **no** `container()` mixin.

## 7. Styling Mantine internals

Mantine components expose named parts (`title`, `control`, `body`, `input`, …).
**Prefer** overriding a specific part via `classNames` pointing at a BEM class:

```tsx
<Drawer classNames={{ title: styles.settingsDrawer__title }}>
```

(from `src/modules/dashboard/features/settings/index.tsx`)

Use the `:global(.mantine-*)` escape hatch **only** when a part has no
`classNames` key or you must reach a nested control. Keep it scoped under a BEM
class so it cannot leak:

```scss
&__paginationMobile {
    @include mobile {
        :global(.mantine-Pagination-control) { /* ... */ }
        :global(.mantine-Pagination-dots)    { /* ... */ }
    }
}
```

(from `src/modules/dashboard/components/table/styles.module.scss`)

## 8. Globals

`src/styles/globals.scss` is the single global stylesheet: the CSS reset
(`* { margin/padding/box-sizing }`, `html/body`, `button`, `a`, number-input
spinner removal), the `.scrollbar` utility, and the `nextjs-portal { display:
none }` rule. It starts with the same `@use "~styles/app.scss" as *;` line and is
imported **once** in `src/app/layout.tsx`, **after** the Mantine CSS imports.
Do not add component styles here — those belong in component `styles.module.scss`.

## 9. z-index ladder

Overlays stack on a deliberate scale (set via Mantine `zIndex` props and in
`theme.ts`). New overlays must fit between these rungs:

| Layer | z-index |
| --- | --- |
| Menu / Popover | 1100 |
| Mobile menu overlay/drawer | 1000–1002 |
| App header | 1003 |
| Modal / Drawer | 1200 |
| Notifications | 1300 |
| Select combobox | 1400 |

## 10. Responsive verification

For any UI change, verify at:

- minimum mobile width: **375px**;
- the project mobile breakpoint (`$screen-mobile`, 768px);
- desktop width when the desktop layout changed.

Check for horizontal scroll, overlapping text, modal/menu behavior, button
loading states (`loading` prop), and visible error states.
