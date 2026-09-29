import { Schema, model } from "mongoose";
import { EventRegistrationInterface } from "./eventRegistration.interface.js";

const registrationSchema = new Schema<EventRegistrationInterface>(
  {
    event: { type: Schema.Types.ObjectId, ref: "Event", required: true },
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    registeredAt: { type: Date, default: Date.now },
  },
  { timestamps: true },
);

registrationSchema.index({ event: 1, user: 1 }, { unique: true });

export const EventRegistrationModel = model<EventRegistrationInterface>(
  "EventRegistration",
  registrationSchema,
);
