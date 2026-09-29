import { Schema } from "mongoose";

// Reusable helper to hide sensitive fields from API responses.
// Supports both root fields ("isDeleted") and nested fields ("a.b.c").
export const applyExcludeFields = <T extends object>(
  schema: Schema,
  fields: (keyof T | string)[],
) => {
  // Removes one field path from a target object.
  // Example path: "prerequisiteCources.isDeleted"
  const removeNestedField = (target: Record<string, unknown>, path: string) => {
    // Convert dot-path into keys array: "a.b.c" -> ["a", "b", "c"]
    const keys = path.split(".");

    // Recursively walk objects/arrays until the final key, then delete it.
    const removeRecursively = (current: unknown, index: number): void => {
      // Stop if current value is null/undefined/non-object.
      if (!current || typeof current !== "object") {
        return;
      }

      // Current key segment at this recursion level.
      const key = keys[index];
      // Safety guard for invalid path segments.
      if (!key) {
        return;
      }

      // If this is the last key in the path, remove it.
      if (index === keys.length - 1) {
        delete (current as Record<string, unknown>)[key];
        return;
      }

      // Move to next nested value for the next recursion step.
      const nextValue = (current as Record<string, unknown>)[key];

      // If nested value is an array, apply the same recursion on each item.
      if (Array.isArray(nextValue)) {
        nextValue.forEach((item) => removeRecursively(item, index + 1));
        return;
      }

      // If nested value is a plain object, continue recursion directly.
      removeRecursively(nextValue, index + 1);
    };

    // Start recursion from the root target object.
    removeRecursively(target, 0);
  };

  // Mongoose transform hook: runs during toJSON()/toObject() serialization.
  // `ret` is the outgoing plain object that will be returned in API response.
  const transform = (doc: unknown, ret: any) => {
    // Apply removal for every configured field path.
    fields.forEach((field) => {
      removeNestedField(ret, String(field));
    });

    // Return the cleaned response object.
    return ret;
  };

  // Apply the same cleanup for JSON responses.
  schema.set("toJSON", { transform });
  // Apply the same cleanup for plain object conversions.
  schema.set("toObject", { transform });
};
