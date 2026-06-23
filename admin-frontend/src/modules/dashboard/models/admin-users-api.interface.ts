import type { PaginationResponse } from '@modules/shared/models/pagination.interface'

export type AdminUserRole = 'admin' | 'editor'

export type AdminUser = {
    id: string
    email: string
    firstName: string
    lastName: string | null
    role: AdminUserRole
    createdAt: string
    updatedAt: string
    bannedAt: string | null
}

export type AdminUserRoleOption = {
    value: AdminUserRole
    label: string
}

export type AdminUsersListResponse = PaginationResponse<AdminUser>

export type CreateAdminUserParams = {
    email: string
    firstName: string
    lastName: string | null
    password: string
    role: AdminUserRole
}

export type ResetAdminUserPasswordParams = {
    id: string
    password: string
}

export type ChangeAdminUserRoleParams = {
    id: string
    role: AdminUserRole
}

export type ChangeAdminUserStatusParams = {
    id: string
}

export type AdminUserRolesResponse = AdminUserRoleOption[]
