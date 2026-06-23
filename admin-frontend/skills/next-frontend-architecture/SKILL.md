---
name: next-frontend-architecture
description: Use when working on the Next.js admin-frontend - App Router + Mantine v9 UI, @mantine/form, RTK Query (multiple *-api.ts per module), next-intl i18n, lucide-react icons, SCSS modules + BEM, module-boundary architecture.
---

# Next Frontend Architecture (admin-frontend)

This skill describes how the `admin-frontend` reference app is actually built. New projects copy this app, so keep every decision aligned with the patterns below.

## 1. Core Principle

`src/app` is a thin Next.js **composition layer**: routes, layouts, providers, metadata, and page assembly. It contains no business logic. All logic — forms, requests, hooks, store, i18n, components — lives in `src/modules`.

Pages are thin shells that render a single module barrel component:

```tsx
// src/app/(dashboard)/page.tsx
import { Dashboard } from '@modules/dashboard'
export default function Home() {
    return <Dashboard />
}
```

```tsx
// src/app/login/page.tsx
import { LoginForm } from '@modules/auth'
export default function LoginPage() {
    return <LoginForm />
}
```

When changing Next.js behavior in `src/app`, `next.config.ts`, routing, metadata, layouts, server/client boundaries, or Turbopack rules, check the current code first.

## 2. Stack & Versions

Pinned in `package.json`:

- **Next.js ^16** (App Router + Turbopack; `turbopack.rules` in `next.config.ts`)
- **React ^19**, **TypeScript** (strict)
- **Mantine v9** — `@mantine/core/hooks/form/notifications/nprogress/dropzone` (^9.3.x). PRIMARY UI layer.
- **@reduxjs/toolkit ^2** + **react-redux ^9** — RTK Query only
- **next-intl ^4** — i18n
- **lucide-react ^1** — icons
- **sass ^1** — SCSS modules

Forms use **@mantine/form** only. There is no React Hook Form and no Zod anywhere.

Gotcha: `next.config.ts` references `@svgr/webpack` for the Turbopack SVG rule, but it is **not** in `package.json` deps. Copied projects that use SVG-as-component must add `@svgr/webpack` themselves.

## 3. Modules

Real modules: `auth`, `dashboard`, `shared`. Do not invent modules.

Feature-module base structure:

```txt
src/modules/<module>/
  index.tsx                 # public API barrel (.tsx, not .ts)
  provider.tsx              # exports `Provider`
  i18n.ts                   # exports `i18n = { ru, en } as const`
  features/<feature>/
  components/<component>/
  models/<domain>-api.interface.ts
  helpers/
  hooks/
  store/
    <domain>-api.ts         # one RTK Query api per resource (NO store.ts)
```

Multiple `*-api.ts` files per module is the rule, e.g. `src/modules/dashboard/store/{account-api.ts, admin-users-api.ts, media-library-api.ts}`. There is **no per-module `store.ts`** and **no Redux slices**.

`shared` is infrastructure and has **no `index.tsx` barrel** — it is deep-import-only via `@modules/shared/*`. Instead of a barrel it owns:

```txt
src/modules/shared/
  provider.tsx              # redux + next-intl + Mantine + RouteProgress + Notifications
  theme.ts                  # Mantine createTheme()
  i18n/{messages.ts, shared-messages.ts, request.ts}
  components/ hooks/ helpers/ models/ store/store.ts
```

`auth` and `dashboard` each have an `index.tsx` barrel (see `src/modules/auth/index.tsx`, `src/modules/dashboard/index.tsx`).

Do not create empty folders for hypothetical future use. Add only structure with a real responsibility.

## 4. Providers

Every module exposes a `provider.tsx` exporting a `Provider` component, re-exported renamed where needed (`Provider as DashboardProvider`, imported as `AuthProvider` / `SharedProvider`).

Composition order:

```tsx
// src/app/layout.tsx
<SharedProvider defaultColorScheme="light" locale={appLocale} messages={messages[appLocale]}>
    <AuthProvider>{children}</AuthProvider>
</SharedProvider>
```

