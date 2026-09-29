import { PopulateOptions } from "mongoose";

//  * Build a chained populate tree for the same path.
//  * Example path "a.b" with depth 3 => a.b -> a.b -> a.b

export const buildNestedPopulate = (
  path: string,
  depth: number,
): PopulateOptions => {
  const safeDepth = Math.max(1, depth);
  const root: PopulateOptions = { path };
  let current = root;

  for (let i = 1; i < safeDepth; i++) {
    const next: PopulateOptions = { path };
    current.populate = next;
    current = next;
  }

  return root;
};
