import { Schema, model } from "mongoose";
import { Admin } from "./admin.interface.js";
import { applyExcludeFields } from "../../utils/excludeFiledWhenCreateResponse.js";
import { restrictUpdateFieldsChecker } from "../../utils/restrictedUpdateFiled.js";

export const userNameSchema = new Schema({
  firstName: { type: String, required: true, trim: true },
  middleName: { type: String, trim: true },
  lastName: { type: String, required: true, trim: true },
});

const AdminSchema = new Schema<Admin>(
  {
    id: {
      type: String,
      required: [true, "Admin ID is required"],
      unique: [true, "Admin ID must be unique"],
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Associated user is required"],
      unique: [true, "User ID must be unique"],
    },
    name: {
      type: userNameSchema,
      required: [true, "Admin name is required"],
    },
    gender: {
      type: String,
      enum: {
        values: ["male", "female", "other"],
        message: "Admin gender must be one of male, female, or other",
      },
      required: [true, "Admin gender is required"],
    },
    dateOfBirth: {
      type: Date,
      required: [true, "Admin date of birth is required"],
    },
    email: {
      type: String,
      required: [true, "Admin email is required"],
      unique: [true, "Admin email must be unique"],
    },
    contactNo: {
      type: String,
      required: [true, "Admin contact number is required"],
    },
    emergencyContactNo: {
      type: String,
      required: [true, "Admin emergency contact number is required"],
    },
    bloodGroup: {
      type: String,
      enum: {
        values: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"],
        message:
          "Admin blood group must be one of A+, A-, B+, B-, AB+, AB-, O+, or O-",
      },
      required: [true, "Admin blood group is required"],
    },
    presentAddress: {
      type: String,
      required: [true, "Admin present address is required"],
    },
    permanentAddress: {
      type: String,
      required: [true, "Admin permanent address is required"],
    },
    profileImage: {
      type: String,
    },
    isDeleted: {
      type: Boolean,
      default: false,
      select: false,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);
// Exclude password and isDeleted fields when converting to JSON
applyExcludeFields<Admin>(AdminSchema, ["password", "isDeleted"]);
// Update hooks to restrict updating certain fields
restrictUpdateFieldsChecker(AdminSchema, undefined, ["email"]); // This will restrict updating the isDeleted and email fields in the Student schema for the specified update methods.

const AdminModel = model<Admin>("Admin", AdminSchema);
export default AdminModel;
