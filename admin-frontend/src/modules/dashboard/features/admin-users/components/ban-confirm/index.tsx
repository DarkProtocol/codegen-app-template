'use client'

import { notifications } from '@mantine/notifications'
import { useTranslations } from 'next-intl'

import type { AdminUser } from '@modules/dashboard/models/admin-users-api.interface'
import {
    adminUsersApi,
    useBanAdminUserMutation,
    useUnbanAdminUserMutation,
} from '@modules/dashboard/store/admin-users-api'
import type { PaginationRequest } from '@modules/shared/models/pagination.interface'
import { ConfirmModal } from '@modules/shared/components/confirm-modal'
import { useAppDispatch } from '@modules/shared/hooks/use-app-dispatch'

type Props = {
    user: AdminUser | null
    listParams: PaginationRequest
    onClose: () => void
}

export function AdminUserBanConfirm({ user, listParams, onClose }: Props) {
    const t = useTranslations('Dashboard.AdminUsers')
    const notificationT = useTranslations('Shared.Notification')
    const dispatch = useAppDispatch()
    const [banAdminUser, { isLoading: isBanSubmitting }] = useBanAdminUserMutation()
    const [unbanAdminUser, { isLoading: isUnbanSubmitting }] = useUnbanAdminUserMutation()
    const isBanned = Boolean(user?.bannedAt)
    const loading = isBanSubmitting || isUnbanSubmitting

    const handleConfirm = async () => {
        if (!user) {
            return
        }

        try {
            if (isBanned) {
                await unbanAdminUser({ id: user.id }).unwrap()
                updateCachedUserStatus(dispatch, listParams, user.id, null)
                notifications.show({
                    color: 'teal',
                    title: t('BanConfirm.unbanSuccessTitle'),
                    message: t('BanConfirm.unbanSuccessMessage'),
                })
            } else {
                await banAdminUser({ id: user.id }).unwrap()
                updateCachedUserStatus(dispatch, listParams, user.id, new Date().toISOString())
                notifications.show({
                    color: 'red',
                    title: t('BanConfirm.banSuccessTitle'),
                    message: t('BanConfirm.banSuccessMessage'),
                })
            }

            onClose()
        } catch {
            notifications.show({
                color: 'red',
                title: notificationT('internalErrorTitle'),
                message: notificationT('internalErrorMessage'),
            })
        }
    }

    return (
        <ConfirmModal
            opened={Boolean(user)}
            title={isBanned ? t('BanConfirm.unbanTitle') : t('BanConfirm.banTitle')}
            message={
                user
                    ? t(isBanned ? 'BanConfirm.unbanMessage' : 'BanConfirm.banMessage', {
                          email: user.email,
                      })
                    : ''
            }
            confirmLabel={isBanned ? t('BanConfirm.unbanConfirm') : t('BanConfirm.banConfirm')}
            confirmColor={isBanned ? 'teal' : 'red'}
            loading={loading}
            onClose={onClose}
            onConfirm={handleConfirm}
        />
    )
}

function updateCachedUserStatus(
    dispatch: ReturnType<typeof useAppDispatch>,
    listParams: PaginationRequest,
    id: string,
    bannedAt: string | null
) {
    dispatch(
        adminUsersApi.util.updateQueryData('adminUsersList', listParams, (draft) => {
            const user = draft.data.find((item) => item.id === id)

            if (user) {
                user.bannedAt = bannedAt
            }
        })
    )
}
