import { Schema, model } from "mongoose";
import { UserInterface, UserMethods } from "./user.interface.js";
import bcrypt from "bcrypt";
import config from "../../config/index.js";
import { applyExcludeFields } from "../../utils/excludeFiledWhenCreateResponse.js";
import AppError from "../../errors/handleAppError.js";
import { userRoleEnum, userStatusEnum } from "./user.constant.js";
// Define the User schema using Mongoose, which represents the structure of the user documents in the MongoDB database. The schema includes fields for id, password, needsPasswordReset, role, isDeleted, and status, along with their respective data types, validation rules, and default values. Additionally, it includes timestamps to automatically track when each user document is created and last updated.

export const userSchema = new Schema<UserInterface, UserMethods>(
  {
    id: {
      type: String,
      required: true,
      unique: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    name: { type: String, trim: true },
    dateOfBirth: { type: Date },
    phone: { type: String, trim: true },
    gender: { type: String, enum: ["male", "female", "other"] },
    otherDetails: { type: String, trim: true },
    profileImage: { type: String, trim: true },
    password: {
      type: String,
      // required: true,
      select: false, // This option ensures that the password field is not included in query results by default, enhancing security by preventing accidental exposure of hashed passwords in API responses or logs.
    },
    passwordChangedAt: {
      type: Date,
    },
    needsPasswordReset: {
      type: Boolean,
      default: true,
    },
    role: {
      type: String,
      enum: {
        values: userRoleEnum,
        message: "Role must be one of admin, student, faculty, or super_admin",
      },
    },
    isDeleted: {
      type: Boolean,
      default: false,
      select: false, // This option ensures that the isDeleted field is not included in query results by default, which can help prevent confusion and ensure that soft-deleted users are not accidentally included in API responses or logs.
    },
    status: {
      type: String,
      enum: {
        values: userStatusEnum,
        message:
          "Status must be one of in-progress, active, inactive, pending, or blocked",
      },
      default: userStatusEnum[0],
    },
  },
  {
    timestamps: true,
  },
);

// Exclude password and isDeleted fields when converting to JSON
applyExcludeFields<UserInterface>(userSchema as unknown as Schema, [
  "password",
  "isDeleted",
]);

//pre hook for save method, this will run before saving data to the database, we can use this to perform any necessary operations or validations before the data is actually saved. In this case, it simply logs the document being saved and a message indicating that the hook is running.
userSchema.pre("save", async function () {
  //hash password before saving to database
  if (this.isModified("password")) {
    // Check if the password field has been modified (either during creation or update)
    const saltRounds = Number(config.BCRYPT_SALT_ROUNDS); // Get the number of salt rounds from the configuration, which determines how many times the password will be hashed. A higher number means more security but also more time to hash the password.
    const hashedPassword = await bcrypt.hash(this.password, saltRounds); // Hash the password using bcrypt
    this.password = hashedPassword; // Replace the plain text password with the hashed version before saving to the database
  }
  // console.log(this, 'Hook before saving data')
});

// restrictUpdateFieldsChecker(userSchema as unknown as Schema, undefined, [
//   "password",
// ]);

//post hook for save method, this will run after saving data to the database, we can use this to perform any necessary operations or actions after the data has been saved. In this case, it simply logs the document that was saved and a message indicating that the hook has completed.
// find middleware/hooks
userSchema.pre("find", function () {
  // This middleware will run before any find operation (find, findOne, findById, etc.) is executed. It modifies the query to exclude documents where the isDeleted field is set to true, effectively implementing a soft delete mechanism. This means that when you query for users, you will only get those that are not marked as deleted.
  // this.find({ isDeleted: { $ne: true } });
});

// findOne middleware/hooks
userSchema.pre("findOne", function () {
  // Similar to the pre 'find' middleware, this will run before any findOne operation is executed and will modify the query to exclude documents where isDeleted is true, ensuring that soft-deleted users are not returned in findOne queries.
  // this.find({ isDeleted: { $ne: true } });
});

// custom methods

// Login / user identifier validation (accepts either id or email)
userSchema.statics.isUserIdValid = async function (
  identifier: string,
  password?: string,
  checkPassword: boolean = true,
  checkIsBlocked: boolean = true,
): Promise<Partial<UserInterface>> {
  const user = await UserModel.findOne({
    $or: [{ id: identifier }, { email: identifier }],
    isDeleted: false,
  }).select(
    "+password status role needsPasswordReset id passwordChangedAt email",
  );

  if (!user) {
    throw new AppError("User not found", 404);
  }

  if (checkPassword) {
    if (!password) {
      throw new AppError("Password is required", 400);
    }
    //compare password
    const isPasswordCorrect = await bcrypt.compare(password, user.password);

    if (!isPasswordCorrect) {
      throw new AppError("Invalid password", 401);
    }
  }

  if (checkIsBlocked && user.status !== "active") {
    throw new AppError("User is not active, please contact admin", 401);
  }

  return user;
};
// check if password changed at is greater than iat (invalidate old tokens)
userSchema.statics.isPasswordChanged = function (
  passwordChangedAt: Date,
  iat: number,
): boolean {
  if (
    passwordChangedAt &&
    typeof iat === "number" &&
    passwordChangedAt > new Date(iat * 1000)
  ) {
    return true;
  }
  return false;
};
// Create the User model using the schema
export const UserModel = model<UserInterface, UserMethods>("User", userSchema);
