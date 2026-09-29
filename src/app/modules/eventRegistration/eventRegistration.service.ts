import { Types } from "mongoose";
import AppError from "../../errors/handleAppError.js";
import { EventModel } from "../event/event.model.js";
import { EventRegistrationModel } from "./eventRegistration.model.js";

const register = async (eventId: string, userId: string) => {
  if (!Types.ObjectId.isValid(eventId)) throw new AppError("Invalid event id", 400);
  const event = await EventModel.findOne({ _id: eventId, isDeleted: false });
  if (!event) throw new AppError("Event not found", 404);
  try {
    return await EventRegistrationModel.create({ event: event._id, user: userId });
  } catch (error) {
    if ((error as { code?: number }).code === 11000) {
      throw new AppError("You are already registered for this event", 409);
    }
    throw error;
  }
};

const cancel = async (eventId: string, userId: string) => {
  const registration = await EventRegistrationModel.findOneAndDelete({ event: eventId, user: userId });
  if (!registration) throw new AppError("Registration not found", 404);
  return registration;
};

const listMine = async (userId: string, eventId?: string) => {
  if (eventId && !Types.ObjectId.isValid(eventId)) {
    throw new AppError("Invalid event id", 400);
  }

  const filter = { user: userId, ...(eventId ? { event: eventId } : {}) };
  return EventRegistrationModel.find(filter)
    .populate("event")
    .sort({ registeredAt: -1 });
};

const listAll = async (eventId?: string) => {
  if (eventId && !Types.ObjectId.isValid(eventId)) {
    throw new AppError("Invalid event id", 400);
  }

  const filter = eventId ? { event: eventId } : {};
  return EventRegistrationModel.find(filter)
    .populate("event")
    .populate("user", "id name email phone gender profileImage")
    .sort({ registeredAt: -1 });
};

const listByEvent = async (eventId: string) => {
  if (!Types.ObjectId.isValid(eventId)) throw new AppError("Invalid event id", 400);

  const event = await EventModel.findOne({ _id: eventId, isDeleted: false });
  if (!event) throw new AppError("Event not found", 404);

  const [registrationCount, registrations] = await Promise.all([
    EventRegistrationModel.countDocuments({ event: eventId }),
    EventRegistrationModel.find({ event: eventId })
      .populate("user", "id name email phone gender profileImage")
      .sort({ registeredAt: -1 }),
  ]);

  return { event, registrationCount, registrations };
};

const dashboard = async () => {
  const [users, admins, events, registrations, upcomingEvents] = await Promise.all([
    EventRegistrationModel.db.model("User").countDocuments({ role: "user", isDeleted: false }),
    EventRegistrationModel.db.model("User").countDocuments({ role: "admin", isDeleted: false }),
    EventModel.countDocuments({ isDeleted: false }),
    EventRegistrationModel.countDocuments(),
    EventModel.countDocuments({ isDeleted: false, date: { $gte: new Date() } }),
  ]);
  return { users, admins, events, registrations, upcomingEvents };
};

export const EventRegistrationService = { register, cancel, listMine, listAll, listByEvent, dashboard };
