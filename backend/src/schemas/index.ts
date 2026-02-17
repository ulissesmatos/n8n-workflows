import { z } from 'zod';

// Workflow schemas
export const CreateWorkflowSchema = z.object({
  title: z.string().min(3).max(255),
  slug: z.string().min(3).max(255).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  description: z.string().min(10).max(2000),
  content: z.string().optional(),
  jsonData: z.record(z.any()),
  category: z.string().min(1).max(100),
  difficulty: z.enum(['easy', 'medium', 'hard']),
  tags: z.array(z.string()).default([]),
  author: z.string().optional(),
  version: z.string().default('1.0.0'),
  isPublished: z.boolean().default(false),
  isFeatured: z.boolean().default(false),
});

export const UpdateWorkflowSchema = CreateWorkflowSchema.partial();

export const WorkflowQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().optional(),
  category: z.string().optional(),
  difficulty: z.enum(['easy', 'medium', 'hard']).optional(),
  tags: z.string().optional(), // comma-separated
  sort: z.enum(['newest', 'popular', 'rating']).default('newest'),
  featured: z.coerce.boolean().optional(),
});

// Admin schemas
export const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export const AdminUserCreateSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

// Review schemas
export const WorkflowReviewSchema = z.object({
  rating: z.number().int().min(1).max(5),
  comment: z.string().max(1000).optional(),
  userEmail: z.string().email(),
});

// Workflow List schemas
export const CreateWorkflowListSchema = z.object({
  title: z.string().min(3).max(255),
  slug: z.string().min(3).max(255).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  description: z.string().max(2000).optional(),
  icon: z.string().max(50).optional(),
  order: z.number().int().min(0).default(0),
  isFeatured: z.boolean().default(false),
});

export const UpdateWorkflowListSchema = CreateWorkflowListSchema.partial();

export const AddWorkflowToListSchema = z.object({
  workflowId: z.string(),
  order: z.number().int().min(0).optional(),
});

export const ReorderWorkflowInListSchema = z.object({
  workflowId: z.string(),
  newOrder: z.number().int().min(0),
});

export type CreateWorkflow = z.infer<typeof CreateWorkflowSchema>;
export type UpdateWorkflow = z.infer<typeof UpdateWorkflowSchema>;
export type WorkflowQuery = z.infer<typeof WorkflowQuerySchema>;
export type Login = z.infer<typeof LoginSchema>;
export type AdminUserCreate = z.infer<typeof AdminUserCreateSchema>;
export type WorkflowReview = z.infer<typeof WorkflowReviewSchema>;
export type CreateWorkflowList = z.infer<typeof CreateWorkflowListSchema>;
export type UpdateWorkflowList = z.infer<typeof UpdateWorkflowListSchema>;
export type AddWorkflowToList = z.infer<typeof AddWorkflowToListSchema>;
export type ReorderWorkflowInList = z.infer<typeof ReorderWorkflowInListSchema>;
