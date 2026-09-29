import { UserInterface } from "./user.interface.js";
import { UserModel } from "./user.model.js";
import mongoose, { Model, UpdateQuery, Types } from "mongoose";
import AppError from "../../errors/handleAppError.js";
import { UserUtils } from "./user.utils.js";
import { paginate, parseListQuery } from "../../builder/queryBuilder.js";
import { normalizeMongoUpdatePayload } from "../../utils/mongoPartialUpdate.js";
import { startSession } from "mongoose";
import { Admin } from "../admin/admin.interface.js";
import AdminModel from "../admin/admin.model.js";
import { UserRole } from "./user.constant.js";
import {
  removeUploadedLocalFile,
  sendImageToCloudinary,
} from "../../utils/sendImageToCloudinary.js";

type LegacyProfile = {
  email: string;
  admissionSemester: { toString: () => string };
  academicDept: { toString: () => string };
  name?: { firstName?: string };
  id?: string;
  user?: Types.ObjectId;
  profileImage?: string;
};
type Student = LegacyProfile;
type Faculty = LegacyProfile;

const StudentModel = UserModel as unknown as Model<LegacyProfile>;
const FacultyModel = UserModel as unknown as Model<LegacyProfile>;
const AcademicSemesterModel = UserModel;
const AcademicDeptModel = UserModel;

// Service function to create a user in the database
const createStudentIntoDB = async (
  password: string,
  StudentData: Student,
  file?: Express.Multer.File,
  status: UserInterface["status"] = "in-progress",
) => {
  // Simulating saving the user data to the database
  const userData: Partial<UserInterface> = {};
  const resolved = UserUtils.resolveNewUserPassword(password);
  userData.password = resolved.password;
  userData.role = "student";
  userData.email = StudentData.email;
  userData.needsPasswordReset = resolved.needsPasswordReset;
  userData.status = status;
  // Use a session to ensure that both user and student creation are atomic operations. If either operation fails, the transaction will be rolled back, preventing partial data from being saved to the database.
  const session = await startSession();
  try {
    // Start a transaction to ensure atomicity of user and student creation. This means that if any part of the process fails (either creating the user or the student), the entire transaction will be rolled back, ensuring data integrity and preventing partial records from being saved to the database.
    session.startTransaction();

    const admissionSemesterId = StudentData.admissionSemester.toString();
    if (!admissionSemesterId) {
      throw new AppError("Admission semester is required", 400);
    }
    if (!mongoose.Types.ObjectId.isValid(admissionSemesterId)) {
      throw new AppError("Invalid admission semester id", 400);
    }
    //check if the admission semester is deleted
    const admissionSemester = await AcademicSemesterModel.findOne({
      _id: admissionSemesterId,
      isDeleted: false,
    }).session(session);
    if (!admissionSemester) {
      throw new AppError("Admission semester is deleted", 400);
    }
    //academicDept
    const academiDeptId = StudentData.academicDept.toString();
    if (!academiDeptId) {
      throw new AppError("Academic department is required", 400);
    }
    if (!mongoose.Types.ObjectId.isValid(academiDeptId)) {
      throw new AppError("Invalid academic department id", 400);
    }
    //check if the academic department is deleted
    const academicDept = await AcademicDeptModel.findOne({
      _id: academiDeptId,
      isDeleted: false,
    }).session(session);
    if (!academicDept) {
      throw new AppError("Academic department is deleted", 400);
    }
    userData.id = await UserUtils.generateUserId(
      "student",
      session,
    );

    // Keep user and student creation atomic to avoid partial records.
    const [createNewUser] = await UserModel.create([userData], { session });

    StudentData.id = createNewUser!.id;
    StudentData.user = createNewUser!._id;

    if (file?.path) {
      const imageName = `${createNewUser?.id}-${StudentData?.name?.firstName}`;
      const { secure_url } = (await sendImageToCloudinary(
        file.path,
        imageName,
      )) as {
        secure_url: string;
      };
      StudentData.profileImage = secure_url;
    }
    // Create the student document in the database using the StudentModel, passing in the student data and the session to ensure that it is part of the same transaction as the user creation. This will allow us to maintain data integrity and ensure that both the user and student records are created successfully or rolled back together in case of any errors.
    const [createNewStudent] = await StudentModel.create([StudentData], {
      session,
    });

    await session.commitTransaction();
    return createNewStudent;
  } catch (error) {
    await session.abortTransaction();
    throw new AppError(
      error instanceof Error ? error.message : "Failed to create student user",
      500,
    );
  } finally {
    await removeUploadedLocalFile(file?.path);
    await session.endSession();
  }
};

