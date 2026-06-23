import type { IApiErrorResponse } from '@modules/shared/models/api-error-response.interface'
import { formatDate } from './common'

export function getApiUrl(ver?: string): string {
    const apiUrl = process.env.API_URL?.replace(/\/+$/, '') ?? ''
    const apiVersion = ver ? `/${ver}` : ''

    return `${apiUrl}${apiVersion}`
}

export function getApiFirstErrorMessage(error: unknown, field?: string): string | null {
    if (typeof error !== 'object' || error === null || !('errors' in error)) {
        return null
    }

    const errors = (error as IApiErrorResponse).errors
    if (!errors) {
        return null
    }

    const messages = field ? [errors[field], ...Object.values(errors)] : Object.values(errors)
    for (const message of messages) {
        if (message?.trim()) {
            return message
        }
    }

    return null
}

export function formatApiDate(value: string): string {
    const date = new Date(value)

    if (Number.isNaN(date.getTime())) {
        return value
    }

    return formatDate(date)
}
