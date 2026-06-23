# Store and API

State lives in **RTK Query only**. There are no Redux slices anywhere — no
`createSlice`, no `*.slice.ts`, no per-module `store.ts`. The single store file is
the root `src/modules/shared/store/store.ts`, which composes the per-resource RTK
Query APIs owned by each module. Auth is cookie-based and enforced at the React
layer, not by a fetch interceptor.

Pins: `@reduxjs/toolkit ^2` + `react-redux ^9` (RTK Query), Next.js `^16`,
React `^19`.

## 1. State Model

- All server state is RTK Query cache. There is no client slice for UI/auth/
  notifications. Local UI state is plain React state; notifications are fired
  imperatively through `@mantine/notifications` (see provider wiring below).
- The only `configureStore`/`combineReducers` lives in
  `src/modules/shared/store/store.ts`. Do not add `createSlice`, `*.slice.ts`,
  or a `store/store.ts` inside a feature module.

## 2. Module Store Shape

Each module owns **multiple** per-resource API files under `<module>/store/`,
one per backend domain, named `<domain>-api.ts`:

```txt
src/modules/dashboard/store/
  account-api.ts        // accountApi      reducerPath 'account/api'
  admin-users-api.ts    // adminUsersApi   reducerPath 'adminUsers/api'
  media-library-api.ts  // mediaLibraryApi reducerPath 'mediaLibrary/api'

src/modules/auth/store/
  api.ts                // authApi         reducerPath 'auth/api'  (lone single-file case)
```

- `reducerPath` convention is `'<domain>/api'`.
- `auth` is the one module with a single `store/api.ts`; every other domain gets
  its own `<domain>-api.ts`. Do not collapse a module into one `store/api.ts` +
  `store/store.ts`.
- API request/response types live in `<module>/models/<domain>-api.interface.ts`
  (e.g. `dashboard/models/admin-users-api.interface.ts`). Cross-cutting generics
  `PaginationRequest` / `PaginationResponse<T>` live in
  `src/modules/shared/models/pagination.interface.ts`.

## 3. Defining an API

Call `createApi({ reducerPath, baseQuery, tagTypes, endpoints })`, then export the
generated hooks **and** the api object from the same file. `baseQuery` is always
the shared `baseFetchQuery('<path>')`.

`src/modules/auth/store/api.ts` — minimal example, single tag:

```ts
import { createApi } from '@reduxjs/toolkit/query/react'
import { baseFetchQuery } from '@modules/shared/helpers/rtk-query'

import type { IWhoami } from '../models/account.interface'
import type { ILogin } from '../models/login.interface'

export const authApi = createApi({
  reducerPath: 'auth/api',
  baseQuery: baseFetchQuery('/auth'),
  tagTypes: ['CurrentUser'],
  endpoints: (builder) => ({
    whoami: builder.query<IWhoami, void>({
      query: () => ({ url: '/whoami', method: 'POST' }),
      providesTags: ['CurrentUser'],
    }),
    login: builder.mutation<void, ILogin>({
      query: (params) => ({ url: '/login', method: 'POST', body: params }),
      invalidatesTags: ['CurrentUser'],
    }),
    logout: builder.mutation<void, void>({
      query: () => ({ url: '/logout', method: 'POST' }),
      invalidatesTags: ['CurrentUser'],
    }),
  }),
})

export const { useLoginMutation, useLogoutMutation, useWhoamiQuery } = authApi
```

`src/modules/dashboard/store/admin-users-api.ts` — tag-based cache invalidation,
typed request/response, pagination:

```ts
import { createApi } from '@reduxjs/toolkit/query/react'
import { baseFetchQuery } from '@modules/shared/helpers/rtk-query'

import type {
  AdminUser,
  AdminUsersListResponse,
  CreateAdminUserParams,
} from '../models/admin-users-api.interface'
import type { PaginationRequest } from '@modules/shared/models/pagination.interface'

export const adminUsersApi = createApi({
  reducerPath: 'adminUsers/api',
  baseQuery: baseFetchQuery('/admin-users'),
  tagTypes: ['AdminUsers', 'AdminUserRoles'],
  endpoints: (builder) => ({
    adminUsersList: builder.query<AdminUsersListResponse, PaginationRequest>({
      query: (params) => ({ url: '/list', method: 'GET', params }),
      providesTags: ['AdminUsers'],
    }),
    createAdminUser: builder.mutation<AdminUser, CreateAdminUserParams>({
      query: (params) => ({ url: '/create', method: 'POST', body: params }),
      invalidatesTags: ['AdminUsers'], // list refetches automatically
    }),
    // ...banAdminUser, unbanAdminUser, resetAdminUserPassword, changeAdminUserRole
  }),
})

export const {
  useAdminUsersListQuery,
  useCreateAdminUserMutation,
  // ...one generated hook per endpoint
} = adminUsersApi
```

