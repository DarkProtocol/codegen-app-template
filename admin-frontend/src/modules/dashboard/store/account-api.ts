import { createApi } from '@reduxjs/toolkit/query/react'
import type { IAccount } from '@modules/auth'
import { baseFetchQuery } from '@modules/shared/helpers/rtk-query'

import type { IChangeAccount, IChangePassword } from '../models/account-api.interface'

export const accountApi = createApi({
    reducerPath: 'account/api',
    baseQuery: baseFetchQuery('/account'),
    endpoints: (builder) => ({
        changeAccount: builder.mutation<IAccount, IChangeAccount>({
            query: (params) => ({
                url: '',
                method: 'POST',
                body: params,
            }),
        }),
        changePassword: builder.mutation<void, IChangePassword>({
            query: (params) => ({
                url: '/password',
                method: 'POST',
                body: params,
            }),
        }),
    }),
})

export const { useChangeAccountMutation, useChangePasswordMutation } = accountApi
