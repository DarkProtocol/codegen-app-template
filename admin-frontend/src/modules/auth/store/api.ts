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
            query: () => ({
                url: '/whoami',
                method: 'POST',
            }),
            providesTags: ['CurrentUser'],
        }),
        login: builder.mutation<void, ILogin>({
            query: (params) => ({
                url: '/login',
                method: 'POST',
                body: params,
            }),
            invalidatesTags: ['CurrentUser'],
        }),
        logout: builder.mutation<void, void>({
            query: () => ({
                url: '/logout',
                method: 'POST',
            }),
            invalidatesTags: ['CurrentUser'],
        }),
    }),
})

export const { useLoginMutation, useLogoutMutation, useWhoamiQuery } = authApi
