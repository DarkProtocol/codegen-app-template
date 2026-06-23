# Module Boundaries

The app is split into feature modules under `src/modules/`. The real modules are exactly
**`auth`**, **`dashboard`**, and **`shared`**. Boundaries are enforced by the custom ESLint rule
`custom-rules/modules-imports` and by the path aliases in `tsconfig.json`.

## 1. Public API

Every **non-shared** module exposes its public API through a barrel named **`index.tsx`** (file is
`index.tsx`, not `index.ts`). `auth` and `dashboard` each have one; **`shared` has NO barrel** and is
deep-import-only via `@modules/shared/*`.

`src/modules/auth/index.tsx` re-exports both UI/semantic surface and the RTK Query api OBJECT so the
root store can register it:

```tsx
export { LoginForm } from './features/login-form'
export { i18n } from './i18n'
export { authApi } from './store/api'
export { Provider } from './provider'
export { useMustUser } from './hooks/use-must-user'
export { useLogout } from './hooks/use-logout'
export type { IAccount, IAdminPermissions } from './models/account.interface'
```

`src/modules/dashboard/index.tsx` re-exports its top-level feature components, the renamed provider,
and the multiple per-resource api objects:

```tsx
export { AdminUsers } from './features/admin-users'
export { Dashboard } from './features/dashboard'
export { DashboardLayout } from './features/layout'
export { Provider as DashboardProvider } from './provider'
export { MediaLibrary } from './features/media-library'
export { i18n } from './i18n'
export { accountApi } from './store/account-api'
export { adminUsersApi } from './store/admin-users-api'
export { mediaLibraryApi } from './store/media-library-api'
```

**Cross-module imports go through the index** (the bare module alias):

```tsx
import { useLogout, useMustUser, type IAccount } from '@modules/auth'   // resolves to auth/index
import { DashboardLayout, DashboardProvider } from '@modules/dashboard' // resolves to dashboard/index
```

`tsconfig.json` registers each non-shared module **twice** — a bare alias pointing at the index and a
`/*` deep alias:

```jsonc
"paths": {
  "@/*": ["./src/*"],
  "@styles/*": ["./src/styles/*"],
  "styles/app.scss": ["./src/styles/app.scss"],
  "@modules/shared/*": ["./src/modules/shared/*"],   // shared: deep-only, no bare alias
  "@modules/auth": ["./src/modules/auth/index"],
  "@modules/auth/*": ["./src/modules/auth/*"],
  "@modules/dashboard": ["./src/modules/dashboard/index"],
  "@modules/dashboard/*": ["./src/modules/dashboard/*"]
}
```

> Adding a new non-shared module means registering it **twice** here (bare → `index`, plus `/*`).

The generated RTK Query hooks are the real consumption surface and **are** exported (from each
`*-api.ts`). Cross-module data access is either a semantic hook (`useMustUser`, `useLogout`) or a deep
import of a sibling module's api file (see §2) — not a re-exported list of every generated hook.

## 2. Intra-module imports

Inside the same module a file may use **relative paths OR absolute deep self-aliases**. The ESLint rule
explicitly allows any depth when the importing file lives inside the same module directory (it
short-circuits when `cleanDir` starts with `modules/<thatModule>`).

`src/modules/dashboard/features/admin-users/index.tsx` mixes both styles freely:

```tsx
import { AdminUserCreateModal } from './components/create'                  // relative sibling
import { AdminUsersList } from './components/list'                          // relative sibling
import { useAdminUserRolesQuery } from '@modules/dashboard/store/admin-users-api' // absolute self-alias
```

`src/modules/dashboard/features/admin-users/components/list/index.tsx` deep-imports module-level
components, models, and store via `@modules/dashboard/...` while still using `../` for feature-local
siblings:

```tsx
import { AdminUserBanConfirm } from '../ban-confirm'                        // feature-local
import { DashboardPageHeader } from '@modules/dashboard/components/page-header' // module-level
import { DashboardTable } from '@modules/dashboard/components/table'
import { useAdminUsersListQuery } from '@modules/dashboard/store/admin-users-api'
import type { AdminUser } from '@modules/dashboard/models/admin-users-api.interface'
import { useMustUser, type IAccount } from '@modules/auth'                  // cross-module via index
```

Both forms are valid for same-module code; absolute self-aliases avoid `../../../` ladders, relative
imports are fine for nearby siblings.

## 3. Feature boundaries

A feature can import module-level `components`, `models`, `store`, `hooks`, `helpers` (see §4), and may
import another **module's** public surface via its index.

