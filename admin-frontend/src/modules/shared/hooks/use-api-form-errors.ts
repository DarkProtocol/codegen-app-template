import { useEffect } from 'react'
import type { UseFormReturnType } from '@mantine/form'
import type { SerializedError } from '@reduxjs/toolkit'
import type { FetchBaseQueryError } from '@reduxjs/toolkit/query'
import { useTranslations } from 'next-intl'
import type { IApiErrorResponse } from '@modules/shared/models/api-error-response.interface'

type ApiFormError = FetchBaseQueryError | SerializedError | IApiErrorResponse
type ApiFormValues = Record<string, unknown>
type ApiFormField<T extends ApiFormValues> = keyof T & string

export function useApiFormErrors<T extends ApiFormValues>(form: UseFormReturnType<T>, error: ApiFormError | undefined) {
    const t = useTranslations('Shared.Errors')
    const { getValues, setFieldError } = form

    useEffect(() => {
        if (!error) return

        const fallbackMessage = t('somethingWentWrong')

        const setFormFieldError = (field: ApiFormField<T> | 'root', message: string) => {
            setFieldError(field as ApiFormField<T>, message)
        }

        if (typeof error !== 'object' || error === null) {
            setFormFieldError('root', String(error) || fallbackMessage)
            return
        }

        let apiError: IApiErrorResponse | null = null
        if ('data' in error && isApiErrorResponse(error.data)) {
            apiError = error.data
        } else if (isApiErrorResponse(error)) {
            apiError = error
        }

        if (apiError?.errors && Object.keys(apiError.errors).length > 0) {
            const values = getValues()

            Object.entries(apiError.errors).forEach(([field, message]) => {
                if (!message) return

                if (field in values) {
                    setFormFieldError(field as ApiFormField<T>, message)
                } else {
                    setFormFieldError('root', message)
                }
            })
            return
        }

        const message = 'message' in error && error.message ? error.message : fallbackMessage
        setFormFieldError('root', message)
    }, [error, getValues, setFieldError, t])
}

function isApiErrorResponse(error: unknown): error is IApiErrorResponse {
    return isObject(error) && 'errors' in error && isErrorMap(error.errors)
}

function isErrorMap(errors: unknown): errors is NonNullable<IApiErrorResponse['errors']> {
    if (!isObject(errors) || Array.isArray(errors)) {
        return false
    }

    return Object.values(errors).every((message) => typeof message === 'string')
}

function isObject(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null
}
