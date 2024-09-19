import { z } from "zod";

export const messageSchema = z.object({
  content: z
    .string()
    .min(10, "Please enter 10 characters at least")
    .max(300, "max 300 characters"),
});
