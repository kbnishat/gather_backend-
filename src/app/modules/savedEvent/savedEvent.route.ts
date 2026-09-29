import express from "express";
import authorizationValidate from "../../middleware/authorizationValidate.js";
import validation from "../../middleware/validator/validetResquest.js";
import { UserRole } from "../user/user.constant.js";
import { SavedEventController } from "./savedEvent.controller.js";
import { savedEventValidation } from "./savedEvent.validation.js";

const router = express.Router();
const signedIn = authorizationValidate(UserRole.USER, UserRole.ADMIN, UserRole.SUPER_ADMIN);

router.get("/mine", signedIn, SavedEventController.listMine);
router.post("/", signedIn, validation(savedEventValidation), SavedEventController.save);
router.get("/:eventId", signedIn, SavedEventController.getMineById);
router.delete("/:eventId", signedIn, SavedEventController.remove);

export const SavedEventRoute = router;