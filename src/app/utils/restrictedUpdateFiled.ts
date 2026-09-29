import { Query, Schema, UpdateQuery } from "mongoose";

type UpdateMethod = "findOneAndUpdate" | "updateOne" | "updateMany";
type UpdateDocument = Record<string, unknown>;

export const restrictUpdateFieldsChecker = (
  schema: Schema,
  updateMethods: UpdateMethod[] = [
    "findOneAndUpdate",
    "updateOne",
    "updateMany",
  ],
  restrictedFields: string[] = [],
) => {
  const checkUpdate = function (this: Query<UpdateDocument, UpdateDocument>) {
    const update = this.getUpdate() as UpdateQuery<UpdateDocument> | undefined;

    const flatUpdate = {
      ...update,
      ...(update?.$set || {}),
    };

    for (const field of restrictedFields) {
      if (flatUpdate?.[field] !== undefined) {
        throw new Error(`${field} field cannot be updated`);
      }
    }
  };

  // Apply to all methods dynamically
  updateMethods.forEach((method) => {
    schema.pre(method, checkUpdate);
  });
};