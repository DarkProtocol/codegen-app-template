export type PaginationRequest = {
    page: number
    perPage: number
}

export type PaginationResponse<T> = {
    data: T[]
    count: number
    currentPage: number
    perPage: number
    pages: number
}