// for the faculty to add a new user
const createFacultyIntoDB = async (
  password: string,
  FacultyData: Faculty,
  file?: Express.Multer.File,
) => {
  // Simulating saving the user data to the database
  const userData: Partial<UserInterface> = {};
  const resolved = UserUtils.resolveNewUserPassword(password);
  userData.password = resolved.password;
  userData.role = "faculty";
  userData.email = FacultyData.email;
  userData.needsPasswordReset = resolved.needsPasswordReset;
  // Use a session to ensure that both user and student creation are atomic operations. If either operation fails, the transaction will be rolled back, preventing partial data from being saved to the database.
  const session = await startSession();
  try {
    // Start a transaction to ensure atomicity of user and student creation. This means that if any part of the process fails (either creating the user or the student), the entire transaction will be rolled back, ensuring data integrity and preventing partial records from being saved to the database.
    session.startTransaction();

    userData.id = await UserUtils.generateUserId("faculty", session);

    // Keep user and student creation atomic to avoid partial records.
    const [createNewUser] = await UserModel.create([userData], { session });

    if (file?.path) {
      const imageName = `${createNewUser?.id}-${FacultyData?.name?.firstName}`;
      const { secure_url } = (await sendImageToCloudinary(
        file.path,
        imageName,
      )) as {
        secure_url: string;
      };
      FacultyData.profileImage = secure_url;
    }
    FacultyData.id = createNewUser!.id;
    FacultyData.user = createNewUser!._id;

    // Create the faculty document in the database using the FacultyModel, passing in the faculty data and the session to ensure that it is part of the same transaction as the user creation. This will allow us to maintain data integrity and ensure that both the user and faculty records are created successfully or rolled back together in case of any errors.
    const [createNewFaculty] = await FacultyModel.create([FacultyData], {
      session,
    });

    await session.commitTransaction();
    return createNewFaculty;
  } catch (error) {
    await session.abortTransaction();
    throw new AppError(
      error instanceof Error ? error.message : "Failed to create faculty user",
      500,
    );
  } finally {
    await removeUploadedLocalFile(file?.path);
    await session.endSession();
  }
};
// for the admin to add a new user
const createAdminIntoDB = async (
  password: string,
  AdminData: Admin,
  file?: Express.Multer.File,
) => {
  // Simulating saving the user data to the database
  const userData: Partial<UserInterface> = {};
  const resolved = UserUtils.resolveNewUserPassword(password);
  userData.password = resolved.password;
  userData.role = "admin";
  userData.email = AdminData.email;
  userData.needsPasswordReset = resolved.needsPasswordReset;
  // Use a session to ensure that both user and student creation are atomic operations. If either operation fails, the transaction will be rolled back, preventing partial data from being saved to the database.
  const session = await startSession();
  try {
    // Start a transaction to ensure atomicity of user and student creation. This means that if any part of the process fails (either creating the user or the student), the entire transaction will be rolled back, ensuring data integrity and preventing partial records from being saved to the database.
    session.startTransaction();

    userData.id = await UserUtils.generateUserId("admin", session);

    // Keep user and student creation atomic to avoid partial records.
    const [createNewUser] = await UserModel.create([userData], { session });

    AdminData.id = createNewUser!.id;
    AdminData.user = createNewUser!._id;

    if (file?.path) {
      const imageName = `${createNewUser?.id}-${AdminData?.name?.firstName}`;
      const { secure_url } = (await sendImageToCloudinary(
        file.path,
        imageName,
      )) as {
        secure_url: string;
      };
      AdminData.profileImage = secure_url;
    }
    // Create the admin document in the database using the AdminModel, passing in the admin data and the session to ensure that it is part of the same transaction as the user creation. This will allow us to maintain data integrity and ensure that both the user and admin records are created successfully or rolled back together in case of any errors.
    const [createNewAdmin] = await AdminModel.create([AdminData], {
      session,
    });

    await session.commitTransaction();
    return createNewAdmin;
  } catch (error) {
    await session.abortTransaction();
    throw new AppError(
      error instanceof Error ? error.message : "Failed to create admin user",
      500,
    );
  } finally {
    await removeUploadedLocalFile(file?.path);
    await session.endSession();
  }
};

