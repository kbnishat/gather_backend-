import { Types } from "mongoose";

export interface EventRegistrationInterface {
  event: Types.ObjectId;
  user: Types.ObjectId;
  registeredAt: Date;
}
