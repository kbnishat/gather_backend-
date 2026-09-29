import { NextFunction, Request, Response } from "express";
import { UserService } from "./user.service.js";
import AppError from "../../errors/handleAppError.js";
import sendResponse from "../../utils/response/responseSend.js";
import catchAsync from "../../utils/CatchAsync.js";
import { checkCommonValidation } from "../../utils/checkCommonValidation.js";
import { Types } from "mongoose";
import { UserInterface } from "./user.interface.js";
import { sendImageToCloudinary } from "../../utils/sendImageToCloudinary.js";

const createStudent = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const file = req.file as Express.Multer.File;
    const { password, student: studentData } = req.body; // Get user data from the request body
    if (!studentData || typeof studentData !== "object") {
      next(new AppError("Student payload is required", 400));
      return;
    }
    // // ZOD validation (kept as comment by request):
    // const zodValidationResult = zodValidateStudent(studentData)

    // Call the service function to create the user in the database
    const result = await UserService.createStudentIntoDB(password, studentData, file);

    if (result) {
      // Check if result is not null or undefined
      sendResponse(res, {
        statusCode: 201,
        success: true,
        message: "User created successfully",
        data: result,
      });
    } else {
      next(new AppError("Failed to create user", 404));
    }
  },
);

// get all users-GET
const getAllUsers = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const query = req.query;
    const result = await UserService.getAllUsersFromDB(query);
    if (result) {
      // Check if result is not null or undefined
      sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "Users retrieved successfully",
        data: result,
      });
    } else {
      next(new AppError("Failed to retrieve users", 404));
    }
  },
);

// get user by ID-GET
const getUserById = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = checkCommonValidation.validateId(
      req.params.id as string,
      next,
    );

    const result = await UserService.getUserByIdFromDB(userId as string);
    if (result) {
      // Check if result is not null or undefined
      sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "User retrieved successfully",
        data: result,
      });
    } else {
      next(new AppError("User not found", 404));
    }
  },
);

// update user info-PUT
const updateUserInfo = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = checkCommonValidation.validateId(
      req.params.id as string,
      next,
    );
    const updatedData = req.body; // Get updated user data from the request body
    // const validatedData = zodValidateUserUpdate(updatedData)
    const result = await UserService.updateUserInfoInDB(
      userId as string,
      updatedData,
    );
    if (result) {
      // Check if result is not null or undefined
      sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "User updated successfully",
        data: result,
      });
    } else {
      next(new AppError("User not found", 404));
    }
  },
);

// delete user-DELETE
const deleteUser = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = checkCommonValidation.validateId(
      req.params.id as string,
      next,
    );
    const result = await UserService.deleteUserFromDB(userId as string);
    if (result) {
      // Check if result is not null or undefined
      sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "User deleted successfully",
        data: result,
      });
    } else {
      next(new AppError("User not found", 404));
    }
  },
);
// get all deleted users-GET
const getAllDeletedUsers = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const result = await UserService.getAllDeletedUsersFromDB();
    if (result.count != 0) {
      // Check if result is not null or undefined
      sendResponse(res, {
        statusCode: 200,
        success: true,
        message: result.message,
        data: result,
      });
    } else if (result.count === 0) {
      sendResponse(res, {
        statusCode: 200,
        success: true,
        message: result.message,
      });
    } else {
      next(new AppError("Failed to retrieve deleted users", 404));
    }
  },
);

// Restore all deleted users-POST
const restoreDeletedUsers = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const result = await UserService.restoreDeletedUsersInDB();
    if (result.count != 0) {
      // Check if result is not null or undefined
      sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "Deleted users restored successfully",
        data: result.message,
      });
    } else if (result.count === 0) {
      // Check if result is not null or undefined
      sendResponse(res, {
        statusCode: 200,
        success: true,
        message: result.message,
      });
    } else {
      next(new AppError("Failed to restore deleted users", 404));
    }
  },
);
// get my profile-GET
const getMyProfile = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user as UserInterface & { _id?: Types.ObjectId | string };
    const result = await UserService.getMyProfileFromDB(user);
    if (result) {
      // Check if result is not null or undefined
      sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "My profile retrieved successfully",
        data: result,
      });
    } else {
      next(new AppError("Failed to retrieve my profile", 404));
    }
  },
);

const updateMyProfile = catchAsync(async (req: Request, res: Response) => {
  let updatedData = { ...req.body };
  if (req.file?.path) {
    const { secure_url } = (await sendImageToCloudinary(
      req.file.path,
      `profile-${String(req.user.id)}`,
    )) as { secure_url: string };
    updatedData = { ...updatedData, profileImage: secure_url };
  }

  const result = await UserService.updateUserInfoInDB(
    String(req.user._id),
    updatedData,
  );
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Profile updated successfully",
    data: { data: result },
  });
});

export const UserController = {
  createStudent,
  getAllUsers,
  getUserById,
  updateUserInfo,
  deleteUser,
  getAllDeletedUsers,
  restoreDeletedUsers,
  getMyProfile,
  updateMyProfile,
};
