'use client'

import type { ReactNode } from 'react'
import { useMustUser } from '@modules/auth'

import { useMediaLibraryConfigQuery } from './store/media-library-api'

type ProviderProps = {
    children: ReactNode
}

export function Provider({ children }: ProviderProps) {
    const { can } = useMustUser()

    useMediaLibraryConfigQuery(undefined, {
        skip: !can.adminMedia,
    })

    return children
}
