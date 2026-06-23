'use client'

import { useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useDispatch } from 'react-redux'

import { LOGIN_PATH } from '../helpers/navigation'
import { authApi, useLogoutMutation } from '../store/api'

export function useLogout() {
    const router = useRouter()
    const dispatch = useDispatch()
    const [logout, logoutState] = useLogoutMutation()

    const handleLogout = useCallback(async () => {
        try {
            await logout().unwrap()
            dispatch(authApi.util.resetApiState())
            window.location.replace(LOGIN_PATH)
        } catch {
            router.refresh()
        }
    }, [dispatch, logout, router])

    return [handleLogout, logoutState] as const
}
