import { ClientSession } from "mongoose";
import config from "../../config/index.js";
import AppError from "../../errors/handleAppError.js";
import { CounterService } from "../counter/counter.service.js";
import { UserRoleEnum } from "./user.interface.js";

const padSequence = (value: number) => value.toString().padStart(4, "0");

/**
 * Generates a year-scoped unique id for each supported user role.
 */
const generateUserId = async (
  role: UserRoleEnum,
  session?: ClientSession,
): Promise<string> => {
  const year = new Date().getFullYear().toString();
  const counterPrefix = role === "faculty" ? "FAC" : role === "user" ? "USR" : "ADM";
  const counterKey = `${counterPrefix}${year}`;
  const getCounterData = await CounterService.createOrFindCounterIntoDB(
    counterKey,
    role,
    session,
  );
  if (!getCounterData) {
    throw new AppError("Failed to generate counter data", 500);
  }
  return `${counterKey}${padSequence(getCounterData.sequenceValue)}`;
};

const resolveNewUserPassword = (password: string | undefined) => {
  const trimmed = typeof password === "string" ? password.trim() : "";
  if (trimmed === "") {
    return {
      password: config.DEFAULT_USER_PASSWORD,
      needsPasswordReset: true,
    };
  }
  return { password: trimmed, needsPasswordReset: false };
};

export const UserUtils = {
  generateUserId,
  resolveNewUserPassword,
};
