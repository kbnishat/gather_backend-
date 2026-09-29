import { Request, Response } from "express";
import { Types } from "mongoose";
import AppError from "../../errors/handleAppError.js";
import catchAsync from "../../utils/CatchAsync.js";
import sendResponse from "../../utils/response/responseSend.js";
import { ContactModel } from "./contact.model.js";

const list = catchAsync(async (_req: Request, res: Response) => {
  const contacts = await ContactModel.find({
    isActive: true,
    isDeleted: false,
  }).sort({ createdAt: 1 });

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Contacts retrieved successfully",
    data: { data: contacts },
  });
});

const getById = catchAsync(async (req: Request, res: Response) => {
  const id = req.params.id as string;
  if (!Types.ObjectId.isValid(id)) {
    throw new AppError("Invalid contact id", 400);
  }

  const contact = await ContactModel.findOne({ _id: id, isDeleted: false });
  if (!contact) throw new AppError("Contact not found", 404);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Contact retrieved successfully",
    data: { data: contact },
  });
});

const create = catchAsync(async (req: Request, res: Response) => {
  const contact = await ContactModel.create(req.body);
  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: "Contact created successfully",
    data: { data: contact },
  });
});

const update = catchAsync(async (req: Request, res: Response) => {
  const id = req.params.id as string;
  if (!Types.ObjectId.isValid(id)) {
    throw new AppError("Invalid contact id", 400);
  }

  const contact = await ContactModel.findOneAndUpdate(
    { _id: id, isDeleted: false },
    req.body,
    { returnDocument: "after", runValidators: true },
  );
  if (!contact) throw new AppError("Contact not found", 404);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Contact updated successfully",
    data: { data: contact },
  });
});

const remove = catchAsync(async (req: Request, res: Response) => {
  const id = req.params.id as string;
  if (!Types.ObjectId.isValid(id)) {
    throw new AppError("Invalid contact id", 400);
  }

  const contact = await ContactModel.findOneAndUpdate(
    { _id: id, isDeleted: false },
    { isDeleted: true },
    { returnDocument: "after" },
  );
  if (!contact) throw new AppError("Contact not found", 404);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Contact deleted successfully",
    data: { data: contact },
  });
});

export const ContactController = { list, getById, create, update, remove };