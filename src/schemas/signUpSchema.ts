import { z } from "zod";

export const usernameValidation = z
  .string()
  .min(2, "minimun 2 characters")
  .max(20, "max 20 characters")
  .regex(/^[a-zA-Z0-9_]+$/, "Username must not contain special character");

export const signUpSchema = z.object({
  username: usernameValidation,
  email: z.string().email({ message: "invalid email address" }),
  password: z.string().min(6, { message: "password must be 6 characters" }),
});