```tsx
// src/app/(dashboard)/layout.tsx
<DashboardProvider>
    <DashboardLayout appName={process.env.APP_NAME ?? ''}>{children}</DashboardLayout>
</DashboardProvider>
```

- `src/modules/shared/provider.tsx` — infrastructure: `redux Provider` > `NextIntlClientProvider` > `MantineProvider theme={theme}` > `RouteProgress` + children + `Notifications`.
- `src/modules/auth/provider.tsx` — the auth gate: reads `useAuthUser()` and redirects between login/dashboard, rendering a full-page Mantine `Loader type="bars"` while checking.
- `src/modules/dashboard/provider.tsx` — prefetches config gated on `useMustUser().can.*` (e.g. `useMediaLibraryConfigQuery(undefined, { skip: !can.adminMedia })`).

See `references/module-boundaries.md`.

## 5. Module Communication & Boundaries

- Cross-module imports go through the `index.tsx` barrel only: `import { useMustUser } from '@modules/auth'`.
- Intra-module imports may be relative OR absolute self-alias `@modules/<self>/...` deep paths.
- `shared` is deep-import-only at any depth: `@modules/shared/components/...`.
- feature -> feature within the same module is allowed in practice (e.g. `user-menu` imports `SettingsDrawer` from `@modules/dashboard/features/settings`).
- Never use `@/modules/*` — always `@modules/*`.

Enforced by the custom ESLint rule `custom-rules/modules-imports` (error) with options `{ srcPath: 'src', modulesPath: 'modules', modulesAlias: '@modules', exceptModules: ['shared'] }`. It rejects `@/modules/*`, allows same-module deep self-imports, allows any depth into `shared`, and forces cross-module imports through `@modules/<module>/index`.

See `references/module-boundaries.md` and `assets/eslint/modules-imports.js`.

## 6. Features

A feature is a complete user scenario at `features/<feature>/index.tsx` exporting a product-named component. Real features and exports:

- `auth/features/login-form` -> `LoginForm`
- `dashboard/features/admin-users` -> `AdminUsers`
- `dashboard/features/media-library` -> `MediaLibrary`
- `dashboard/features/dashboard` -> `Dashboard`
- `dashboard/features/layout` -> `DashboardLayout`
- `dashboard/features/settings` -> `SettingsDrawer`

Features may nest their own `components/`, `helpers/`, `models/`. Use real product names; do not add a `Feature` suffix.

## 7. Store and API

RTK Query only. No `createSlice`, no `*.slice.ts`, no per-module `store.ts`.

- Each resource is its own `createApi` in `<module>/store/<domain>-api.ts` with `reducerPath: '<domain>/api'` (e.g. `'adminUsers/api'`, `'auth/api'`).
- The lone single-file case is `auth/store/api.ts` (auth has one api).
- The only `store.ts` is the root `src/modules/shared/store/store.ts`: `combineReducers` + `configureStore` over the api reducers/middleware.
- Module `index.tsx` re-exports api **objects** (`authApi`, `accountApi`, `adminUsersApi`, `mediaLibraryApi`) so the root store can register them via the barrels.
- Generated hooks ARE the consumption surface — exported from each `*-api.ts` and imported directly, including cross-module deep self-imports (`@modules/dashboard/store/media-library-api`). Cross-module *behavior* is exposed as semantic hooks (`useMustUser`, `useLogout`).

Base query: `src/modules/shared/helpers/rtk-query.ts` -> `baseFetchQuery(path, ver?)` wrapping `fetchBaseQuery` with `credentials: 'include'` (cookie auth), a native `URLSearchParams` serializer (`key[]=` for arrays), and a Mantine notification **only** on HTTP 500. `ver` is optional with no default; `getApiUrl(ver?)` reads `process.env.API_URL` and appends `/<ver>` only when `ver` is passed.

Auth is cookie-based. Session is enforced at the React layer: `auth/provider.tsx` redirects via `useAuthUser`/`whoami`; `useMustUser` reloads when data is missing; `useLogout` = `useLogoutMutation` + `authApi.util.resetApiState()` + `window.location.replace`. There is **no** `authFetchQuery`, 401 interceptor, refresh-token flow, retry, or logout-on-error in the data layer.

