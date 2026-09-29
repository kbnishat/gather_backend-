// admin zod validation
import { z } from "zod";

const userNameValidationSchema = z
  .object({
    firstName: z.string().min(1),
    middleName: z.string().optional(),
    lastName: z.string().min(1),
  })
  .strict();

const adminDataValidationSchema = z
  .object({
    name: userNameValidationSchema,
    gender: z.enum(["male", "female", "other"] as const, {
      message: "Invalid gender",
    }),
    dateOfBirth: z.coerce
      .date({ message: "Invalid date of birth" })
      .refine((date) => date < new Date(), {
        message: "Date of birth must be in the past",
      }),
    email: z.string().email("Invalid email address"),
    contactNo: z.string().min(1, "Contact number is required"),
    emergencyContactNo: z
      .string()
      .min(1, "Emergency contact number is required"),
    bloodGroup: z
      .enum(["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"], {
        message: "Invalid blood group",
      })
      .optional(),
    presentAddress: z.string().min(1, "Present address is required"),
    permanentAddress: z.string().min(1, "Permanent address is required"),
  })
  .strict();

// * Body for POST /create-admin: matches `CreateAdmin` controller (`password` + `adminData`).
const createAdminPayloadSchema = z
  .object({
    password: z
      .string()
      .refine((val) => val.trim() === "" || val.length >= 6, {
        message:
          "Password must be at least 6 characters, or use an empty string for the default password",
      })
      .optional(),
    adminData: adminDataValidationSchema,
  })
  .strict();

const adminUpdatePayloadSchema = z
  .object({
    admin: adminDataValidationSchema
      .partial()
      .extend({
        name: userNameValidationSchema.partial().strict().optional(),
      })
      .strict(),
  })
  .strict();

export const adminValidation = {
  adminDataValidationSchema,
  createAdminPayloadSchema,
  adminUpdatePayloadSchema,
};
