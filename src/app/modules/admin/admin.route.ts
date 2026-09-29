import express from "express";
import validation from "../../middleware/validator/validetResquest.js";
import authorizationValidate from "../../middleware/authorizationValidate.js";
import { UserRole } from "../user/user.constant.js";
import { PortalAdminController } from "./portal.controller.js";
import { createAdminValidation } from "./portal.validation.js";

const router = express.Router();

router.post(
  "/create-admin",
  authorizationValidate(UserRole.SUPER_ADMIN),
  validation(createAdminValidation),
  PortalAdminController.createAdmin,
);

// Export the router to be used in the main app
export const AdminRoute = router;