**Feature → feature imports within the same module are permitted in practice** for top-level scenario
components surfaced through another feature's barrel. `src/modules/dashboard/features/layout/user-menu/index.tsx`
imports the `settings` feature's drawer:

```tsx
import { SettingsDrawer } from '@modules/dashboard/features/settings'
```

`SettingsDrawer` is the default export of `src/modules/dashboard/features/settings/index.tsx`, so this
is a feature pulling a sibling feature's public entry. The ESLint rule does not block it because both
files live under `modules/dashboard`. Prefer keeping cross-feature reuse at the **module level**
(`<module>/components`) where it is shared by many features; reserve feature→feature imports for one
feature embedding another whole feature's scenario component (drawer, modal, panel).

## 4. Module-level vs feature-level components

Two component tiers coexist:

- **Module-level**: `<module>/components/<name>/` — reusable across features.
  `dashboard/components/` holds `table/`, `page-header/`, `create-button/`, `media-library-file-select/`.
- **Feature-level**: `<module>/features/<feature>/components/*` — private to that feature
  (e.g. `features/admin-users/components/{list, create, change-role, ban-confirm, ...}`).

Features pull module-level components through the absolute self-alias, e.g. in
`features/admin-users/components/create/index.tsx`:

```tsx
import { DashboardCreateButton } from '@modules/dashboard/components/create-button'
```

Truly app-wide primitives live one level higher under `@modules/shared/components/*`
(`email-input`, `password-input`, `copy-input`, `confirm-modal`, `form-root-error`, `route-progress`) and
are deep-imported directly (§1). Promote a feature component to module-level when a second feature needs
it; promote to `shared` only when it carries no domain knowledge.

## 5. Provider-per-module

Every module ships a `provider.tsx` exporting a component named **`Provider`**, re-exported renamed
where needed (`Provider as DashboardProvider`; imported as `AuthProvider` / `SharedProvider`). They
nest, outer to inner.

**Root layout — `src/app/layout.tsx`** mounts `SharedProvider` (infrastructure: Redux + next-intl +
Mantine + `RouteProgress` + `Notifications`) then `AuthProvider` (the auth gate):

```tsx
import '@mantine/core/styles.css'
import '@mantine/dropzone/styles.css'
import '@mantine/nprogress/styles.css'
import '@mantine/notifications/styles.css'
import '@/styles/globals.scss'
import { ColorSchemeScript, mantineHtmlProps } from '@mantine/core'
import { getAppLocale, messages } from '@modules/shared/i18n/messages'
import { Provider as SharedProvider } from '@modules/shared/provider'
import { Provider as AuthProvider } from '@modules/auth'
// ...
<html lang={appLocale} {...mantineHtmlProps}>
  <head><ColorSchemeScript defaultColorScheme="light" /></head>
  <body>
    <SharedProvider defaultColorScheme="light" locale={appLocale} messages={messages[appLocale]}>
      <AuthProvider>{children}</AuthProvider>
    </SharedProvider>
  </body>
</html>
```

**`(dashboard)` layout — `src/app/(dashboard)/layout.tsx`** mounts `DashboardProvider` then
`DashboardLayout`:

```tsx
import { DashboardLayout, DashboardProvider } from '@modules/dashboard'
// ...
<DashboardProvider>
  <DashboardLayout appName={process.env.APP_NAME ?? ''}>{children}</DashboardLayout>
</DashboardProvider>
```

Each provider has a distinct job:

- **`shared/provider.tsx`** — infrastructure. `react-redux` `Provider` (store from
  `setupStore()`) → `NextIntlClientProvider` → `MantineProvider theme={theme}` → `RouteProgress` +
  `Notifications`. This is the only place `NextIntlClientProvider` and `<Notifications/>` live.
- **`auth/provider.tsx`** — the auth gate. Uses `useAuthUser()` + `usePathname()` to redirect (`toLogin`
  / `toDashboard`) and renders a full-page Mantine `<Loader type="bars">` while `isChecking` or
  mid-redirect:

  ```tsx
  if (isChecking) return <FullPageLoader />
  if (isAuthenticated && inLogin) return <FullPageLoader />
  if (!isAuthenticated && inDashboard) return <FullPageLoader />
  return children
  ```

- **`dashboard/provider.tsx`** — domain prefetch gated on permissions from `useMustUser()`:

  ```tsx
  const { can } = useMustUser()
  useMediaLibraryConfigQuery(undefined, { skip: !can.adminMedia })
  return children
  ```

