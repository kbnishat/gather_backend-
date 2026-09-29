import { z } from "zod";

const registerValidation = z
  .object({
    password: z.string().min(6, "Password must be at least 6 characters long"),
    name: z.string().min(1),
    email: z.string().email(),
    dateOfBirth: z.coerce.date().refine((date) => date < new Date(), "Date of birth must be in the past").optional(),
    phone: z.string().min(1),
    gender: z.enum(["male", "female", "other"]),
    otherDetails: z.string().optional(),
  })
  .strict();

const authLoginValidation = z
  .object({
    id: z.string().min(1).optional(),
    email: z.string().email("Invalid email address").optional(),
    password: z.string().min(1),
  })
  .strict()
  .refine((data) => Boolean(data.id || data.email), {
    message: "Provide either a user ID or email to login",
    path: ["id"],
  });

const changePasswordValidation = z
  .object({
    oldPassword: z.string().min(1),
    newPassword: z.string().min(1),
  })
  .strict()
  .refine((data) => Object.keys(data).length > 0, {
    message: "Provide at least one valid field to change password",
  });

/// Shape of `req.cookies` — use `validation(..., "cookies")` on the refresh route.
const refreshTokenValidation = z.object({
  refreshToken: z
    .string({
      message:
        "Refresh token is missing. Include credentials (cookies) or sign in again.",
    })
    .min(1, {
      message: "Refresh token is required",
    }),
});
//
const forgetPasswordValidation = z
  .object({
    id: z.string().min(1, {
      message: "User ID is required",
    }),
  })
  .strict()
  .refine((data) => Object.keys(data).length > 0, {
    message: "Provide at least one valid field to forget password",
  });

// reset password validation
const resetPasswordValidation = z
  .object({
    id: z.string().min(1, {
      message: "User ID is required",
    }),
    newPassword: z.string().min(6, {
      message: "New password must be at least 6 characters long",
    }),
  })
  .strict()
  .refine((data) => Object.keys(data).length > 0, {
    message: "Provide at least one valid field to reset password",
  });
export const AuthValidation = {
  registerValidation,
  authLoginValidation,
  changePasswordValidation,
  refreshTokenValidation,
  forgetPasswordValidation,
  resetPasswordValidation,
};
