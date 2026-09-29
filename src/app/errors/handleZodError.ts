import { ZodError } from "zod";
import { ErrorSources, genericErrorResponse } from "../interface/error.js";

export const handleZodError = (err: ZodError): genericErrorResponse => {
  const errorSources: ErrorSources = err.issues.map((issue) => ({
    path: issue.path.length > 0 ? issue.path.map(String).join(".") : "",
    message: issue.message,
  }));
  return {
    statusCode: 400,
    message: "Validation Error",
    error: errorSources,
  };
};