// Service function to get all users from the database
const getAllUsersFromDB = async (query: Record<string, unknown>) => {
  const parsed = parseListQuery(query, {
    searchableFields: ["id", "role"],
    baseFilter: { isDeleted: false },
  });
  const { meta, data: users } = await paginate(UserModel, parsed);
  return { meta, users };
};

// Service function to get a user by ID from the database
const getUserByIdFromDB = async (id: string) => {
  // Simulating fetching a user by ID from the database
  const result = await UserModel.findById({ _id: id, isDeleted: false });
  return result;
};

// Service function to update user info in the database
const updateUserInfoInDB = async (
  id: string,
  updatedData: UpdateQuery<UserInterface>,
) => {
  const payload =
    typeof updatedData === "object" &&
    updatedData !== null &&
    !Array.isArray(updatedData)
      ? normalizeMongoUpdatePayload(updatedData as Record<string, unknown>)
      : updatedData;
  const updatedUser = await UserModel.findOneAndUpdate(
    { _id: id, isDeleted: false },
    payload,
    {
      returnDocument: "after", // This option ensures that the updated document is returned after the update operation is performed, allowing us to get the latest state of the user after the update.
    },
  );

  if (!updatedUser) {
    return null;
  }

  return updatedUser;
};

// delete user from database
const deleteUserFromDB = async (id: string) => {
  const session = await mongoose.startSession();
  try {
    session.startTransaction();

    const deletedUser = await UserModel.findOneAndUpdate(
      { _id: id, isDeleted: false },
      { isDeleted: true },
      { returnDocument: "after", session },
    );

    if (!deletedUser) {
      await session.abortTransaction();
      return null;
    }

    // Keep user and related student soft-delete in the same transaction.
    await StudentModel.findOneAndUpdate(
      { user: deletedUser._id, isDeleted: false },
      { isDeleted: true },
      { session },
    );
    // 3. Keep user and related admin soft-delete in the same transaction.
    await AdminModel.findOneAndUpdate(
      { user: deletedUser._id, isDeleted: false },
      { isDeleted: true },
      { session },
    );
    // 4. Keep user and related faculty soft-delete in the same transaction.
    await FacultyModel.findOneAndUpdate(
      { user: deletedUser._id, isDeleted: false },
      { isDeleted: true },
      { session },
    );

    await session.commitTransaction();
    return deletedUser;
  } catch {
    await session.abortTransaction();
    throw new AppError("Failed to delete user", 500);
  } finally {
    await session.endSession();
  }
};

// Get all deleted students from the database
const getAllDeletedUsersFromDB = async () => {
  const deletedUsers = await UserModel.find({ isDeleted: true }).select(
    "+isDeleted",
  );
  if (deletedUsers.length === 0) {
    return {
      count: 0,
      users: [],
      message: "There are no deleted users",
    };
  }
  return {
    count: deletedUsers.length,
    message: "Deleted users retrieved successfully",
    users: deletedUsers,
  };
};

