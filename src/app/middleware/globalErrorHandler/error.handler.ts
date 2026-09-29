//global error handler
import { ErrorRequestHandler, NextFunction, Request, Response } from "express";
import AppError from "../../errors/handleAppError.js";
import { ZodError } from "zod";
import { handleZodError } from "../../errors/handleZodError.js";
import config from "../../config/index.js";
import { handleValidationError } from "../../errors/handleValidationError.js";
import { ErrorSources } from "../../interface/error.js";
import { handleCastError } from "../../errors/handleCastError.js";

export const globalErrorHandler: ErrorRequestHandler = (
  error,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  console.error("Global error handler:", error);

  let statusCode = 500;
  let message = "Internal Server Error";
  let errorSources: ErrorSources = [
    {
      path: "",
      message: "Internal Server Error",
    },
  ];

  if (error instanceof ZodError) {
    // If the error is a ZodError, handle it using the handleZodError function
    const simplifiedError = handleZodError(error);
    statusCode = simplifiedError.statusCode;
    message = simplifiedError.message;
    errorSources = simplifiedError.error;
  } else if (error instanceof Error && error.name === "ValidationError") {
    // Handle Mongoose validation errors
    const simplifiedError = handleValidationError(error as any);
    message = simplifiedError.message;
    errorSources = simplifiedError.error;
  } else if (error instanceof Error && error.name === "CastError") {
    const simplifiedError = handleCastError(error as any);
    statusCode = simplifiedError.statusCode;
    message = simplifiedError.message;
    errorSources = simplifiedError.error;
  } else if (error instanceof AppError) {
    statusCode = error.statusCode;
    message = error.message;
    const details = Array.isArray(error.details) ? error.details : null;
    errorSources =
      details && details.length > 0
        ? (details as ErrorSources)
        : [
            {
              path: "",
              message: error.message,
            },
          ];
  } else if (error instanceof Error) {
    message = error.message;
    errorSources = [{ path: "", message: error.message }];
  }

  // Send the error response to the client
  res.status(statusCode).json({
    success: false,
    message: message,
    error: errorSources,
    stack: config.DEVELOPMENT_MODE ? error.stack : undefined,

    // ...(error.details ? { errors: error.details } : {}) // Include details if available which show array of errors
  });
};

// 404 handler for undefined routes
export const notFoundHandler = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  // Ignore favicon request
  if (req.originalUrl.includes("favicon.ico")) {
    return res.status(204).end();
  }

  // Forward 404 error
  next(new AppError(`Route ${req.originalUrl} not found`, 404));
};
