import { Types } from "mongoose";

export interface EventInterface {
  _id?: Types.ObjectId;
  title?: string;
  description?: string;
  image?: string;
  date?: Date;
  isDeleted?: boolean;
}