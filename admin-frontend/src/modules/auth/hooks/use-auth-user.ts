'use client'

import { useWhoamiQuery } from '../store/api'

export function useAuthUser() {
    const { data, isLoading, isUninitialized } = useWhoamiQuery()
    const isChecking = isUninitialized || isLoading
    const isAuthenticated = Boolean(data?.account)

    return {
        isChecking,
        isAuthenticated,
    }
}
