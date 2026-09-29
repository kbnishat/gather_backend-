import express from "express";
import { UserRoute } from "../modules/user/user.route.js";
import { AdminRoute } from "../modules/admin/admin.route.js";
import { AuthRoute } from "../modules/auth/auth.route.js";
import { EventRegistrationRoute } from "../modules/eventRegistration/eventRegistration.route.js";
import { SavedEventRoute } from "../modules/savedEvent/savedEvent.route.js";
import { EventRoute } from "../modules/event/event.route.js";
import { AdRoute } from "../modules/ad/ad.route.js";
import { ContactRoute } from "../modules/contact/contact.route.js";

const router = express.Router();

const moduleRoutes = [
  { path: "/users", route: UserRoute },
  { path: "/admins", route: AdminRoute },
  { path: "/event-registrations", route: EventRegistrationRoute },
  { path: "/saved-events", route: SavedEventRoute },
  { path: "/events", route: EventRoute },
  { path: "/ads", route: AdRoute },
  { path: "/contacts", route: ContactRoute },
  { path: "/auth", route: AuthRoute },
];
for (const moduleRoute of moduleRoutes) {
  router.use(moduleRoute.path, moduleRoute.route);
}

// Promise.reject()
export default router;
