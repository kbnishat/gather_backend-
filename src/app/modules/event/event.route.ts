import express from "express";
import authorizationValidate from "../../middleware/authorizationValidate.js";
import { upload } from "../../utils/sendImageToCloudinary.js";
import { UserRole } from "../user/user.constant.js";
import { EventController } from "./event.controller.js";

const router = express.Router();
const managers = authorizationValidate(UserRole.ADMIN, UserRole.SUPER_ADMIN);

router.get("/", EventController.list);
router.get("/:id", EventController.getById);
router.post("/", managers, upload.single("image"), EventController.create);
router.patch("/:id", managers, upload.single("image"), EventController.update);
router.delete("/:id", managers, EventController.remove);

export const EventRoute = router;