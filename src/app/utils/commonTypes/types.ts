import { UserInterface } from "../../modules/user/user.interface.js";
import { Types } from "mongoose";

export type TokenPayloadType = Partial<UserInterface> & {
  _id?: Types.ObjectId | string;
};

// export type UserRoleEnum = "admin" | "student" | "faculty" | "super_admin";

// export type UserStatusType = "active" | "inactive" | "blocked";

// export type UserRole = UserRoleEnum | "all";

// export type UserStatus = UserStatusType | "all";

// export type User = UserRole | UserStatus;
