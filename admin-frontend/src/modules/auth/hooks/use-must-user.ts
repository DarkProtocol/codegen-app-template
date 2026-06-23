'use client'

import { useWhoamiQuery } from '../store/api'

export function useMustUser() {
    const { data, refetch } = useWhoamiQuery()

    if (!data) {
        if (typeof window !== 'undefined') {
            window.location.reload()
        }

        throw new Error('useMustUser requires authenticated user data')
    }

    return {
        user: data.account,
        can: data.can,
        reload: refetch,
    }
}
