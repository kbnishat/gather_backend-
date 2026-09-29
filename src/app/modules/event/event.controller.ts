import { Request, Response } from "express";
import { Types } from "mongoose";
import AppError from "../../errors/handleAppError.js";
import catchAsync from "../../utils/CatchAsync.js";
import { sendImageToCloudinary } from "../../utils/sendImageToCloudinary.js";
import sendResponse from "../../utils/response/responseSend.js";
import { EventModel } from "./event.model.js";

const list = catchAsync(async (_req: Request, res: Response) => {
  const events = await EventModel.find({ isDeleted: false }).sort({ date: 1 });
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Events retrieved successfully",
    data: { data: events },
  });
});

const getById = catchAsync(async (req: Request, res: Response) => {
  const id = req.params.id as string;
  if (!Types.ObjectId.isValid(id)) throw new AppError("Invalid event id", 400);

  const event = await EventModel.findOne({ _id: id, isDeleted: false });
  if (!event) throw new AppError("Event not found", 404);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Event retrieved successfully",
    data: { data: event },
  });
});

const create = catchAsync(async (req: Request, res: Response) => {
  const eventData = { ...req.body };
  if (req.file?.path) {
    const { secure_url: image } = (await sendImageToCloudinary(
      req.file.path,
      `event-${Date.now()}`,
    )) as { secure_url: string };
    eventData.image = image;
  }

  const event = await EventModel.create(eventData);
  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: "Event created successfully",
    data: { data: event },
  });
});

const update = catchAsync(async (req: Request, res: Response) => {
  const id = req.params.id as string;
  if (!Types.ObjectId.isValid(id)) throw new AppError("Invalid event id", 400);

  const updateData = { ...req.body };
  if (req.file?.path) {
    const { secure_url: image } = (await sendImageToCloudinary(
      req.file.path,
      `event-${id}-${Date.now()}`,
    )) as { secure_url: string };
    updateData.image = image;
  }

  const event = await EventModel.findOneAndUpdate(
    { _id: id, isDeleted: false },
    updateData,
    { returnDocument: "after", runValidators: true },
  );
  if (!event) throw new AppError("Event not found", 404);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Event updated successfully",
    data: { data: event },
  });
});

const remove = catchAsync(async (req: Request, res: Response) => {
  const id = req.params.id as string;
  if (!Types.ObjectId.isValid(id)) throw new AppError("Invalid event id", 400);

  const event = await EventModel.findOneAndUpdate(
    { _id: id, isDeleted: false },
    { isDeleted: true },
    { returnDocument: "after" },
  );
  if (!event) throw new AppError("Event not found", 404);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Event deleted successfully",
    data: { data: event },
  });
});

export const EventController = { list, getById, create, update, remove };