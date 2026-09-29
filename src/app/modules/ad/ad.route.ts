import express from "express";
import authorizationValidate from "../../middleware/authorizationValidate.js";
import validation from "../../middleware/validator/validetResquest.js";
import { upload } from "../../utils/sendImageToCloudinary.js";
import { UserRole } from "../user/user.constant.js";
import { AdController } from "./ad.controller.js";
import { createAdValidation, updateAdValidation } from "./ad.validation.js";

const router = express.Router();
const managers = authorizationValidate(UserRole.ADMIN, UserRole.SUPER_ADMIN);

router.get("/", AdController.list);
router.get("/:id", AdController.getById);
router.post(
  "/",
  managers,
  upload.single("image"),
  validation(createAdValidation),
  AdController.create,
);
router.patch(
  "/:id",
  managers,
  upload.single("image"),
  validation(updateAdValidation),
  AdController.update,
);
router.delete("/:id", managers, AdController.remove);

export const AdRoute = router;