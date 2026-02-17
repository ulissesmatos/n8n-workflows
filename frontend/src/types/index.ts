// Workflow types
export interface Workflow {
  id: string;
  title: string;
  slug: string;
  description: string;
  content?: string;
  jsonData: Record<string, any>;
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
  tags: string[];
  author: string;
  version: string;
  thumbnailUrl?: string;
  viewCount: number;
  downloadCount: number;
  rating?: number;
  isPublished: boolean;
  isFeatured: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface WorkflowListResponse {
  statusCode: number;
  data: Workflow[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface WorkflowDetailResponse {
  statusCode: number;
  data: Workflow;
}

// Filter types
export interface WorkflowFilters {
  search?: string;
  category?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  tags?: string[];
  sort?: 'newest' | 'popular' | 'rating';
  featured?: boolean;
  page?: number;
  limit?: number;
}

// Admin types
export interface AdminUser {
  id: string;
  email: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  statusCode: number;
  data: {
    token: string;
    admin: AdminUser;
  };
}

// API Response types
export interface ApiResponse<T> {
  statusCode: number;
  message?: string;
  data?: T;
}

// Analytics types
export interface WorkflowAnalytics {
  embedViews: number;
  publicViews: number;
  downloads: number;
}
