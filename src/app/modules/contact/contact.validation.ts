import { z } from "zod";

const contactType = z.enum([
  "phone",
  "email",
  "address",
  "website",
  "social",
  "other",
]);

export const createContactValidation = z.object({
  label: z.string().trim().min(1, "Contact label is required"),
  value: z.string().trim().min(1, "Contact value is required"),
  type: contactType,
  link: z.url("Contact link must be a valid URL").optional(),
  isActive: z.coerce.boolean().optional(),
});

export const updateContactValidation = createContactValidation.partial();