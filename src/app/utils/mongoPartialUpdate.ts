import mongoose from "mongoose";


//  * Converts a partial document into MongoDB dot-notation keys so nested plain objects
//  * merge field-by-field instead of replacing the whole subdocument (PATCH-style).
//  * Arrays, Dates, ObjectIds, and Buffers are written as a single path (no deep merge into arrays).
 
function isPlainObject(value: unknown): value is Record<string, unknown> {
  if (value === null || typeof value !== "object") return false;
  if (Array.isArray(value)) return false;
  if (value instanceof Date) return false;
  if (value instanceof mongoose.Types.ObjectId) return false;
  if (typeof Buffer !== "undefined" && Buffer.isBuffer(value)) return false;
  const proto = Object.getPrototypeOf(value);
  return proto === null || proto === Object.prototype;
}

export function isMongoOperatorUpdate(value: unknown): boolean {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return false;
  }
  return Object.keys(value as Record<string, unknown>).some((k) =>
    k.startsWith("$"),
  );
}

export function partialFieldsToMongoUpdate(
  input: Record<string, unknown>,
  options?: { skipUndefined?: boolean },
): Record<string, unknown> {
  const skipUndefined = options?.skipUndefined ?? true;
  const out: Record<string, unknown> = {};

  const walk = (prefix: string, obj: Record<string, unknown>) => {
    for (const [k, v] of Object.entries(obj)) {
      if (skipUndefined && v === undefined) continue;
      const key = prefix ? `${prefix}.${k}` : k;
      if (isPlainObject(v)) {
        const nestedKeys = Object.keys(v);
        if (nestedKeys.length === 0) continue;
        walk(key, v);
      } else {
        out[key] = v;
      }
    }
  };

  walk("", input);
  return out;
}


//  * Use for findOneAndUpdate / findByIdAndUpdate payloads: flattens nested objects when
//  * the client sends a plain partial document; passes through Mongo update operators unchanged.

export function normalizeMongoUpdatePayload<T extends Record<string, unknown>>(
  payload: T,
  options?: { skipUndefined?: boolean },
): Record<string, unknown> | T {
  if (isMongoOperatorUpdate(payload)) {
    return payload;
  }
  return partialFieldsToMongoUpdate(payload, options);
}
