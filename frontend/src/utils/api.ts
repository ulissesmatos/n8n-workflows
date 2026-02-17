import axios, { AxiosInstance } from 'axios';
import type {
  Workflow,
  WorkflowFilters,
  LoginRequest,
  LoginResponse,
  WorkflowListResponse,
  WorkflowDetailResponse,
} from '@app-types';

class ApiClient {
  private client: AxiosInstance;
  private token: string | null = null;

  constructor() {
    this.client = axios.create({
      baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1',
      timeout: parseInt(import.meta.env.VITE_API_TIMEOUT || '30000'),
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Load token from localStorage
    this.token = localStorage.getItem('authToken');
    if (this.token) {
      this.setAuthHeader();
    }

    // Add interceptor for 401 errors
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          this.clearAuth();
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  private setAuthHeader() {
    if (this.token) {
      this.client.defaults.headers.common['Authorization'] = `Bearer ${this.token}`;
    }
  }

  // Auth methods
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    const response = await this.client.post<LoginResponse>('/admin/login', credentials);
    const token = response.data.data.token;
    this.token = token;
    localStorage.setItem('authToken', token);
    this.setAuthHeader();
    return response.data;
  }

  logout() {
    this.clearAuth();
  }

  private clearAuth() {
    this.token = null;
    localStorage.removeItem('authToken');
    delete this.client.defaults.headers.common['Authorization'];
  }

  isAuthenticated(): boolean {
    return !!this.token;
  }

  // Workflow methods
  async getWorkflows(filters: WorkflowFilters): Promise<WorkflowListResponse> {
    const response = await this.client.get<WorkflowListResponse>('/workflows', {
      params: {
        page: filters.page || 1,
        limit: filters.limit || 20,
        search: filters.search,
        category: filters.category,
        difficulty: filters.difficulty,
        tags: filters.tags?.join(','),
        sort: filters.sort || 'newest',
        featured: filters.featured,
      },
    });
    return response.data;
  }

  async getFeaturedWorkflows(): Promise<{ statusCode: number; data: Workflow[] }> {
    const response = await this.client.get('/workflows/featured');
    return response.data;
  }

  async getWorkflowBySlug(slug: string): Promise<WorkflowDetailResponse> {
    const response = await this.client.get<WorkflowDetailResponse>(`/workflows/${slug}`);
    return response.data;
  }

  async downloadWorkflow(slug: string): Promise<void> {
    const response = await this.client.get(`/workflows/${slug}/json`, {
      responseType: 'blob',
    });

    // Create download link
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${slug}.json`);
    document.body.appendChild(link);
    link.click();
    link.parentNode?.removeChild(link);
    window.URL.revokeObjectURL(url);
  }

  // Admin methods
  async getAdminWorkflows(filters?: WorkflowFilters): Promise<WorkflowListResponse> {
    const response = await this.client.get<WorkflowListResponse>('/admin/workflows', {
      params: {
        page: filters?.page || 1,
        limit: filters?.limit || 20,
      },
    });
    return response.data;
  }

  async getAdminWorkflow(id: string): Promise<WorkflowDetailResponse> {
    const response = await this.client.get<WorkflowDetailResponse>(`/admin/workflows/${id}`);
    return response.data;
  }

  async createWorkflow(workflow: Partial<Workflow>) {
    const response = await this.client.post('/admin/workflows', workflow);
    return response.data;
  }

  async updateWorkflow(id: string, workflow: Partial<Workflow>) {
    const response = await this.client.put(`/admin/workflows/${id}`, workflow);
    return response.data;
  }

  async deleteWorkflow(id: string) {
    const response = await this.client.delete(`/admin/workflows/${id}`);
    return response.data;
  }

  async getAdminStats() {
    const response = await this.client.get('/admin/stats');
    return response.data;
  }

  // Category methods
  async getCategories() {
    const response = await this.client.get('/categories');
    return response.data;
  }

  async getAdminCategories() {
    const response = await this.client.get('/admin/categories');
    return response.data;
  }

  async createCategory(category: { name: string; slug: string; description?: string; icon?: string }) {
    const response = await this.client.post('/admin/categories', category);
    return response.data;
  }

  async updateCategory(id: string, category: { name?: string; slug?: string; description?: string; icon?: string }) {
    const response = await this.client.put(`/admin/categories/${id}`, category);
    return response.data;
  }

  async deleteCategory(id: string) {
    const response = await this.client.delete(`/admin/categories/${id}`);
    return response.data;
  }
}

export const apiClient = new ApiClient();


