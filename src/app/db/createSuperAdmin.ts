import config from "../config/index.js";
import {
  UserInterface,
  UserRoleEnum,
  UserStatusType,
} from "../modules/user/user.interface.js";
import { UserModel } from "../modules/user/user.model.js";

const superAdminData: UserInterface = {
  id: config.SUPER_ADMIN_ID,
  password: config.SUPER_ADMIN_PASSWORD,
  email: config.SUPER_ADMIN_EMAIL,
  passwordChangedAt: new Date() as Date,
  needsPasswordReset: false,
  role: "super_admin" as UserRoleEnum,
  status: "active" as UserStatusType,
};

const seedSuperAdmin = async () => {
  try {
    const isSuperAdminExists = await UserModel.findOne({ role: "super_admin" });

    if (!isSuperAdminExists) {
      await UserModel.create(superAdminData);
      console.log("Super admin seeded successfully");
    } 
    // else {
    //   console.log("Super admin already exists");
    // }
  } catch (error) {
    console.error("Error seeding super admin:", error);
    throw error;
  }
};

export default seedSuperAdmin;