The matching types in `src/modules/dashboard/models/admin-users-api.interface.ts`
reuse the shared generic:

```ts
import type { PaginationResponse } from '@modules/shared/models/pagination.interface'

export type AdminUsersListResponse = PaginationResponse<AdminUser>
```

Tag conventions in the reference app: `authApi` uses `['CurrentUser']`;
`adminUsersApi` uses `['AdminUsers', 'AdminUserRoles']`; `mediaLibraryApi` uses
three media tags; `accountApi` declares **no** `tagTypes` (its mutations are
fire-and-forget and invalidate nothing). Use `providesTags` on reads and
`invalidatesTags` on writes so dependent queries refetch.

## 4. Base Query and API URL

`src/modules/shared/helpers/rtk-query.ts` is the single base query. It wraps
`fetchBaseQuery` with `credentials: 'include'` (cookie auth), a native
`URLSearchParams` param serializer that emits `key[]=` for arrays (the
`query-string` package is **not** a dependency), shows a localized Mantine
notification **only** for HTTP 500, and unwraps the error to `{ error: error.data }`
so consumers see the flat `IApiErrorResponse`:

```ts
import type { BaseQueryFn, FetchArgs, FetchBaseQueryError } from '@reduxjs/toolkit/query/react'
import { fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { notifications } from '@mantine/notifications'
import type { IApiErrorResponse } from '@modules/shared/models/api-error-response.interface'
import { defaultLocale, sharedMessages, type SharedLocale } from '@modules/shared/i18n/shared-messages'

import { getApiUrl } from './api'

export type BaseQuery = BaseQueryFn<FetchArgs, unknown, IApiErrorResponse>

export function baseFetchQuery(path: string, ver?: string): BaseQuery {
  const rawBaseQuery = fetchBaseQuery({
    baseUrl: getApiUrl(ver) + path,
    credentials: 'include',
    paramsSerializer: stringifyParams,
  })

  return async (args, api, extraOptions) => {
    const result = await rawBaseQuery(args, api, extraOptions)

    if (result.error) {
      const error = parseResponseError(result.error)
      if (error.status === 500) {
        showInternalErrorNotification()
      }
      return { error: error.data }
    }

    return result
  }
}

function showInternalErrorNotification() {
  const messages = sharedMessages[getDocumentLocale()].Notification
  notifications.show({
    color: 'red',
    title: messages.internalErrorTitle,
    message: messages.internalErrorMessage,
  })
}

function getDocumentLocale(): SharedLocale {
  if (typeof document === 'undefined') return defaultLocale
  const locale = document.documentElement.lang
  return locale in sharedMessages ? (locale as SharedLocale) : defaultLocale
}

function stringifyParams(params: Record<string, unknown>): string {
  const searchParams = new URLSearchParams()
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null) return
    if (Array.isArray(value)) {
      value.forEach((item) => searchParams.append(`${key}[]`, String(item)))
      return
    }
    searchParams.append(key, String(value))
  })
  return searchParams.toString()
}
```

`parseResponseError` keeps the numeric `status` (for the 500 check) and runs the
payload through `parseErrorData` → only objects that contain an `errors` key are
treated as `IApiErrorResponse`; everything else collapses to `{}`. Notice the
serializer fires the notification but still returns `error.data` (the flat map),
never the `status`/`originalStatus` envelope.

`src/modules/shared/helpers/api.ts` builds the base URL. `ver` is **optional with
no default** — `/<ver>` is appended only when passed. There is no `'1.0'` default.

