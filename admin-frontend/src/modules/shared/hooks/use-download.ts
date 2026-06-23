import { useState } from 'react'

export function useDownload() {
    const [isDownloading, setIsDownloading] = useState(false)

    const download = async (url: string, fileName?: string): Promise<boolean> => {
        if (!url) {
            return false
        }

        setIsDownloading(true)

        try {
            const response = await fetch(url, {
                credentials: 'include',
            })

            if (!response.ok) {
                return false
            }

            const blob = await response.blob()
            const resolvedFileName = fileName || getFileNameFromResponse(response) || getFileNameFromUrl(url)
            const objectUrl = window.URL.createObjectURL(blob)
            const link = document.createElement('a')

            link.href = objectUrl
            link.download = resolvedFileName
            link.style.display = 'none'

            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)
            window.URL.revokeObjectURL(objectUrl)

            return true
        } catch {
            return false
        } finally {
            setIsDownloading(false)
        }
    }

    return {
        download,
        isDownloading,
    }
}

function getFileNameFromResponse(response: Response): string | null {
    const contentDisposition = response.headers.get('content-disposition')

    if (!contentDisposition) {
        return null
    }

    const encodedFileName = contentDisposition.match(/filename\*=UTF-8''([^;]+)/i)?.[1]

    if (encodedFileName) {
        return decodeURIComponent(encodedFileName)
    }

    return (
        contentDisposition.match(/filename="([^"]+)"/i)?.[1] ??
        contentDisposition.match(/filename=([^;]+)/i)?.[1] ??
        null
    )
}

function getFileNameFromUrl(url: string): string {
    const fileName = url.split('/').filter(Boolean).at(-1)

    return fileName ? decodeURIComponent(fileName) : 'download'
}
