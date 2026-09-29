import { Types } from "mongoose";

export type ContactType =
  | "phone"
  | "email"
  | "address"
  | "website"
  | "social"
  | "other";

export interface ContactInterface {
  _id?: Types.ObjectId;
  label: string;
  value: string;
  type: ContactType;
  link?: string;
  isActive: boolean;
  isDeleted?: boolean;
}