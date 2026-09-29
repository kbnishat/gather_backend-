class AppError extends Error {
    statusCode: number
    details?: unknown

    constructor(message: string, statusCode: number, details?: unknown) {
        super(message) // Call the parent constructor with the error message
        this.statusCode = statusCode
        this.details = details
    }
}

export default AppError