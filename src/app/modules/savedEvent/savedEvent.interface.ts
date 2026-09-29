import { Types } from "mongoose";

export interface SavedEventInterface {
  event: Types.ObjectId;
  user: Types.ObjectId;
  savedAt: Date;
}