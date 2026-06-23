'use client'

import Link from 'next/link'
import type { ElementType, ReactNode } from 'react'
import { Button, type ButtonProps } from '@mantine/core'
import { Plus } from 'lucide-react'
import { useTranslations } from 'next-intl'

type DashboardCreateButtonBaseProps = ButtonProps &
    React.ComponentPropsWithoutRef<'button'> & {
        component?: ElementType
        href?: string
    }

type Props = Omit<DashboardCreateButtonBaseProps, 'children' | 'color' | 'leftSection'> & {
    children?: ReactNode
}

export function DashboardCreateButton({ children, href, ...props }: Props) {
    const t = useTranslations('Dashboard.PageHeader')
    const Component = Button as ElementType<DashboardCreateButtonBaseProps>

    return (
        <Component
            {...props}
            component={href ? Link : props.component}
            href={href}
            color="teal"
            leftSection={<Plus size={18} strokeWidth={1.9} />}
        >
            {children ?? t('create')}
        </Component>
    )
}