// Restore all deleted users from the database
const restoreDeletedUsersInDB = async () => {
  // Set up a session for transaction management
  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    // 1. Get deleted users
    const deletedUsers = await UserModel.find(
      { isDeleted: true },
      { _id: 1 },
    ).session(session);

    const userIds = deletedUsers.map((user) => user._id);

    // If there are no deleted users, we can abort the transaction and return early
    if (userIds.length === 0) {
      await session.abortTransaction();
      return {
        count: 0,
        users: [],
        message: "There are no deleted users to restore",
      };
    }

    // 2. Restore users
    const restoredUsers = await UserModel.updateMany(
      { _id: { $in: userIds } },
      { isDeleted: false },
      { session },
    );

    // 3. Restore ONLY related students
    await StudentModel.updateMany(
      { user: { $in: userIds }, isDeleted: true },
      { isDeleted: false },
      { session },
    );
    // 4. Find current restored users to return in response
    const restoredUserDocs = await UserModel.find({
      _id: { $in: userIds },
    }).session(session);

    // 5. Commit FIRST, then return
    await session.commitTransaction();

    return {
      count: restoredUsers.modifiedCount,
      message: `${restoredUsers.modifiedCount} user(s) restored successfully`,
      users: restoredUserDocs,
    };
  } catch {
    await session.abortTransaction();
    throw new AppError("Failed to restore deleted users", 500);
  } finally {
    await session.endSession();
  }
};

// get my profile from database
const getMyProfileFromDB = async (
  user: UserInterface & { _id?: Types.ObjectId | string },
) => {
  let result;
  if (user.role === UserRole.STUDENT) {
    result = await StudentModel.findOne({
      user: user._id as Types.ObjectId,
    })
      .populate("user")
      .populate("admissionSemester")
      .populate("academicDept")
      .populate({
        path: "academicDept",
        populate: {
          path: "academicFaculty",
        },
      });
  } else if (user.role === UserRole.FACULTY) {
    result = await FacultyModel.findOne({
      user: user._id as Types.ObjectId,
    }).populate("user");
  } else if (user.role === UserRole.ADMIN) {
    result = await AdminModel.findOne({
      user: user._id as Types.ObjectId,
    }).populate("user");
  } else if (user.role === UserRole.USER || user.role === UserRole.SUPER_ADMIN) {
    result = await UserModel.findOne({
      _id: user._id as Types.ObjectId,
      isDeleted: false,
    });
  }
  return result;
};

  const createPortalUserIntoDB = async (payload: {
    password: string;
    name: string;
    email: string;
    dateOfBirth?: Date;
    phone: string;
    gender: "male" | "female" | "other";
    otherDetails?: string;
  }) => {
    const existingUser = await UserModel.findOne({ email: payload.email, isDeleted: false });
    if (existingUser) throw new AppError("Email is already registered", 409);

    const id = await UserUtils.generateUserId("user");
    return UserModel.create({
      ...payload,
      id,
      role: UserRole.USER,
      status: "active",
      needsPasswordReset: false,
    });
  };

  const createPortalAdminIntoDB = async (payload: {
    password: string;
    name: string;
    email: string;
    phone?: string;
  }) => {
    const existingUser = await UserModel.findOne({ email: payload.email, isDeleted: false });
    if (existingUser) throw new AppError("Email is already registered", 409);

    const id = await UserUtils.generateUserId("admin");
    return UserModel.create({
      ...payload,
      id,
      role: UserRole.ADMIN,
      status: "active",
      needsPasswordReset: false,
    });
  };

export const UserService = {
  createStudentIntoDB,
  createFacultyIntoDB,
  createAdminIntoDB,
    createPortalUserIntoDB,
    createPortalAdminIntoDB,
  getAllUsersFromDB,
  getUserByIdFromDB,
  updateUserInfoInDB,
  deleteUserFromDB,
  getAllDeletedUsersFromDB,
  restoreDeletedUsersInDB,
  getMyProfileFromDB,
};
