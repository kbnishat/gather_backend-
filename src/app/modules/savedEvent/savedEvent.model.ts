import { Schema, model } from "mongoose";
import { SavedEventInterface } from "./savedEvent.interface.js";

const savedEventSchema = new Schema<SavedEventInterface>(
  {
    event: { type: Schema.Types.ObjectId, ref: "Event", required: true },
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    savedAt: { type: Date, default: Date.now },
  },
  { timestamps: true },
);

savedEventSchema.index({ event: 1, user: 1 }, { unique: true });

export const SavedEventModel = model<SavedEventInterface>("SavedEvent", savedEventSchema);