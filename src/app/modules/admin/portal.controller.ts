import { Request, Response } from "express";
import catchAsync from "../../utils/CatchAsync.js";
import sendResponse from "../../utils/response/responseSend.js";
import { UserService } from "../user/user.service.js";

const createAdmin = catchAsync(async (req: Request, res: Response) => {
  const admin = await UserService.createPortalAdminIntoDB(req.body);
  sendResponse(res, { statusCode: 201, success: true, message: "Admin created", data: { data: admin } });
});

export const PortalAdminController = { createAdmin };
