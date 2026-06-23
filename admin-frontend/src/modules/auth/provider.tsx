'use client'

import { Center, Loader } from '@mantine/core'
import { ReactNode, useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'

import { isDashboardPath, isLoginPath, toDashboard, toLogin } from './helpers/navigation'
import { useAuthUser } from './hooks/use-auth-user'

interface ProviderProps {
    children: ReactNode
}

export function Provider({ children }: ProviderProps) {
    const pathname = usePathname()
    const router = useRouter()
    const inLogin = isLoginPath(pathname)
    const inDashboard = isDashboardPath(pathname)
    const { isAuthenticated, isChecking } = useAuthUser()

    useEffect(() => {
        if (isChecking) {
            return
        }

        if (isAuthenticated && inLogin) {
            toDashboard(router)
        }

        if (!isAuthenticated && inDashboard) {
            toLogin(router)
        }
    }, [inDashboard, inLogin, isAuthenticated, isChecking, router])

    if (isChecking) {
        return <FullPageLoader />
    }

    if (isAuthenticated && inLogin) {
        return <FullPageLoader />
    }

    if (!isAuthenticated && inDashboard) {
        return <FullPageLoader />
    }

    return children
}

function FullPageLoader() {
    return (
        <Center mih="100dvh" bg="gray.0">
            <Loader color="indigo" size="xl" type="bars" />
        </Center>
    )
}
