export type MediaLibraryFolderBase = {
    id: string
    parentId: string | null
    name: string
}

export type MediaLibraryFolderParent = MediaLibraryFolderBase

export type MediaLibraryCurrentFolder = MediaLibraryFolderBase & {
    createdBy: string | null
    createdAt: string
    updatedAt: string
}

export type MediaLibraryFolder = {
    id: string
    parentId: string | null
    name: string
    createdBy: string | null
    createdAt: string
    updatedAt: string
    foldersCount: number
    filesCount: number
}

export type MediaLibraryFolderTreeNode = MediaLibraryFolderBase & {
    children: MediaLibraryFolderTreeNode[]
}

export type MediaLibraryFile = {
    id: string
    publicUrl: string
    folderId: string | null
    originalName: string
    name: string
    extension: string
    mimeType: string
    size: number
    checksum: string
    isPublic: boolean
    createdBy: string
    createdAt: string
}

export type MediaLibraryConfig = {
    maxFileSize: number
    supportedExtensions: string[]
}

export type MediaLibraryFolderContent = {
    currentFolder: MediaLibraryCurrentFolder | null
    parents: MediaLibraryFolderParent[]
    folders: MediaLibraryFolder[]
    files: MediaLibraryFile[]
}
