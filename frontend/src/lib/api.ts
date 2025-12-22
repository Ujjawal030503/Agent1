const RAW_API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
const API_BASE_URL = RAW_API_BASE_URL.replace(/\/$/, '');

export const AUTH_TOKEN_KEY = 'authToken';
export const UNAUTHORIZED_EVENT = 'auth:unauthorized';

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export class ApiError extends Error {
  public readonly status: number;
  public readonly payload?: unknown;

  constructor(message: string, status: number, payload?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.payload = payload;
  }
}

export const getAuthToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(AUTH_TOKEN_KEY);
};

export const setAuthToken = (token: string): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(AUTH_TOKEN_KEY, token);
};

export const clearAuthToken = (): void => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(AUTH_TOKEN_KEY);
};

const getErrorMessage = (status: number, payload: any): string => {
  const messageFromPayload =
    payload?.message || payload?.error || (typeof payload === 'string' ? payload : null);

  if (messageFromPayload) return messageFromPayload;

  if (status === 400) return 'Invalid request. Please check your inputs and try again.';
  if (status === 401) return 'Your session has expired. Please log in again.';
  if (status === 403) return 'You do not have permission to perform this action.';
  if (status === 404) return 'The requested resource was not found.';
  if (status >= 500) return 'Server error. Please try again later.';

  return 'An unexpected error occurred. Please try again.';
};

const normalizeEndpoint = (endpoint: string): string => {
  if (!endpoint) return '/';
  return endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
};

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const token = getAuthToken();

    const headers = new Headers(options.headers);

    const hasBody = options.body !== undefined && options.body !== null;
    const isFormData = typeof FormData !== 'undefined' && options.body instanceof FormData;

    if (hasBody && !isFormData && !headers.has('Content-Type')) {
      headers.set('Content-Type', 'application/json');
    }

    if (token && !headers.has('Authorization')) {
      headers.set('Authorization', `Bearer ${token}`);
    }

    const url = `${this.baseUrl}${normalizeEndpoint(endpoint)}`;

    let response: Response;
    try {
      response = await fetch(url, {
        ...options,
        headers,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Network error';
      throw new ApiError(`Network error: ${message}`, 0);
    }

    const contentType = response.headers.get('content-type');

    let payload: unknown = null;
    if (response.status !== 204) {
      if (contentType?.includes('application/json')) {
        payload = await response.json().catch(() => null);
      } else {
        payload = await response.text().catch(() => null);
      }
    }

    if (!response.ok) {
      if (response.status === 401) {
        clearAuthToken();
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent(UNAUTHORIZED_EVENT));
        }
      }

      throw new ApiError(getErrorMessage(response.status, payload), response.status, payload);
    }

    return payload as T;
  }

  async get<T>(endpoint: string, options: Omit<RequestInit, 'method'> = {}): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'GET' });
  }

  async post<T>(
    endpoint: string,
    body: unknown,
    options: Omit<RequestInit, 'method' | 'body'> = {}
  ): Promise<T> {
    const isFormData = typeof FormData !== 'undefined' && body instanceof FormData;

    return this.request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: isFormData ? body : JSON.stringify(body),
    });
  }

  async put<T>(
    endpoint: string,
    body: unknown,
    options: Omit<RequestInit, 'method' | 'body'> = {}
  ): Promise<T> {
    const isFormData = typeof FormData !== 'undefined' && body instanceof FormData;

    return this.request<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: isFormData ? body : JSON.stringify(body),
    });
  }

  async delete<T>(endpoint: string, options: Omit<RequestInit, 'method'> = {}): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'DELETE' });
  }
}

export const apiClient = new ApiClient(API_BASE_URL);

export const authApi = {
  register: (email: string, password: string) =>
    apiClient.post<ApiResponse<{ userId: string; email: string; token: string }>>('/auth/register', {
      email,
      password,
    }),
  login: (email: string, password: string) =>
    apiClient.post<ApiResponse<{ userId: string; email: string; token: string }>>('/auth/login', {
      email,
      password,
    }),
  logout: () => apiClient.post<ApiResponse>('/auth/logout', {}),
  getMe: () => apiClient.get<ApiResponse<{ id: string; email: string; created_at: string }>>('/auth/me'),
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
  getAll: () => apiClient.get<ApiResponse<BrandKit[]>>('/brand-kit'),
  getById: (id: string) => apiClient.get<ApiResponse<BrandKit>>(`/brand-kit/${id}`),
  create: (data: CreateBrandKitInput) => apiClient.post<ApiResponse<BrandKit>>('/brand-kit', data),
  update: (id: string, data: Partial<CreateBrandKitInput>) =>
    apiClient.put<ApiResponse<BrandKit>>(`/brand-kit/${id}`, data),
  delete: (id: string) => apiClient.delete<ApiResponse>(`/brand-kit/${id}`),
};

export interface GeneratedPost {
  id: string;
  content_request_id: string;
  platform: string;
  post_text: string;
  confidence_score: number | null;
  created_at: string;
  updated_at?: string;
  validation_notes?: string[];
  revised_text?: string | null;
}

export const contentApi = {
  generate: (niche: string, platform: string, brandKitId?: string) =>
    apiClient.post<ApiResponse<GeneratedPost[]>>('/content/generate', { niche, platform, brandKitId }),
};
