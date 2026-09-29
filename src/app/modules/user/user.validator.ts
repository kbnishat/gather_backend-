import z from "zod";

const studentValidationSchema = z
  .object({
    name: z.string().min(1).optional(),
    email: z.string().email(),
    admissionSemester: z.string().min(1).optional(),
    academicDept: z.string().min(1).optional(),
  })
  .passthrough();

// Define the validation schema for creating a user
const createUserValidationSchema = z
  .object({
    password: z
      .string()
      .refine((val) => val.trim() === "" || val.length >= 6, {
        message:
          "Password must be at least 6 characters, or use an empty string for the default password",
      })
      .optional(),
  })
  .strict();

// For creating a student user, we need to validate both the user data and the student data. We can create a combined schema for this purpose.
const createStudentPayloadSchema = z
  .object({
    password: z
      .string()
      .refine((val) => val.trim() === "" || val.length >= 6, {
        message:
          "Password must be at least 6 characters, or use an empty string for the default password",
      })
      .optional(),
    student: studentValidationSchema,
  })
  .strict();
// For update, all fields are optional
const updateUserValidationSchema = z
  .object({
    // password: z
    //   .string({ message: "Password must be a string" })
    //   .min(6, "Password must be at least 6 characters long")
    //   .optional(),
    // needsPasswordReset: z.boolean().optional(),
    // role: z
    //   .enum(["admin", "student", "faculty"] as const, {
    //     message: "Role must be one of 'admin', 'student', or 'faculty'",
    //   })
    //   .optional(),

    status: z
      .enum(["in-progress", "active", "inactive", "pending", "blocked"])
      .refine((val) => val !== undefined, {
        message: "Status is required",
      }),
  })
  .strict()
  .refine((data) => Object.keys(data).length > 0, {
    message: "Provide at provided status is required",
  });

const updateMyProfileValidationSchema = z
  .object({
    name: z.string().min(1).optional(),
    dateOfBirth: z.coerce.date().refine((date) => date < new Date(), "Date of birth must be in the past").optional(),
    phone: z.string().optional(),
    gender: z.enum(["male", "female", "other"]).optional(),
    otherDetails: z.string().optional(),
    profileImage: z.string().url().or(z.literal("__uploaded__")).optional(),
  })
  .strict()
  .refine((data) => Object.keys(data).length > 0, {
    message: "Provide at least one profile field to update",
  });

export const userValidations = {
  createUserValidationSchema,
  updateUserValidationSchema,
  updateMyProfileValidationSchema,
  createStudentPayloadSchema,
};

// export method to validate user data using the createUserValidationSchema, this method takes in the data to be validated and returns the validated data if it is valid, or throws an error with a message containing all validation errors if the data is invalid.
// export const zodValidateUserCreate = (data: unknown) => {
//     const result = createUserValidationSchema.safeParse(data);

//     if (!result.success) {
//         const errors = result.error.issues.map(err => err.message);
//         throw new Error(`Validation error: ${errors.join(', ')}`);
//     }

//     return result.data;
// };
