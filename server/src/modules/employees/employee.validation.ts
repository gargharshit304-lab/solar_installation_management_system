import { z } from 'zod';
import { USER_ROLES } from '../../config/constants';

const roleEnum = z.enum(USER_ROLES);

export const createEmployeeSchema = z.object({
  employeeCode: z.string().min(1).max(30).optional(),
  fullName: z.string().min(2).max(150),
  email: z.string().email().max(255),
  phone: z.string().min(6).max(30),
  department: z.string().min(2).max(100),
  designation: z.string().min(2).max(100),
  role: roleEnum,
  hourlyRate: z.number().min(0).max(100000).optional(),
  skills: z.array(z.string().min(1).max(60)).max(50).optional(),
  isAvailable: z.boolean().optional(),
  activeJobs: z.number().int().min(0).max(1000).optional(),
  joiningDate: z.string().max(40).optional(),
  avatarUrl: z.string().url().max(2048).optional(),
  // Temporary onboarding password, hashed server-side before storage.
  password: z.string().min(8).max(128).optional()
});

export const updateEmployeeSchema = z.object({
  employeeCode: z.string().min(1).max(30).optional(),
  fullName: z.string().min(2).max(150).optional(),
  email: z.string().email().max(255).optional(),
  phone: z.string().min(6).max(30).optional(),
  department: z.string().min(2).max(100).optional(),
  designation: z.string().min(2).max(100).optional(),
  role: roleEnum.optional(),
  hourlyRate: z.number().min(0).max(100000).optional(),
  skills: z.array(z.string().min(1).max(60)).max(50).optional(),
  isAvailable: z.boolean().optional(),
  activeJobs: z.number().int().min(0).max(1000).optional(),
  joiningDate: z.string().max(40).optional(),
  avatarUrl: z.string().url().max(2048).optional(),
  password: z.string().min(8).max(128).optional(),
  status: z.enum(['active', 'on_leave', 'inactive']).optional()
});
