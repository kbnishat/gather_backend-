import express from "express";
import authorizationValidate from "../../middleware/authorizationValidate.js";
import validation from "../../middleware/validator/validetResquest.js";
import { UserRole } from "../user/user.constant.js";
import { EventRegistrationController } from "./eventRegistration.controller.js";
import { eventRegistrationValidation } from "./eventRegistration.validation.js";

const router = express.Router();
const signedIn = authorizationValidate(UserRole.USER, UserRole.ADMIN, UserRole.SUPER_ADMIN);
const managers = authorizationValidate(UserRole.ADMIN, UserRole.SUPER_ADMIN);

router.post("/", signedIn, validation(eventRegistrationValidation), EventRegistrationController.register);
router.get("/mine", signedIn, EventRegistrationController.listMine);
router.get("/event/:eventId", managers, EventRegistrationController.listByEvent);
router.delete("/:eventId", signedIn, EventRegistrationController.cancel);
router.get("/", managers, EventRegistrationController.listAll);
router.get("/dashboard", managers, EventRegistrationController.dashboard);

export const EventRegistrationRoute = router;
