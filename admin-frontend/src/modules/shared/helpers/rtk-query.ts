import type { BaseQueryFn, FetchArgs, FetchBaseQueryError } from '@reduxjs/toolkit/query/react'
import { fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { notifications } from '@mantine/notifications'
import type { IApiErrorResponse } from '@modules/shared/models/api-error-response.interface'
import { defaultLocale, sharedMessages, type SharedLocale } from '@modules/shared/i18n/shared-messages'

import { getApiUrl } from './api'

export type BaseQuery = BaseQueryFn<FetchArgs, unknown, IApiErrorResponse>

interface ParsedResponseError {
    status?: number
    data: IApiErrorResponse
}

export function baseFetchQuery(path: string, ver?: string): BaseQuery {
    const rawBaseQuery = fetchBaseQuery({
        baseUrl: getApiUrl(ver) + path,
        credentials: 'include',
        paramsSerializer: stringifyParams,
    })

    return async (args, api, extraOptions) => {
        const result = await rawBaseQuery(args, api, extraOptions)

        if (result.error) {
            const error = parseResponseError(result.error)
            if (error.status === 500) {
                showInternalErrorNotification()
            }

            return {
                error: error.data,
            }
        }

        return result
    }
}

function showInternalErrorNotification() {
    const notificationMessages = sharedMessages[getDocumentLocale()].Notification

    notifications.show({
        color: 'red',
        title: notificationMessages.internalErrorTitle,
        message: notificationMessages.internalErrorMessage,
    })
}

function getDocumentLocale(): SharedLocale {
    if (typeof document === 'undefined') {
        return defaultLocale
    }

    const locale = document.documentElement.lang

    return locale in sharedMessages ? (locale as SharedLocale) : defaultLocale
}

function parseResponseError(error: FetchBaseQueryError): ParsedResponseError {
    if (typeof error.status === 'number') {
        return {
            status: error.status,
            data: parseErrorData(error.data),
        }
    }

    if ('originalStatus' in error) {
        return {
            status: error.originalStatus,
            data: {},
        }
    }

    return {
        data: {},
    }
}

function parseErrorData(data: unknown): IApiErrorResponse {
    if (isApiErrorResponse(data)) {
        return data
    }

    return {}
}

function isApiErrorResponse(data: unknown): data is IApiErrorResponse {
    return typeof data === 'object' && data !== null && 'errors' in data
}

function stringifyParams(params: Record<string, unknown>): string {
    const searchParams = new URLSearchParams()

    Object.entries(params).forEach(([key, value]) => {
        if (value === undefined || value === null) {
            return
        }

        if (Array.isArray(value)) {
            value.forEach((item) => searchParams.append(`${key}[]`, String(item)))
            return
        }

        searchParams.append(key, String(value))
    })

    return searchParams.toString()
}
