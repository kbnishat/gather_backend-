import { NextFunction, Request, Response } from "express";
import { z } from "zod";
import { removeUploadedLocalFile } from "../../utils/sendImageToCloudinary.js";

export type ValidationSource = "body" | "cookies" | "query";

// *** Validate `body` (default), `cookies`, or `query` — use the matching schema per route.
const validation = (
  schema: z.ZodTypeAny,
  source: ValidationSource = "body",
) => {
  return async (req: Request, _res: Response, next: NextFunction) => {
    try {
      const raw =
        source === "body"
          ? req.body
          : source === "cookies"
            ? (req.cookies ?? {})
            : req.query;
      const parsed = await schema.parseAsync(raw);
      if (source === "body") {
        req.body = parsed;
      }
      return next();
    } catch (error) {
      await removeUploadedLocalFile(req.file?.path);
      return next(error);
    }
  };
};

export default validation;
