import { z } from "zod";

export const usernameValidation = z
  .string()
  .min(2, "minimun 2 characters")

export const signUpSchema = z.object({
  username: usernameValidation,
  email: z.string().email({ message: "invalid email address" }),
  password: z.string().min(6, { message: "password must be 6 characters" }),
});
