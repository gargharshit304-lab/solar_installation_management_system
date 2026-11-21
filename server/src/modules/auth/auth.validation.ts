import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Please provide a valid business email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  rememberMe: z.boolean().optional().default(false)
});

export const refreshSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required')
});

export const passwordResetRequestSchema = z.object({
  email: z.string().email('Please provide a valid email address')
});

export const passwordResetConfirmSchema = z.object({
  token: z.string().min(1, 'Password reset token is required'),
  newPassword: z.string().min(8, 'New password must be at least 8 characters')
});

export const emailVerifySchema = z.object({
  token: z.string().min(1, 'Verification token is required')
});