```ts
export function getApiUrl(ver?: string): string {
  const apiUrl = process.env.API_URL?.replace(/\/+$/, '') ?? ''
  const apiVersion = ver ? `/${ver}` : ''
  return `${apiUrl}${apiVersion}`
}
```

`API_URL` is read from `process.env` (whitelisted in `next.config.ts` `env:{}`,
not a `NEXT_PUBLIC_*` var). `api.ts` also exports `getApiFirstErrorMessage` and
`formatApiDate` helpers over the same `IApiErrorResponse` shape.

## 5. Auth / Session Model

There is **no** `authFetchQuery`, no `401` interceptor, no refresh-token flow, no
`refreshLock`, no retry, and no logout-on-error in the data layer. Auth is purely
cookie-based via `credentials: 'include'`; the session is enforced at the React
layer.

- `src/modules/auth/provider.tsx` is the auth gate. It calls `useAuthUser()`
  (which runs `useWhoamiQuery()`) and, once the check resolves, redirects with
  `next/navigation`: authenticated users on `/login` go to the dashboard,
  unauthenticated users on dashboard routes go to `/login`. While `isChecking`
  it renders a full-page Mantine `<Loader type="bars" />`.
- `useMustUser()` (`src/modules/auth/hooks/use-must-user.ts`) reads the cached
  `whoami` data and, if absent, calls `window.location.reload()` and throws —
  components below the gate can assume a user exists. It returns
  `{ user, can, reload }`.
- Logout (`src/modules/auth/hooks/use-logout.ts`) is a semantic hook:

```ts
const handleLogout = useCallback(async () => {
  try {
    await logout().unwrap()                  // useLogoutMutation()
    dispatch(authApi.util.resetApiState())   // clear cached whoami + everything
    window.location.replace(LOGIN_PATH)
  } catch {
    router.refresh()
  }
}, [dispatch, logout, router])
```

## 6. Root Store

`src/modules/shared/store/store.ts` is the only store. It registers every api's
reducer and middleware, importing the api objects through module **barrels**
(`@modules/auth`, `@modules/dashboard`):

```ts
import { combineReducers, configureStore } from '@reduxjs/toolkit'
import { authApi } from '@modules/auth'
import { accountApi, adminUsersApi, mediaLibraryApi } from '@modules/dashboard'

const rootReducer = combineReducers({
  [authApi.reducerPath]: authApi.reducer,
  [accountApi.reducerPath]: accountApi.reducer,
  [adminUsersApi.reducerPath]: adminUsersApi.reducer,
  [mediaLibraryApi.reducerPath]: mediaLibraryApi.reducer,
})

export const setupStore = () =>
  configureStore({
    reducer: rootReducer,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(
        authApi.middleware,
        accountApi.middleware,
        adminUsersApi.middleware,
        mediaLibraryApi.middleware
      ),
  })

export type RootState = ReturnType<typeof rootReducer>
export type AppStore = ReturnType<typeof setupStore>
export type AppDispatch = AppStore['dispatch']
```

Adding a new resource = add its api to both `combineReducers` (reducer) and
`.concat(...)` (middleware), importing the object via the owning module barrel.
There are no slice reducers to register.

> Scaffold note: `assets/store/store.ts` ships an `exampleApi`/`exampleSlice`
> placeholder. Replace it wholesale with the structure above; the reference app
> has **no slices**, so drop the `*.slice` import and the `sharedSlice` reducer.

## 7. Consumption and Cross-Module Use

The generated RTK Query hooks **are** the public consumption surface.

- Components import hooks directly from the api file, including across modules via
  the deep alias `@modules/<module>/store/<name>-api`. Example: the admin-users
  list component imports `useAdminUsersListQuery` from
  `@modules/dashboard/store/admin-users-api`.
- Each module `index.tsx` re-exports the **api objects** (not the hooks) so the
  root store can register reducers/middleware:

```ts
// src/modules/dashboard/index.tsx
export { accountApi } from './store/account-api'
export { adminUsersApi } from './store/admin-users-api'
export { mediaLibraryApi } from './store/media-library-api'
```

  (`auth/index.tsx` likewise re-exports `authApi`.)
- Cross-module *behavior* is exposed as semantic hooks through the barrel —
  `auth` exports `useMustUser` and `useLogout` rather than its low-level whoami
  hook. Prefer these for cross-module needs; reach for raw generated hooks within
  the owning module or via the deep `store/<name>-api` alias.

