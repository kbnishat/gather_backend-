import authorizationValidate from "../../middleware/authorizationValidate.js";
import validation from "../../middleware/validator/validetResquest.js";
import { UserRole } from "../user/user.constant.js";
import { AuthController } from "./auth.controller.js";
import { AuthValidation } from "./auth.validation.js";
import express from "express";

const router = express.Router();

router.post(
  "/register",
  validation(AuthValidation.registerValidation),
  AuthController.register,
);

router.post(
  "/login",
  validation(AuthValidation.authLoginValidation),
  AuthController.authLogin,
);

router.post("/logout", AuthController.logout);

// change password
router.post(
  "/change-password",
  authorizationValidate(
    UserRole.USER,
    UserRole.ADMIN,
    UserRole.SUPER_ADMIN,
  ),
  validation(AuthValidation.changePasswordValidation),
  AuthController.changePassword,
);

//refresh token
router.post(
  "/refresh-token",
  validation(AuthValidation.refreshTokenValidation, "cookies"),
  AuthController.refreshToken,
);
export const AuthRoute = router;
