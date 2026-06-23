import { Text, type TextProps } from '@mantine/core'
import type { ReactNode } from 'react'

type Props = Omit<TextProps, 'children'> & {
    error: ReactNode
}

export function FormRootError({ error, ...props }: Props) {
    if (!error) {
        return null
    }

    return (
        <Text c="var(--mantine-color-error)" fz={13} fw={600} lh={1.35} role="alert" {...props}>
            {error}
        </Text>
    )
}
