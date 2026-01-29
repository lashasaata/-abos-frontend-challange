import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address (e.g., test@example.com)'),
  password: z.string().min(8, 'Password must be at least 8 characters long'),
});

export const registerSchema = loginSchema.extend({
  role: z.enum(['resident', 'building_admin', 'manager', 'provider', 'super_admin'], {
    message: 'Please select a valid role',
  }),
});

export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
