import { z } from "zod";

export const verifySchema = z.object({
  code: z.string().min(6, "please enter a 6 length OTP"),
});
