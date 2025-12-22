const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private getAuthToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('authToken');
    }
    return null;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const token = this.getAuthToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers: {
        ...headers,
        ...options.headers,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || data.message || 'An error occurred');
    }

    return data;
  }

  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  async post<T>(endpoint: string, body: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

  async put<T>(endpoint: string, body: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(body),
    });
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
}

export const apiClient = new ApiClient(API_BASE_URL);

export const authApi = {
  register: (email: string, password: string) =>
    apiClient.post<ApiResponse<{ userId: string; email: string; token: string }>>(
      '/auth/register',
      { email, password }
    ),
  login: (email: string, password: string) =>
    apiClient.post<ApiResponse<{ userId: string; email: string; token: string }>>(
      '/auth/login',
      { email, password }
    ),
  logout: () => apiClient.post<ApiResponse>('/auth/logout', {}),
  getMe: () =>
    apiClient.get<ApiResponse<{ id: string; email: string; created_at: string }>>(
      '/auth/me'
    ),
};

export interface BrandKit {
  id: string;
  user_id: string;
  brand_name: string;
  tone: string | null;
  personality: string | null;
  words_to_use: string[] | null;
  words_to_avoid: string[] | null;
  example_posts: string | null;
  created_at: string;
  updated_at?: string;
}

export interface CreateBrandKitInput {
  brand_name: string;
  tone?: string | null;
  personality?: string | null;
  words_to_use?: string[] | null;
  words_to_avoid?: string[] | null;
  example_posts?: string | null;
}

export const brandKitApi = {
  getAll: () =>
    apiClient.get<ApiResponse<BrandKit[]>>('/brand-kit'),
  getById: (id: string) =>
    apiClient.get<ApiResponse<BrandKit>>(`/brand-kit/${id}`),
  create: (data: CreateBrandKitInput) =>
    apiClient.post<ApiResponse<BrandKit>>('/brand-kit', data),
  update: (id: string, data: Partial<CreateBrandKitInput>) =>
    apiClient.put<ApiResponse<BrandKit>>(`/brand-kit/${id}`, data),
  delete: (id: string) =>
    apiClient.delete<ApiResponse>(`/brand-kit/${id}`),
};
