import type { UserInterface } from "../modules/user/user.interface.js";
import type { Types } from "mongoose";

// this is a global interface for the express request object
declare global {
  namespace Express {
    interface Request {
      /** Set by `authorizationValidate` after JWT verification and DB user load */
      user: TokenPayloadType;
      //it was
      //user: JwtPayload
    }
  }
}
