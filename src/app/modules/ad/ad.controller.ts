import { Request, Response } from "express";
import { Types } from "mongoose";
import AppError from "../../errors/handleAppError.js";
import catchAsync from "../../utils/CatchAsync.js";
import {
  removeUploadedLocalFile,
  sendImageToCloudinary,
} from "../../utils/sendImageToCloudinary.js";
import sendResponse from "../../utils/response/responseSend.js";
import { AdModel } from "./ad.model.js";

const list = catchAsync(async (_req: Request, res: Response) => {
  const ads = await AdModel.find({ isDeleted: false }).sort({ createdAt: -1 });
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Ads retrieved successfully",
    data: { data: ads },
  });
});

const getById = catchAsync(async (req: Request, res: Response) => {
  const id = req.params.id as string;
  if (!Types.ObjectId.isValid(id)) throw new AppError("Invalid ad id", 400);

  const ad = await AdModel.findOne({ _id: id, isDeleted: false });
  if (!ad) throw new AppError("Ad not found", 404);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Ad retrieved successfully",
    data: { data: ad },
  });
});

const create = catchAsync(async (req: Request, res: Response) => {
  if (!req.file?.path) throw new AppError("Ad image is required", 400);

  const { secure_url: image } = (await sendImageToCloudinary(
    req.file.path,
    `ad-${Date.now()}`,
  )) as { secure_url: string };

  const ad = await AdModel.create({
    title: req.body.title,
    image,
    link: req.body.link,
  });
  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: "Ad created successfully",
    data: { data: ad },
  });
});

const update = catchAsync(async (req: Request, res: Response) => {
  const id = req.params.id as string;
  if (!Types.ObjectId.isValid(id)) {
    await removeUploadedLocalFile(req.file?.path);
    throw new AppError("Invalid ad id", 400);
  }

  const updateData: { title?: string; image?: string; link?: string } = {};
  if (req.body.title !== undefined) updateData.title = req.body.title;
  if (req.body.link !== undefined) updateData.link = req.body.link;

  if (req.file?.path) {
    const { secure_url: image } = (await sendImageToCloudinary(
      req.file.path,
      `ad-${id}-${Date.now()}`,
    )) as { secure_url: string };
    updateData.image = image;
  }

  if (Object.keys(updateData).length === 0) {
    throw new AppError("Provide a title, image, or link to update", 400);
  }

  const ad = await AdModel.findOneAndUpdate(
    { _id: id, isDeleted: false },
    updateData,
    { returnDocument: "after", runValidators: true },
  );
  if (!ad) throw new AppError("Ad not found", 404);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Ad updated successfully",
    data: { data: ad },
  });
});

const remove = catchAsync(async (req: Request, res: Response) => {
  const id = req.params.id as string;
  if (!Types.ObjectId.isValid(id)) throw new AppError("Invalid ad id", 400);

  const ad = await AdModel.findOneAndUpdate(
    { _id: id, isDeleted: false },
    { isDeleted: true },
    { returnDocument: "after" },
  );
  if (!ad) throw new AppError("Ad not found", 404);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Ad deleted successfully",
    data: { data: ad },
  });
});

export const AdController = { list, getById, create, update, remove };