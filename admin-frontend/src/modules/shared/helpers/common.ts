export type FileType = 'image' | 'video' | 'audio' | 'pdf' | 'file'

export function getFileTypeByMime(mimeType: string, extension = ''): FileType {
    if (mimeType.startsWith('image/')) {
        return 'image'
    }

    if (mimeType.startsWith('video/')) {
        return 'video'
    }

    if (mimeType.startsWith('audio/')) {
        return 'audio'
    }

    if (mimeType === 'application/pdf' || extension.toLowerCase() === 'pdf') {
        return 'pdf'
    }

    return 'file'
}

export function formatFileSize(size: number): string {
    if (size < 1024 * 1024) {
        return `${Math.max(1, Math.round(size / 1024))} KB`
    }

    return `${(size / 1024 / 1024).toFixed(1)} MB`
}

export function formatDate(date: Date): string {
    return new Intl.DateTimeFormat('ru-RU', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
    }).format(date)
}
