import { z } from "zod";

export const eventRegistrationValidation = z.object({
  eventId: z.string().min(1),
});
