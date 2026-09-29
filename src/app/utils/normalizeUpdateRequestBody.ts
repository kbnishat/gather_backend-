import { Request } from "express";

type NormalizeUpdateRequestBodyOptions = {
  payloadKey: string;
  shape: "nested" | "flat";
  dataKey?: string;
};

export const normalizeUpdateRequestBody = (
  req: Request,
  options: NormalizeUpdateRequestBodyOptions,
) => {
  const dataKey = options.dataKey ?? "data";
  // default key = "data" (from form-data)

  /*
  BEFORE (from Postman form-data):
  req.body = {
    data: '{"faculty": {"name": "John"}}'
  }
  */

  if (typeof req.body?.[dataKey] === "string") {
    const trimmed = req.body[dataKey].trim();

    req.body = trimmed.length > 0 ? JSON.parse(req.body[dataKey]) : {};
  }

  /*
  AFTER JSON.parse:
  req.body = {
    faculty: {
      name: "John"
    }
  }
  */

  const rawBody =
    req.body && typeof req.body === "object" && !Array.isArray(req.body)
      ? (req.body as Record<string, unknown>)
      : {};

  /*
  rawBody becomes:
  {
    faculty: {
      name: "John"
    }
  }
  */

  const payload = rawBody[options.payloadKey];

  /*
  If payloadKey = "faculty"

  payload = {
    name: "John"
  }
  */

  // ----------- HANDLE NESTED -----------
  if (options.shape === "nested") {
    if (payload === undefined || payload === null) {
      req.body = {
        [options.payloadKey]: req.file ? {} : undefined,
      };

      /*
      CASE: no faculty data but file exists

      req.body = {
        faculty: {}
      }
      */

      return;
    }

    req.body = { [options.payloadKey]: payload };

    /*
    FINAL (nested):
    req.body = {
      faculty: {
        name: "John"
      }
    }
    */

    return;
  }

  // ----------- HANDLE FLAT -----------
  if (payload !== undefined && payload !== null) {
    req.body = payload;

    /*
    FINAL (flat):
    req.body = {
      name: "John"
    }
    */

    return;
  }

  // ----------- FALLBACK -----------
  req.body = req.file ? {} : rawBody;

  /*
  CASE 1: only file uploaded
  req.body = {}

  CASE 2: no payloadKey found
  req.body = rawBody
  */
};
