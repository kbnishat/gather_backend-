// handle mongoose validation errors and zod validation errors in global error handler

import mongoose from "mongoose";
import { ErrorSources, genericErrorResponse } from "../interface/error.js";


export const handleValidationError = (error: mongoose.Error.ValidationError): genericErrorResponse => {
    const errorSources: ErrorSources = Object.values(error.errors).map((err: mongoose.Error.ValidatorError | mongoose.Error.CastError) => ({
        path: err.path[err.path.length - 1] as string | number,
        message: err.message
    }))
    return {
        statusCode: 400,
        message: 'Validation Error',
        error: errorSources
    };
}