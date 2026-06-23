import {
    PasswordInput as MantinePasswordInput,
    type PasswordInputProps as MantinePasswordInputProps,
} from '@mantine/core'
import { useTranslations } from 'next-intl'
import { LockKeyhole } from 'lucide-react'

type Props = MantinePasswordInputProps & Omit<React.ComponentPropsWithoutRef<'input'>, keyof MantinePasswordInputProps>

export function PasswordInput({ label, placeholder, leftSection, ...props }: Props) {
    const t = useTranslations('Shared.Components')

    return (
        <MantinePasswordInput
            label={label ?? t('passwordLabel')}
            placeholder={placeholder ?? t('passwordPlaceholder')}
            leftSection={leftSection ?? <LockKeyhole size={18} strokeWidth={1.8} />}
            {...props}
        />
    )
}
