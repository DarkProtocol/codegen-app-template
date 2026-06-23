# Env and Assets

How environment variables, npm scripts, path aliases, icons, type
declarations, and static assets work in `admin-frontend`. Every claim below is
grounded in the reference implementation — cited paths are real.

## 1. Environment Variables

Workflow for adding a new env variable:

1. Add the key to `.env.example` **without** a real value (placeholder only).
2. Add the local value to `.env` (gitignored).
3. Expose it to frontend code by whitelisting it in `next.config.ts` under
   `env: {}`.

Do **not** use `NEXT_PUBLIC_*`. Variables are exposed explicitly through the
`env` whitelist instead.

The real whitelist (cite `next.config.ts`):

```ts
// next.config.ts
import type { NextConfig } from 'next'
import createNextIntlPlugin from 'next-intl/plugin'

const withNextIntl = createNextIntlPlugin('./src/modules/shared/i18n/request.ts')

const nextConfig: NextConfig = {
    turbopack: {
        rules: {
            'src/**/*.svg': {
                loaders: ['@svgr/webpack'],
                as: '*.js',
            },
        },
    },
    env: {
        APP_NAME: process.env.APP_NAME,
        APP_LOCALE: process.env.APP_LOCALE,
        API_URL: process.env.API_URL,
    },
}

export default withNextIntl(nextConfig)
```

The real keys are exactly `APP_NAME`, `APP_LOCALE`, `API_URL` (cite
`.env.example`):

```dotenv
# .env.example
APP_NAME=SomeName
APP_LOCALE=ru
API_URL=http://admin-api.app.test
```

- `APP_LOCALE` selects the single active **next-intl** locale (supported `ru`/`en`).
  It is read by the i18n request config; there is no `[locale]` routing or
  locale switcher. Keep its allowed values in sync with `.env.example`.
- `API_URL` is read by `getApiUrl()` in `src/modules/shared/helpers/rtk-query.ts`.

Always extend the existing `env` block and `turbopack` config — never replace the
file wholesale (the `withNextIntl` wrapper and turbopack SVG rule must survive).

## 2. npm Scripts

Only four scripts exist (cite `package.json`). There is **no** `typecheck` and
**no** `test` script:

```json
"scripts": {
  "dev": "next dev --hostname admin.app.test",
  "build": "next build",
  "start": "next start",
  "lint": "eslint"
}
```

- `dev` runs against the host `admin.app.test` (rename per project; pair
  with a matching `/etc/hosts` entry).
- Linting is `eslint` with no args (flat config).

## 3. Path Aliases

Aliases live in `tsconfig.json` `compilerOptions.paths` (cite `tsconfig.json`):

```jsonc
"paths": {
  "@/*": ["./src/*"],
  "@styles/*": ["./src/styles/*"],
  "styles/app.scss": ["./src/styles/app.scss"],
  "@modules/shared/*": ["./src/modules/shared/*"],
  "@modules/auth": ["./src/modules/auth/index"],
  "@modules/auth/*": ["./src/modules/auth/*"],
  "@modules/dashboard": ["./src/modules/dashboard/index"],
  "@modules/dashboard/*": ["./src/modules/dashboard/*"]
}
```

Notes:

- `shared` is deep-import-only (`@modules/shared/*`); it has no bare alias and no
  `index` barrel.
- `auth` and `dashboard` are registered **twice** each: a **bare** alias mapping
  to `index` (the module public API), plus a `/*` deep alias.
- **Per-module double-registration rule:** every new non-`shared` module must be
  added twice — `"@modules/<m>": ["./src/modules/<m>/index"]` **and**
  `"@modules/<m>/*": ["./src/modules/<m>/*"]`. The bare alias resolves to the
  `index.tsx` barrel; the `/*` alias enables intra-module deep self-imports.

## 4. Icons — lucide-react (Primary)

Icons come from **`lucide-react`** (`^1.x`). Import named icons and render them
with `size` + `strokeWidth` props, placing them inside Mantine slots
(`leftSection` / `rightSection` / `separator`) or wrapping them in `ThemeIcon`.

