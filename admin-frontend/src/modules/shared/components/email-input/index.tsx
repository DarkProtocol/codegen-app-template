import { TextInput, type TextInputProps as MantineTextInputProps } from '@mantine/core'
import { useTranslations } from 'next-intl'
import { Mail } from 'lucide-react'

type Props = MantineTextInputProps & Omit<React.ComponentPropsWithoutRef<'input'>, keyof MantineTextInputProps>

export function EmailInput({ label, placeholder, type = 'email', leftSection, ...props }: Props) {
    const t = useTranslations('Shared.Components')

    return (
        <TextInput
            label={label ?? t('emailLabel')}
            placeholder={placeholder ?? t('emailPlaceholder')}
            type={type}
            leftSection={leftSection ?? <Mail size={18} strokeWidth={1.8} />}
            {...props}
        />
    )
}
