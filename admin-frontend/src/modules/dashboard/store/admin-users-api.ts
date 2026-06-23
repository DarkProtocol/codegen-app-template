import { createApi } from '@reduxjs/toolkit/query/react'
import { baseFetchQuery } from '@modules/shared/helpers/rtk-query'

import type {
    AdminUser,
    AdminUserRolesResponse,
    AdminUsersListResponse,
    ChangeAdminUserRoleParams,
    ChangeAdminUserStatusParams,
    CreateAdminUserParams,
    ResetAdminUserPasswordParams,
} from '../models/admin-users-api.interface'
import type { PaginationRequest } from '@modules/shared/models/pagination.interface'

export const adminUsersApi = createApi({
    reducerPath: 'adminUsers/api',
    baseQuery: baseFetchQuery('/admin-users'),
    tagTypes: ['AdminUsers', 'AdminUserRoles'],
    endpoints: (builder) => ({
        adminUsersList: builder.query<AdminUsersListResponse, PaginationRequest>({
            query: (params) => ({
                url: '/list',
                method: 'GET',
                params,
            }),
            providesTags: ['AdminUsers'],
        }),
        adminUserRoles: builder.query<AdminUserRolesResponse, void>({
            query: () => ({
                url: '/roles',
                method: 'GET',
            }),
            providesTags: ['AdminUserRoles'],
        }),
        createAdminUser: builder.mutation<AdminUser, CreateAdminUserParams>({
            query: (params) => ({
                url: '/create',
                method: 'POST',
                body: params,
            }),
            invalidatesTags: ['AdminUsers'],
        }),
        banAdminUser: builder.mutation<void, ChangeAdminUserStatusParams>({
            query: ({ id }) => ({
                url: `/ban/${id}`,
                method: 'POST',
            }),
        }),
        unbanAdminUser: builder.mutation<void, ChangeAdminUserStatusParams>({
            query: ({ id }) => ({
                url: `/unban/${id}`,
                method: 'POST',
            }),
        }),
        resetAdminUserPassword: builder.mutation<void, ResetAdminUserPasswordParams>({
            query: ({ id, password }) => ({
                url: `/password/${id}`,
                method: 'POST',
                body: { password },
            }),
        }),
        changeAdminUserRole: builder.mutation<void, ChangeAdminUserRoleParams>({
            query: ({ id, role }) => ({
                url: `/role/${id}`,
                method: 'POST',
                body: { role },
            }),
        }),
    }),
})

export const {
    useAdminUsersListQuery,
    useAdminUserRolesQuery,
    useCreateAdminUserMutation,
    useBanAdminUserMutation,
    useUnbanAdminUserMutation,
    useResetAdminUserPasswordMutation,
    useChangeAdminUserRoleMutation,
} = adminUsersApi