Inside a Mantine `ActionIcon` slot (cite
`src/modules/shared/components/copy-input/index.tsx`):

```tsx
import { Copy } from 'lucide-react'
// ...
<ActionIcon variant="subtle" color="gray" onClick={handleCopy}>
    <Copy size={18} strokeWidth={1.9} />
</ActionIcon>
```

Inside a Mantine `Button` `leftSection` (cite
`src/modules/dashboard/components/create-button/index.tsx`):

```tsx
import { Plus } from 'lucide-react'
// ...
<Button color="teal" leftSection={<Plus size={18} strokeWidth={1.9} />}>
    {children ?? t('create')}
</Button>
```

Type **dynamic / data-driven** icons as `LucideIcon` (e.g. menu item configs,
mime-type → icon maps in
`src/modules/dashboard/features/layout/menu/items.ts` and
`src/modules/dashboard/components/table/index.tsx`):

```ts
import { Images, UsersRound, type LucideIcon } from 'lucide-react'

type MenuItem = { icon: LucideIcon /* ... */ }
const items: MenuItem[] = [{ icon: Images /* ... */ }, { icon: UsersRound /* ... */ }]
```

Wrap in `ThemeIcon` when you need a colored/sized badge container rather than a
bare glyph.

## 5. Custom SVG-as-Component (Fallback)

Custom SVG-as-React-component is a **fallback** for bespoke art that lucide does
not cover. It is wired through `@svgr/webpack` via the turbopack rule in
`next.config.ts` (cite `next.config.ts`):

```ts
turbopack: {
    rules: {
        'src/**/*.svg': {
            loaders: ['@svgr/webpack'],
            as: '*.js',
        },
    },
}
```

Imported `.svg` files are typed as React components by `src/types/svg.d.ts`
(cite `src/types/svg.d.ts`; bundled as `assets/types/svg.d.ts`):

```ts
declare module '*.svg' {
    import { FC, SVGProps } from 'react'
    const content: FC<SVGProps<SVGSVGElement>>
    export default content
}
```

Usage (forward-looking — currently nothing in `src` imports an SVG this way):

```tsx
import Logo from './logo.svg'

<Logo width={120} height={32} />
```

Caveats:

- This path is **currently unused** in `src`. There is **no**
  `src/modules/shared/components/icons/` directory.
- **Gotcha:** `@svgr/webpack` is referenced in `next.config.ts` but is **missing
  from `package.json` `devDependencies`**. Copied projects must add it before the
  SVG-as-component path will work.
- App Router metadata icons such as `src/app/icon.svg` are **raw SVG files
  consumed by Next's metadata convention** (favicon) — they are not imported and
  do not go through SVGR (cite `src/app/icon.svg`).

## 6. Global Style / Type Declarations

Ambient module declarations live under `src/types/`. The reference app currently
contains **only** `src/types/svg.d.ts` (the `'*.svg'` FC declaration above).

For SCSS/CSS modules, use the bundled `assets/types/global.d.ts` pattern when a
project needs typed style imports (reference `assets/types/global.d.ts`):

```ts
declare module '*.scss'
declare module '*.sass'
declare module '*.css'

declare module '*.module.scss' {
    const classes: { [key: string]: string }
    export default classes
}
```

Keep new ambient declarations aligned with whatever the target project already
ships; do not duplicate declarations Next already provides via `next-env.d.ts`.

## 7. Static Assets

There is **no `public/` directory** in the reference app. The only SVG in the
tree is `src/app/icon.svg` (an App Router metadata favicon, not an imported
asset).

Any `public/assets/<module-name>/` convention is **forward-looking guidance
only** — explicitly **not** present in the reference implementation. If a copied
project introduces static binaries (PNG/WebP/JPG), the suggested layout is:

```txt
public/assets/<module-name>/hero-background.png
```

referenced by public path:

```ts
'/assets/<module-name>/hero-background.png'
```

Use `kebab-case` for asset folders and file names.
