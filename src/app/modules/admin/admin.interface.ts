import { Types } from "mongoose";

export type userName = {
  firstName: string;
  middleName?: string;
  lastName: string;
};

export type Admin = {
  id: string;
  user: Types.ObjectId;
  name: userName;
  gender: "male" | "female" | "other";
  dateOfBirth: Date;
  email: string;
  contactNo: string;
  emergencyContactNo: string;
  bloodGroup?:
    | "A+"
    | "A-"
    | "B+"
    | "B-"
    | "AB+"
    | "AB-"
    | "O+"
    | "O-"
    | undefined;
  presentAddress: string;
  permanentAddress: string;
  profileImage?: string | undefined;
  isDeleted?: boolean; // Optional field to indicate if the admin is deleted
};
