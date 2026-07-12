import { z } from "zod";

export const emailSchema = z.object({
  email: z
    .string()
    .email("Invalid email address"),
});

export const signUpSchema = emailSchema;

export const signUpSocialSchema = emailSchema;

export const verifyEmailSchema = z.object({
  code: z
    .string()
    .length(6, "Verification code must be 6 digits"),
});

export const verifyEmailTokenSchema = z.object({
  token: z
    .string()
    .min(1, "Token cannot be empty"),
});

export const forgotPasswordSchema = emailSchema;

export const resetPasswordSchema = z.object({
  token: z
    .string()
    .min(1, "Token cannot be empty"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(30, "Password must be at most 30 characters"),
});

export const resendVerificationSchema = emailSchema;

export const updatePasswordSchema = z.object({
  currentPassword: z
    .string()
    .min(1),
  newPassword: z
    .string()
    .min(8, "New password must be at least 8 characters")
    .max(30, "New password must be at most 30 characters"),
});

export const emailPreferencesSchema = z.object({
  emailNotifications: z.boolean(),
});
