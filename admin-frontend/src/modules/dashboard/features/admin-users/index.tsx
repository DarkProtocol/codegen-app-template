'use client'

import { useState } from 'react'

import { AdminUserCreateModal } from './components/create'
import { AdminUsersList } from './components/list'
import { useAdminUserRolesQuery } from '@modules/dashboard/store/admin-users-api'

const PER_PAGE = 10

export function AdminUsers() {
    const [isCreateModalOpened, setIsCreateModalOpened] = useState(false)
    const [page, setPage] = useState(1)
    const { data: roles, isFetching: isRolesFetching } = useAdminUserRolesQuery()

    return (
        <>
            <AdminUsersList
                page={page}
                perPage={PER_PAGE}
                roles={roles ?? []}
                loadingRoles={isRolesFetching}
                onChangePage={setPage}
                onCreateClick={() => setIsCreateModalOpened(true)}
            />
            <AdminUserCreateModal
                opened={isCreateModalOpened}
                roles={roles ?? []}
                loadingRoles={isRolesFetching}
                onClose={() => setIsCreateModalOpened(false)}
                onCreated={() => setPage(1)}
            />
        </>
    )
}
