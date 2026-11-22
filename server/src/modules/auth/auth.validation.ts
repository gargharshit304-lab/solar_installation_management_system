import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Please provide a valid business email address').max(255),
  // Do not enforce the composition policy at login; it only needs a value.
  password: z.string().min(1, 'Password is required').max(128),
  rememberMe: z.boolean().optional().default(false)
}).strict();

export const passwordResetRequestSchema = z.object({
  email: z.string().email('Please provide a valid email address')
});

export const passwordResetConfirmSchema = z.object({
  token: z.string().min(1, 'Password reset token is required'),
  newPassword: z.string()
    .min(12, 'New password must be at least 12 characters')
    .max(128)
    .regex(/[a-z]/, 'New password must include a lowercase letter')
    .regex(/[A-Z]/, 'New password must include an uppercase letter')
    .regex(/[0-9]/, 'New password must include a number')
    .regex(/[^A-Za-z0-9]/, 'New password must include a symbol')
}).strict();

export const emailVerifySchema = z.object({
  token: z.string().min(1, 'Verification token is required')
});