## 6. Composition layers

`shared` is the only module that depends on `auth` + `dashboard`, and it does so in exactly **two**
composition points:

- **Store** — `src/modules/shared/store/store.ts` composes every module's RTK Query api into one root:

  ```tsx
  import { authApi } from '@modules/auth'
  import { accountApi, adminUsersApi, mediaLibraryApi } from '@modules/dashboard'
  combineReducers({
    [authApi.reducerPath]: authApi.reducer,
    [accountApi.reducerPath]: accountApi.reducer,
    [adminUsersApi.reducerPath]: adminUsersApi.reducer,
    [mediaLibraryApi.reducerPath]: mediaLibraryApi.reducer,
  })
  // middleware: getDefaultMiddleware().concat(authApi.middleware, accountApi.middleware, ...)
  ```

- **Messages** — `src/modules/shared/i18n/messages.ts` composes each module's flat `i18n` bundle plus
  `Shared`:

  ```tsx
  import { i18n as authI18n } from '@modules/auth'
  import { i18n as dashboardI18n } from '@modules/dashboard'
  export const messages = {
    ru: { ...authI18n.ru, ...dashboardI18n.ru, Shared: sharedMessages.ru },
    en: { ...authI18n.en, ...dashboardI18n.en, Shared: sharedMessages.en },
  } as const
  ```

When you add a module you wire it into **both** files (register its apis in the store, spread its `i18n`
into messages) in addition to the two `tsconfig.json` aliases (§1).

## 7. Route groups

App Router routes are thin shells that render a module's public component; all logic lives in the module.

- The dashboard lives in the **`(dashboard)`** route group with its own `layout.tsx` (§5). `/login` sits
  **outside** the group with its own page so it is not wrapped by `DashboardProvider`.
- Pages are one-liners. `src/app/(dashboard)/page.tsx` → `<Dashboard />`; `src/app/login/page.tsx` →
  `<LoginForm />`.
- Dynamic + nested segments resolve to the same feature component. `src/app/(dashboard)/media-library/[folderId]/page.tsx`:

  ```tsx
  import { MediaLibrary } from '@modules/dashboard'
  export default function MediaLibraryFolderPage() {
    return <MediaLibrary />
  }
  ```

- A nested `create/` segment can be a server-side redirect rather than a page.
  `src/app/(dashboard)/admin-users/create/page.tsx`:

  ```tsx
  import { redirect } from 'next/navigation'
  export default function CreateAdminUserPage() {
    redirect('/admin-users')
  }
  ```

## 8. ESLint rule

The boundary is enforced by `custom-rules/modules-imports` (level **error**). Real flat-config
registration in `eslint.config.mjs`:

```js
import customRules from './eslint-plugin-custom-rules/index.js'

export default defineConfig([
  // ...nextVitals, ...nextTs
  {
    plugins: { 'custom-rules': customRules },
    rules: {
      'custom-rules/modules-imports': [
        'error',
        {
          srcPath: 'src',
          modulesPath: 'modules',
          modulesAlias: '@modules',
          exceptModules: ['shared'],
        },
      ],
    },
  },
])
```

Behaviors:

- **Reject `@/modules/*`** — forces the `@modules` alias (auto-suggests the corrected path).
- **Allow intra-module deep imports** — if the importing file's directory starts with
  `modules/<sameModule>`, any depth is allowed (relative or `@modules/<self>/...`); see §2.
- **Allow any depth into `shared`** — anything under `@modules/shared/...` is exempt (`exceptModules`).
- **Force cross-module imports through the index** — importing `@modules/<other>/<deep>` from outside
  that module is reported with "Use import from index file".

### Known bug in the shipped rule — copy the corrected asset

The **shipped** rule `eslint-plugin-custom-rules/rules/modules-imports.js` has a bug on its final check:

```js
if (importParts > 3 || importParts[2] !== 'index') {   // BUG: importParts is an Array
```

`importParts` is the `split('/')` **array**, so `importParts > 3` is always `false`. Cross-module deep
detection therefore relies solely on the `importParts[2] !== 'index'` clause. It still catches the common
two-segment case (`@modules/dashboard/table`), but the intended length guard never fires.

The bundled **corrected** rule `assets/eslint/modules-imports.js` fixes it:

```js
if (importParts.length > 3 || importParts[2] !== 'index') {   // correct: compare length
```

When copying this template into a new project, replace the shipped rule with the corrected
`assets/eslint/modules-imports.js`.