See `references/store-and-api.md`. Cite `src/modules/shared/store/store.ts`, `src/modules/dashboard/store/admin-users-api.ts`.

## 8. Forms and Errors

Build forms with **@mantine/form** `useForm` (`initialValues`, `validate`, `transformValues`), spread per field with `form.getInputProps('field')`, submit via `form.onSubmit(handler)`, and put `noValidate` on the `<form>`.

API error contract (`src/modules/shared/models/api-error-response.interface.ts`):

```ts
export interface IApiErrorResponse {
    errors?: Record<string, string>
}
```

A flat `field -> message` map under `errors`. Bridge it into the form with `useApiFormErrors(form, error)` (`src/modules/shared/hooks/use-api-form-errors.ts`): it unwraps the RTK `FetchBaseQueryError` via `'data' in error`, calls `setFieldError` for keys present in the form values, and routes unknown keys to the synthetic `'root'` field. `FormRootError` renders `form.errors.root`. Fallback message is `t('somethingWentWrong')` from `Shared.Errors`.

Validation messages come from next-intl translators returned directly from Mantine per-field validators (return `null` when valid, a translated string when invalid):

```ts
const sharedT = useTranslations('Shared.Validation')
validate: {
    email: (v) =>
        v.trim().length === 0 ? sharedT('requiredField') : isValidEmail(v) ? null : sharedT('invalidEmail'),
    password: (v) => (v.length > 0 ? null : sharedT('requiredField')),
}
```

The only extracted validation helper is `isValidEmail` (EMAIL_REGEXP) in `src/modules/shared/helpers/validation.ts`. No Zod, no shared `schema.ts`.

Submit ritual: clear form errors + RTK `reset()` up top, `await mutate(values).unwrap()`, fire success `notifications.show(...)` on success, and let `useApiFormErrors` map failures (catch block is empty or only handles a specific fallback). Every request shows a loading state via Mantine `Button loading`, `Skeleton`, or `Loader`.

See `references/forms-and-errors.md`. Cite `src/modules/auth/features/login-form/index.tsx`, `src/modules/shared/hooks/use-api-form-errors.ts`.

## 9. Internationalization (i18n)

**next-intl v4**, wired via `createNextIntlPlugin('./src/modules/shared/i18n/request.ts')` + `withNextIntl` in `next.config.ts`.

- Single active locale chosen by the `APP_LOCALE` env var. There is **no `[locale]` routing, no middleware, no locale switcher**. Supported locales `ru` / `en`, `defaultLocale = 'en'`, `defaultTimeZone = 'UTC'`.
- Each feature module owns a flat root `i18n.ts` exporting `export const i18n = { ru, en } as const`, re-exported via its barrel (`export { i18n } from './i18n'`).
- `shared` owns `src/modules/shared/i18n/{messages.ts, shared-messages.ts, request.ts}`. `messages.ts` composes per-module bundles + `Shared`.
- Namespacing is hierarchical PascalCase `Module.Feature.Component` (`Auth.LoginForm`, `Dashboard.AdminUsers`, `Shared.Validation`) with camelCase leaf keys.

Consume with `useTranslations('<Namespace>')` scoped to the deepest namespace; components routinely use multiple scoped translators (feature `t` + `Shared.Validation` + `Shared.Notification`). Use ICU interpolation `t('key', { email })` and plurals `{count, plural, ...}`; format dates/numbers with `useFormatter().dateTime`. `NextIntlClientProvider` lives only in `shared/provider.tsx`.

See `references/i18n.md`. Cite `next.config.ts`, `src/modules/shared/i18n/messages.ts`.

## 10. UI Components (Mantine)

Mantine v9 is the primary UI layer. Every shared/module component is a **thin wrapper** over a Mantine primitive (`Button`, `Modal`, `TextInput`, `Table`, `Card`, `Menu`, `Popover`, `ActionIcon`, `ThemeIcon`, `AppShell`, `Loader`, `Skeleton`). Never hand-roll a Button/Modal/Spinner. There is **no custom Spinner** — use Mantine `Loader type="bars"`, `Skeleton`, and `Button loading`.

