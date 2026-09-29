import { model, Schema } from "mongoose";
import { EventInterface } from "./event.interface.js";

const eventSchema = new Schema<EventInterface>(
  {
    title: { type: String, trim: true },
    description: { type: String, trim: true },
    image: { type: String, trim: true },
    date: { type: Date },
    isDeleted: { type: Boolean, default: false, select: false },
  },
  { timestamps: true },
);

export const EventModel = model<EventInterface>("Event", eventSchema);