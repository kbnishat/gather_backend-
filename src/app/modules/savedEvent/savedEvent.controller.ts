import { Request, Response } from "express";
import catchAsync from "../../utils/CatchAsync.js";
import sendResponse from "../../utils/response/responseSend.js";
import { SavedEventService } from "./savedEvent.service.js";

const save = catchAsync(async (req: Request, res: Response) => {
  const result = await SavedEventService.save(req.body.eventId, String(req.user._id));
  sendResponse(res, { statusCode: 201, success: true, message: "Event saved", data: { data: result } });
});

const remove = catchAsync(async (req: Request, res: Response) => {
  const result = await SavedEventService.remove(req.params.eventId as string, String(req.user._id));
  sendResponse(res, { statusCode: 200, success: true, message: "Event removed from saved events", data: { data: result } });
});

const listMine = catchAsync(async (req: Request, res: Response) => {
  const result = await SavedEventService.listMine(String(req.user._id));
  sendResponse(res, { statusCode: 200, success: true, message: "Saved events retrieved", data: { data: result } });
});

const getMineById = catchAsync(async (req: Request, res: Response) => {
  const result = await SavedEventService.getMineById(req.params.eventId as string, String(req.user._id));
  sendResponse(res, { statusCode: 200, success: true, message: "Saved event retrieved", data: { data: result } });
});

export const SavedEventController = { save, remove, listMine, getMineById };