Design defaults live in `src/modules/shared/theme.ts` via `createTheme({ primaryColor: 'indigo', defaultRadius: 'sm', components: { ...defaultProps/styles } })`, applied through `<MantineProvider theme={theme}>`. Configure component defaults there, not per call.

Real shared components: `ConfirmModal`, `CopyInput`, `EmailInput`, `PasswordInput`, `FormRootError`, `RouteProgress`. Real module components: `DashboardTable`, `DashboardPageHeader`, `DashboardCreateButton`, `MediaLibraryFileSelect`.

Prop typing: extend Mantine `*Props` and `Omit` what the wrapper controls, e.g.:

```ts
type Props = Omit<MantineTextInputProps, 'value' | 'readOnly' | 'rightSection'> & { value: string }
```

Notifications = `@mantine/notifications`, fired imperatively: `notifications.show({ color: 'teal' | 'red', title, message })`. The single `<Notifications/>` outlet lives in `shared/provider.tsx`; there is no redux notification state. Route progress = `@mantine/nprogress` via the shared `RouteProgress` component. File upload = `@mantine/dropzone` (`Dropzone.Accept/Reject/Idle` slots) wired to `@mantine/form` (distinct from the `MediaLibraryFileSelect` Popover picker).

See `references/ui-and-mantine.md`. Cite `src/modules/shared/theme.ts`, `src/modules/shared/components/confirm-modal/index.tsx`.

## 11. Icons and Assets

**lucide-react first.** Import named icons and render with explicit `size` + `strokeWidth`:

```tsx
import { LogIn, type LucideIcon } from 'lucide-react'
<LogIn size={18} strokeWidth={1.9} />
```

Type dynamic icons as `LucideIcon`. Place icons inside Mantine slots (`leftSection`, `rightSection`, `separator`) or wrap in `ThemeIcon`.

Custom SVG-as-React-component is a **fallback** via `@svgr/webpack` (the `turbopack.rules` SVG rule in `next.config.ts`), typed by `src/types/svg.d.ts` (`declare module '*.svg'` as `FC<SVGProps<SVGSVGElement>>`). It is currently unused in `src`. There is **no** `src/modules/shared/components/icons/` directory.

There is **no `public/` directory** in the reference app; the only SVG is `src/app/icon.svg` (App Router metadata favicon, not imported). Any `public/assets/<module>/` guidance is forward-looking, not present in the reference.

See `references/env-and-assets.md`. Cite `next.config.ts`, `src/types/svg.d.ts`.

## 12. Styles

Two coexisting layers:

1. **Mantine** — `theme.ts` defaults + component props + style props (`h`, `w`, `p*`, `gap`, `justify`, `fw`, `ta`, `c`).
2. **SCSS modules + BEM** — co-located `styles.module.scss`.

Decision rule:

- `theme.ts` — global/per-component design defaults.
- Mantine style props — small one-off spacing/alignment.
- SCSS module — custom layout/grid/borders/backgrounds/responsive/bespoke visuals.

Style Mantine internals via `classNames={{ part: styles.bemClass }}` (preferred) or the `:global(.mantine-*)` escape hatch.

Every component SCSS module starts with the exact line:

```scss
@use "~styles/app.scss" as *;
```

`app.scss` `@forward`s `variables/index` + `mixins/index`. Shared SCSS color tokens in `src/styles/variables/_variables.scss` are defined as `var(--mantine-color-*)` (not hex) — this is the SCSS <-> Mantine bridge. Prefer the shared `$tokens` (`$body-bg-color`, `$surface-color`, `$black-color`, `$text-muted-color`, `$gray-bg-color`, `$border-color`); fall back to `var(--mantine-color-*)` for ad-hoc shades.

