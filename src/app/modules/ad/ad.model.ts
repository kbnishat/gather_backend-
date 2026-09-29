import { model, Schema } from "mongoose";
import { AdInterface } from "./ad.interface.js";

const adSchema = new Schema<AdInterface>(
  {
    title: { type: String, required: true, trim: true },
    image: { type: String, required: true, trim: true },
    link: { type: String, required: true, trim: true },
    isDeleted: { type: Boolean, default: false, select: false },
  },
  { timestamps: true, versionKey: false },
);

export const AdModel = model<AdInterface>("Ad", adSchema);