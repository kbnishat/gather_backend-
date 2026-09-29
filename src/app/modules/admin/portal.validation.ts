import { z } from "zod";

export const createAdminValidation = z.object({
  password: z.string().min(6),
  name: z.string().min(1),
  email: z.string().email(),
  phone: z.string().optional(),
});