Real mixins: `transition()` (no duration arg), `mobile-small`, `mobile`, `tablet`, `desktop-small`, `desktop` (`desktop` is `min-width`), `maxWidth($width)`, `cutText($maxWidth)`. There is **no** `container()` mixin and no `$container-width`/`$primary-color`/`$white-color`/`$secondary-color`/`$font-secondary-color`/`$modal-overlay-color`.

z-index ladder is set per-component in theme/props (e.g. Modal `1200`, Select combobox `1400`, Notifications `1300`, table Menu `1100`); keep new overlays consistent with these.

See `references/styles.md` and `references/ui-and-mantine.md`.

## 13. Models and Types

- Feature/module types live in `models/`. API types go in `<module>/models/<domain>-api.interface.ts` (e.g. `dashboard/models/admin-users-api.interface.ts`).
- Shared generics live in `shared/models` — `PaginationRequest` / `PaginationResponse<T>` (`pagination.interface.ts`), `IApiErrorResponse` (`api-error-response.interface.ts`).
- Export public types through the module `index.tsx` (e.g. `export type { IAccount, IAdminPermissions }`).
- Small local types used by one component can be declared in that component file.
- Do not put domain types in `shared`.

## 14. Helpers

Use `helpers/`, never a parallel `utils/`. Scope by use: feature-only -> `feature/helpers`; module-wide -> `module/helpers`; app-wide -> `shared/helpers`.

Real `shared/helpers`: `api.ts` (`getApiUrl`, `getApiFirstErrorMessage`, `formatApiDate`), `rtk-query.ts` (`baseFetchQuery`), `common.ts` (`getFileTypeByMime`, `formatFileSize`, `formatDate`), `types.ts`, `validation.ts` (`isValidEmail`).

## 15. Env & Scripts

- Do **not** use `NEXT_PUBLIC_*`. Whitelist vars in `next.config.ts` under `env: {...}` and mirror them in `.env.example`.
- Real keys: `APP_NAME`, `APP_LOCALE`, `API_URL`. `APP_LOCALE` selects the active locale.
- npm scripts are only `dev` / `build` / `start` / `lint` (`dev` uses `--hostname admin.app.test`). There is **no** `typecheck` or `test` script.

Path aliases (`tsconfig.json`):

```txt
@/*              -> ./src/*
@styles/*        -> ./src/styles/*
styles/app.scss  -> ./src/styles/app.scss
@modules/shared/* -> ./src/modules/shared/*
@modules/auth     -> ./src/modules/auth/index
@modules/auth/*   -> ./src/modules/auth/*
@modules/dashboard   -> ./src/modules/dashboard/index
@modules/dashboard/* -> ./src/modules/dashboard/*
```

Every new non-shared module must be registered **twice**: a bare alias -> `index`, plus a `/*` deep alias.

See `references/env-and-assets.md`.

## 16. Naming

- Files and folders: `kebab-case`.
- React components: `PascalCase`.
- Hooks: export `useSomething`, file `use-something.ts`.
- Interfaces: `IName` when that is the project style; type files `*.interface.ts`.

Real examples: `use-api-form-errors.ts`, `api-error-response.interface.ts`, `admin-users-api.interface.ts`, `features/login-form/`, `components/media-library-file-select/`.

## 17. Verification

- Do not add unit/integration tests by default (there is no `test` script). Write tests only when explicitly required by `AGENTS.md`, the user's task, or project rules.
- When UI, styles, responsive layout, or interactive behavior change, verify with the project's tooling.
- Minimum mobile width: `375px`. Take the max mobile width from the project's variables/mixins (`$screen-mobile = 768px`, `mobile` mixin).
- Check: no horizontal scroll, no text overlap, working buttons/modals/menus, and visible loading/error states.

## Reference files

- `references/module-boundaries.md`
- `references/store-and-api.md`
- `references/forms-and-errors.md`
- `references/i18n.md`
- `references/ui-and-mantine.md`
- `references/styles.md`
- `references/env-and-assets.md`
- `assets/eslint/modules-imports.js`
- `assets/types/svg.d.ts`
- `assets/types/global.d.ts`
- `assets/store/store.ts`
- `assets/hooks/use-app-dispatch.ts`
- `assets/hooks/use-app-selector.ts`