## 8. Typed Redux Hooks

Typed dispatch/selector hooks live in `shared/hooks` and pull their types from the
root store. These match the bundled assets exactly
(`assets/hooks/use-app-dispatch.ts`, `assets/hooks/use-app-selector.ts`):

```ts
// src/modules/shared/hooks/use-app-dispatch.ts
import { useDispatch } from 'react-redux'
import { AppDispatch } from '@modules/shared/store/store'

export const useAppDispatch = () => useDispatch<AppDispatch>()
```

```ts
// src/modules/shared/hooks/use-app-selector.ts
import { TypedUseSelectorHook, useSelector } from 'react-redux'
import { RootState } from '@modules/shared/store/store'

export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector
```

In practice there is no app slice to select, so these are scaffolding; most code
uses the generated query/mutation hooks directly.

## 9. Upload / Download Patterns

`src/modules/dashboard/store/media-library-api.ts` shows both. Its base path is
`''`, so each endpoint declares its full path — useful when one api spans
multiple URL prefixes (`/admin/media/...` and `/uploads/...`).

Multipart upload: build `FormData` inside `query()` and return it as `body` (RTK
Query sends it without a forced `Content-Type`):

```ts
createMediaLibraryFile: builder.mutation<
  MediaLibraryFile,
  { folderId?: string | null; name: string; file: File; isPublic?: boolean }
>({
  query: ({ file, ...params }) => {
    const body = new FormData()
    body.append('file', file)
    Object.entries(params).forEach(([key, value]) => {
      if (value === undefined || value === null) return
      body.append(key, typeof value === 'boolean' ? Number(value).toString() : String(value))
    })
    return { url: '/admin/media/files', method: 'POST', body }
  },
  invalidatesTags: ['MediaLibraryFolderContent'],
}),
```

Binary download: set `responseHandler` to return the blob:

```ts
mediaLibraryFileUpload: builder.query<Blob, { id: string }>({
  query: ({ id }) => ({
    url: `/uploads/${id}`,
    method: 'GET',
    responseHandler: (response) => response.blob(),
  }),
}),
```

For ad-hoc browser downloads outside RTK Query (e.g. triggering a `<a download>`),
the shared `useDownload()` hook in `src/modules/shared/hooks/use-download.ts`
fetches with `credentials: 'include'` and saves the blob.

## 10. Provider Wiring

`src/modules/shared/provider.tsx` instantiates the store once at module scope and
nests: react-redux `Provider` → `NextIntlClientProvider` → `MantineProvider`
(with the shared `theme`) plus the global `RouteProgress` and `Notifications`
outlets:

```tsx
'use client'

import { Provider as BaseProvider } from 'react-redux'
import { setupStore } from '@modules/shared/store/store'
import { MantineColorScheme, MantineProvider } from '@mantine/core'
import { Notifications } from '@mantine/notifications'
import { NextIntlClientProvider } from 'next-intl'
import { defaultTimeZone, type AppLocale } from '@modules/shared/i18n/messages'
import { theme } from '@modules/shared/theme'
import { RouteProgress } from '@modules/shared/components/route-progress'

const store = setupStore()

export function Provider({ defaultColorScheme, locale, messages, children }: ProviderProps) {
  return (
    <BaseProvider store={store}>
      <NextIntlClientProvider locale={locale} messages={messages} timeZone={defaultTimeZone}>
        <MantineProvider defaultColorScheme={defaultColorScheme} theme={theme}>
          <RouteProgress />
          {children}
          <Notifications position="bottom-right" autoClose={3500} />
        </MantineProvider>
      </NextIntlClientProvider>
    </BaseProvider>
  )
}
```

Composition above this in `src/app`: root layout renders `SharedProvider`
(redux + next-intl + Mantine) then `AuthProvider` (the auth gate);
`(dashboard)/layout` renders `DashboardProvider` (prefetches the media config
gated on `useMustUser().can.adminMedia`) then `DashboardLayout`. There is no
notification slice and no `RequestModal` — global UI is the Mantine
`Notifications` outlet plus imperative `notifications.show(...)`.
