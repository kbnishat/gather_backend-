import { z } from "zod";

export const createAdValidation = z.object({
  title: z.string().trim().min(1, "Ad title is required"),
  link: z.url("Ad link must be a valid URL"),
});

export const updateAdValidation = z
  .object({
    title: z.string().trim().min(1, "Ad title cannot be empty").optional(),
    link: z.url("Ad link must be a valid URL").optional(),
  });