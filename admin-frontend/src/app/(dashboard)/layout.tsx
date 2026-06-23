import type { ReactNode } from 'react'

import { DashboardLayout, DashboardProvider } from '@modules/dashboard'

type Props = {
    children: ReactNode
}

export default function Layout({ children }: Props) {
    return (
        <DashboardProvider>
            <DashboardLayout appName={process.env.APP_NAME ?? ''}>{children}</DashboardLayout>
        </DashboardProvider>
    )
}
