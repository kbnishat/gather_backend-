export type ErrorSources = {
    path: string | number
    message: string
}[];
export type genericErrorResponse = {
    success?: boolean
    statusCode: number
    message: string
    error: ErrorSources
    stack?: string
}