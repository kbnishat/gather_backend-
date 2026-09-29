import { Types } from 'mongoose'
import AppError from '../errors/handleAppError.js'
import { NextFunction } from 'express'
// Utility function to sanitize and validate ID
const getSanitizedId = (id: string) => id.trim()

// Utility function to check if an ID is a valid MongoDB ObjectId
const isValidId = (id: string) => Types.ObjectId.isValid(id)

const validateId = (id: string, next: NextFunction) => {
    const sanitizedId = getSanitizedId(id)
    if (!isValidId(sanitizedId)) { 
        next(new AppError('Invalid id', 400))
        return
    }
    return sanitizedId
}
export const checkCommonValidation = {
    validateId
}