/**
 * Root Redux store — composes RTK Query apis ONLY (no slices).
 *
 * State management in this app is RTK Query exclusively: there are NO Redux
 * slices (no createSlice, no *.slice.ts, no per-module store.ts). The only
 * store.ts is THIS root store at src/modules/shared/store/store.ts.
 *
 * Each feature module owns MULTIPLE per-resource RTK Query api files named
 * '<domain>-api.ts' under '<module>/store/' (e.g. dashboard/store/account-api.ts,
 * admin-users-api.ts, media-library-api.ts). The lone single-file case is
 * auth/store/api.ts. Every api is created with createApi({ reducerPath: '<domain>/api',
 * baseQuery: baseFetchQuery('/path'), ... }) — see src/modules/shared/helpers/rtk-query.ts.
 *
 * The api OBJECTS are re-exported from each module barrel (index.tsx) so this
 * root store can register their reducers + middleware. Generated hooks are the
 * consumption surface and are imported directly from each *-api.ts at call sites.
 *
 * To add an api: import it from its module barrel, register its reducer in
 * combineReducers, and concat its middleware in setupStore.
 */
import { combineReducers, configureStore } from '@reduxjs/toolkit'
import { authApi } from '@modules/auth'
import { accountApi, adminUsersApi, mediaLibraryApi } from '@modules/dashboard'

const rootReducer = combineReducers({
    // auth module
    [authApi.reducerPath]: authApi.reducer,

    // dashboard module (one entry per per-resource api file)
    [accountApi.reducerPath]: accountApi.reducer,
    [adminUsersApi.reducerPath]: adminUsersApi.reducer,
    [mediaLibraryApi.reducerPath]: mediaLibraryApi.reducer,
})

export const setupStore = () =>
    configureStore({
        reducer: rootReducer,
        middleware: (getDefaultMiddleware) => {
            return getDefaultMiddleware().concat(
                authApi.middleware,
                accountApi.middleware,
                adminUsersApi.middleware,
                mediaLibraryApi.middleware
            )
        },
    })

export type RootState = ReturnType<typeof rootReducer>
export type AppStore = ReturnType<typeof setupStore>
export type AppDispatch = AppStore['dispatch']
