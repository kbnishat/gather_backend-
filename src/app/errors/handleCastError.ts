
import mongoose from "mongoose";
import { ErrorSources, genericErrorResponse } from "../interface/error.js";



export const handleCastError = (error: mongoose.Error.CastError): genericErrorResponse => {
    const errorSources: ErrorSources = [
        {
            path: error.path,
            message: error.message
        }
    ]
    return {
        statusCode: 400,
        message: error.message,
        error: errorSources
    };
}
