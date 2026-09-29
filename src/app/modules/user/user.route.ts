import express, { NextFunction, Request, Response } from "express";
import { UserController } from "./user.controller.js";
import { userValidations } from "./user.validator.js";
import validation from "../../middleware/validator/validetResquest.js";
import { UserRole } from "./user.constant.js";
import authorizationValidate from "../../middleware/authorizationValidate.js";
import { removeUploadedLocalFile, upload } from "../../utils/sendImageToCloudinary.js";

// Create a router instance
const router = express.Router();

// Define your user routes here

// Route for creating a user and Student
router.post(
  "/create-student",
  authorizationValidate(UserRole.ADMIN),
  upload.single("file"),
  async (req: Request, _res: Response, next: NextFunction) => {
    try {
      req.body = JSON.parse(req.body.data);
      next();
    } catch (error) {
      await removeUploadedLocalFile(req.file?.path);
      next(error);
    }
  },
  validation(userValidations.createStudentPayloadSchema), // Validate the request body against the createStudentPayloadSchema
  UserController.createStudent,
);

// *** Get Me ****
// Get Me Profile
router.get(
  "/get-my-profile",
  authorizationValidate(
    UserRole.SUPER_ADMIN,
    UserRole.ADMIN,
    UserRole.USER,
    UserRole.FACULTY,
    UserRole.STUDENT,
  ),
  UserController.getMyProfile,
);
// // Update my profile
// router.patch(
//   "/update-my-profile",
//   authorizationValidate(
//     UserRole.SUPER_ADMIN,
//     UserRole.ADMIN,
//     UserRole.FACULTY,
//     UserRole.STUDENT,
//   ),
//   validation(userValidations.updateUserValidationSchema),
//   UserController.updateMyProfile,
// );
router.patch(
  "/update-my-profile",
  authorizationValidate(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.USER),
  upload.single("image"),
  (req, _res, next) => {
    if (req.file) req.body.profileImage = "__uploaded__";
    next();
  },
  validation(userValidations.updateMyProfileValidationSchema),
  UserController.updateMyProfile,
);
router.get(
  "/get-all-users",
  authorizationValidate(UserRole.SUPER_ADMIN, UserRole.ADMIN),
  UserController.getAllUsers,
);

// Route for getting a user by ID
router.get(
  "/get-user/:id",
  authorizationValidate(UserRole.SUPER_ADMIN, UserRole.ADMIN),
  UserController.getUserById,
);

// Route for updating user info
router.patch(
  "/update-user/:id",
  authorizationValidate(UserRole.SUPER_ADMIN, UserRole.ADMIN),
  validation(userValidations.updateUserValidationSchema),
  UserController.updateUserInfo,
);

// Route for deleting a user
router.delete(
  "/delete-user/:id",
  authorizationValidate(UserRole.SUPER_ADMIN, UserRole.ADMIN),
  UserController.deleteUser,
);

// Route for getting all deleted users
router.get(
  "/get-all-deleted-users",
  authorizationValidate(UserRole.SUPER_ADMIN, UserRole.ADMIN),
  UserController.getAllDeletedUsers,
);

// Route for restoring deleted users
router.patch(
  "/restore-deleted-users",
  authorizationValidate(UserRole.SUPER_ADMIN, UserRole.ADMIN),
  UserController.restoreDeletedUsers,
);

export const UserRoute = router;
