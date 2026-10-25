/**
 * Hind DB - Input Validation Middleware & Zod Schemas
 * Product: Hind DB
 */

import { z } from 'zod';

export const signupSchema = z.object({
  name: z.string().trim().min(2, { message: 'Full name must be at least 2 characters' }),
  email: z.string().trim().email({ message: 'Please provide a valid email address' }),
  password: z.string().min(8, { message: 'Password must be at least 8 characters long' }),
});

export const loginSchema = z.object({
  email: z.string().trim().email({ message: 'Please provide a valid email address' }),
  password: z.string().min(1, { message: 'Password is required' }),
});

export const verifyEmailSchema = z.object({
  token: z.string().min(1, { message: 'Verification token is required' }),
});

export const resendVerificationSchema = z.object({
  email: z.string().trim().email({ message: 'Please provide a valid email address' }),
});

export const forgotPasswordSchema = z.object({
  email: z.string().trim().email({ message: 'Please provide a valid email address' }),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1, { message: 'Reset token is required' }),
  password: z.string().min(8, { message: 'Password must be at least 8 characters long' }),
});

export function validateBody(schema) {
  return (req, res, next) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      const firstIssue = result.error.issues[0];
      return res.status(400).json({
        success: false,
        error: 'VALIDATION_ERROR',
        message: firstIssue ? firstIssue.message : 'Invalid request payload',
        details: result.error.format(),
      });
    }
    req.body = result.data;
    next();
  };
}
