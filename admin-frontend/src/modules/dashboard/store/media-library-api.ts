import { createApi } from '@reduxjs/toolkit/query/react'
import { baseFetchQuery } from '@modules/shared/helpers/rtk-query'

import type {
    MediaLibraryConfig,
    MediaLibraryFile,
    MediaLibraryFolderContent,
    MediaLibraryFolder,
    MediaLibraryFolderTreeNode,
} from '../models/media-library-api.interface'

export const mediaLibraryApi = createApi({
    reducerPath: 'mediaLibrary/api',
    baseQuery: baseFetchQuery(''),
    tagTypes: ['MediaLibraryConfig', 'MediaLibraryFolderContent', 'MediaLibraryFolderTree'],
    endpoints: (builder) => ({
        mediaLibraryConfig: builder.query<MediaLibraryConfig, void>({
            query: () => ({
                url: '/admin/media/config',
                method: 'GET',
            }),
            providesTags: ['MediaLibraryConfig'],
        }),
        mediaLibraryFolderContent: builder.query<MediaLibraryFolderContent, { parentId?: string | null } | void>({
            query: (params) => ({
                url: '/admin/media/folders',
                method: 'GET',
                params: params ?? undefined,
            }),
            providesTags: ['MediaLibraryFolderContent'],
        }),
        mediaLibraryFolderTree: builder.query<MediaLibraryFolderTreeNode[], void>({
            query: () => ({
                url: '/admin/media/folder-tree',
                method: 'GET',
            }),
            providesTags: ['MediaLibraryFolderTree'],
        }),
        createMediaLibraryFolder: builder.mutation<MediaLibraryFolder, { parentId?: string | null; name: string }>({
            query: (params) => ({
                url: '/admin/media/folders',
                method: 'POST',
                body: params,
            }),
            invalidatesTags: ['MediaLibraryFolderContent', 'MediaLibraryFolderTree'],
        }),
        changeMediaLibraryFolder: builder.mutation<void, { id: string; name: string }>({
            query: ({ id, ...body }) => ({
                url: `/admin/media/folders/${id}`,
                method: 'PATCH',
                body,
            }),
            invalidatesTags: ['MediaLibraryFolderContent', 'MediaLibraryFolderTree'],
        }),
        deleteMediaLibraryFolder: builder.mutation<void, { id: string }>({
            query: ({ id }) => ({
                url: `/admin/media/folders/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['MediaLibraryFolderContent', 'MediaLibraryFolderTree'],
        }),
        createMediaLibraryFile: builder.mutation<
            MediaLibraryFile,
            { folderId?: string | null; name: string; file: File; isPublic?: boolean }
        >({
            query: ({ file, ...params }) => {
                const body = new FormData()
                body.append('file', file)

                Object.entries(params).forEach(([key, value]) => {
                    if (value === undefined || value === null) {
                        return
                    }

                    body.append(key, typeof value === 'boolean' ? Number(value).toString() : String(value))
                })

                return {
                    url: '/admin/media/files',
                    method: 'POST',
                    body,
                }
            },
            invalidatesTags: ['MediaLibraryFolderContent'],
        }),
        changeMediaLibraryFile: builder.mutation<
            void,
            { id: string; folderId?: string | null; name: string; isPublic: boolean }
        >({
            query: ({ id, ...body }) => ({
                url: `/admin/media/files/${id}`,
                method: 'PATCH',
                body,
            }),
            invalidatesTags: ['MediaLibraryFolderContent'],
        }),
        deleteMediaLibraryFile: builder.mutation<void, { id: string }>({
            query: ({ id }) => ({
                url: `/admin/media/files/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['MediaLibraryFolderContent'],
        }),
        mediaLibraryFileUpload: builder.query<Blob, { id: string }>({
            query: ({ id }) => ({
                url: `/uploads/${id}`,
                method: 'GET',
                responseHandler: (response) => response.blob(),
            }),
        }),
    }),
})

export const {
    useChangeMediaLibraryFileMutation,
    useChangeMediaLibraryFolderMutation,
    useCreateMediaLibraryFileMutation,
    useCreateMediaLibraryFolderMutation,
    useDeleteMediaLibraryFileMutation,
    useDeleteMediaLibraryFolderMutation,
    useMediaLibraryFileUploadQuery,
    useMediaLibraryConfigQuery,
    useMediaLibraryFolderContentQuery,
    useMediaLibraryFolderTreeQuery,
} = mediaLibraryApi
