'use client'

import { useEffect } from 'react'
import { Button, Fieldset, Group, SimpleGrid, Stack, TextInput } from '@mantine/core'
import { useForm } from '@mantine/form'
import { useTranslations } from 'next-intl'

import { useMustUser } from '@modules/auth'
import { FormRootError } from '@modules/shared/components/form-root-error'
import { useApiFormErrors } from '@modules/shared/hooks/use-api-form-errors'
import { useChangeAccountMutation } from '@modules/dashboard/store/account-api'

import styles from '@modules/dashboard/features/settings/styles.module.scss'

type ProfileFormValues = {
    firstName: string
    lastName: string
}

const initialValues: ProfileFormValues = {
    firstName: '',
    lastName: '',
}

type Props = {
    onSuccess?: () => void
}

export function SettingsProfileForm({ onSuccess }: Props) {
    const t = useTranslations('Dashboard.Settings.Profile')
    const sharedT = useTranslations('Shared.Validation')
    const { user, reload } = useMustUser()
    const [changeAccount, { isLoading: isSubmitting, error: changeAccountError, reset: resetChangeAccount }] =
        useChangeAccountMutation()
    const form = useForm<ProfileFormValues>({
        initialValues,
        onValuesChange: () => resetChangeAccount(),
        validate: {
            firstName: (value) => (value.trim().length > 0 ? null : sharedT('requiredField')),
        },
        transformValues: (values) => ({
            firstName: values.firstName.trim(),
            lastName: values.lastName.trim(),
        }),
    })

    useApiFormErrors(form, changeAccountError)

    const { clearErrors, resetDirty, setInitialValues, setValues } = form

    useEffect(() => {
        const userValues = {
            firstName: user.firstName,
            lastName: user.lastName ?? '',
        }

        setInitialValues(userValues)
        setValues(userValues)
        resetDirty(userValues)
        clearErrors()
    }, [clearErrors, resetDirty, setInitialValues, setValues, user.firstName, user.lastName])

    const handleSubmit = async (values: ProfileFormValues) => {
        form.clearErrors()
        resetChangeAccount()

        try {
            await changeAccount({
                firstName: values.firstName,
                lastName: values.lastName || null,
            }).unwrap()
            await reload()
            onSuccess?.()
        } catch {
            // Field and root errors are mapped by useApiFormErrors.
        }
    }

    return (
        <form noValidate onSubmit={form.onSubmit(handleSubmit)}>
            <Fieldset className={styles.settingsDrawer__fieldset} legend={t('title')}>
                <Stack gap="md">
                    <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
                        <TextInput
                            data-autofocus
                            required
                            label={t('firstNameLabel')}
                            placeholder={t('firstNamePlaceholder')}
                            autoComplete="given-name"
                            {...form.getInputProps('firstName')}
                        />
                        <TextInput
                            label={t('lastNameLabel')}
                            placeholder={t('lastNamePlaceholder')}
                            autoComplete="family-name"
                            {...form.getInputProps('lastName')}
                        />
                    </SimpleGrid>

                    <FormRootError error={form.errors.root} />

                    <Group justify="flex-end">
                        <Button type="submit" loading={isSubmitting}>
                            {t('submit')}
                        </Button>
                    </Group>
                </Stack>
            </Fieldset>
        </form>
    )
}
