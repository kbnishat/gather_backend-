import express from "express";
import authorizationValidate from "../../middleware/authorizationValidate.js";
import validation from "../../middleware/validator/validetResquest.js";
import { UserRole } from "../user/user.constant.js";
import { ContactController } from "./contact.controller.js";
import {
  createContactValidation,
  updateContactValidation,
} from "./contact.validation.js";

const router = express.Router();
const managers = authorizationValidate(UserRole.ADMIN, UserRole.SUPER_ADMIN);

router.get("/", ContactController.list);
router.get("/:id", managers, ContactController.getById);
router.post("/", managers, validation(createContactValidation), ContactController.create);
router.patch("/:id", managers, validation(updateContactValidation), ContactController.update);
router.delete("/:id", managers, ContactController.remove);

export const ContactRoute = router;