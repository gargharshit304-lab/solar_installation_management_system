/**
 * SolarOS Typed Frontend API Client
 * Connects the React application to the Node.js Express backend.
 */

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  meta: {
    requestId: string;
    timestamp: string;
    pagination?: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}

const API_BASE = '/api/v1';

async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const headers = new Headers(options.headers || {});
  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  // Include credentials for HttpOnly cookie session support
  const config: RequestInit = {
    ...options,
    headers,
    credentials: 'include'
  };

  try {
    const response = await fetch(`${API_BASE}${endpoint}`, config);
    const result: ApiResponse<T> = await response.json();

    if (!response.ok || !result.success) {
      const errorMsg = result.error?.message || `Request failed with status ${response.status}`;
      const error = new Error(errorMsg) as any;
      error.code = result.error?.code || 'API_ERROR';
      error.details = result.error?.details;
      error.statusCode = response.status;
      throw error;
    }

    return result;
  } catch (err: any) {
    if (!err.code) {
      err.code = 'NETWORK_ERROR';
      err.message = err.message || 'Unable to connect to SolarOS server.';
    }
    throw err;
  }
}

export const authApi = {
  login: async (email: string, password: string, rememberMe = false) => {
    return request<{
      user: any;
      accessToken: string;
      refreshToken: string;
      expiresAt: number;
    }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password, rememberMe })
    });
  },

  getSession: async (token?: string) => {
    const headers: Record<string, string> = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;
    return request<{ authenticated: boolean; user: any }>('/auth/session', {
      method: 'GET',
      headers
    });
  },

  refresh: async (refreshToken: string) => {
    return request<{
      accessToken: string;
      refreshToken: string;
      expiresAt: number;
      user: any;
    }>('/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ refreshToken })
    });
  },

  logout: async (refreshToken?: string) => {
    return request<{ message: string }>('/auth/logout', {
      method: 'POST',
      body: JSON.stringify({ refreshToken })
    });
  },

  requestPasswordReset: async (email: string) => {
    return request<{ message: string; resetToken?: string }>('/auth/password-reset/request', {
      method: 'POST',
      body: JSON.stringify({ email })
    });
  },

  resetPassword: async (token: string, newPassword: string) => {
    return request<{ message: string }>('/auth/password-reset/confirm', {
      method: 'POST',
      body: JSON.stringify({ token, newPassword })
    });
  }
};

export const healthApi = {
  getHealth: async () => {
    return request<any>('/health', { method: 'GET' });
  },
  getDatabaseHealth: async () => {
    return request<any>('/health/db', { method: 'GET' });
  }
};

export const rbacApi = {
  getRoles: async (token?: string) => {
    const headers: Record<string, string> = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;
    return request<any[]>('/rbac/roles', { method: 'GET', headers });
  },
  updateRolePermissions: async (roleKey: string, permissions: Record<string, string[]>, token?: string) => {
    const headers: Record<string, string> = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;
    return request<any>(`/rbac/roles/${roleKey}/permissions`, {
      method: 'PUT',
      headers,
      body: JSON.stringify({ permissions })
    });
  },
  getDelegations: async (token?: string) => {
    const headers: Record<string, string> = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;
    return request<any[]>('/rbac/delegations', { method: 'GET', headers });
  },
  createDelegation: async (data: any, token?: string) => {
    const headers: Record<string, string> = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;
    return request<any>('/rbac/delegations', {
      method: 'POST',
      headers,
      body: JSON.stringify(data)
    });
  },
  revokeDelegation: async (id: string, token?: string) => {
    const headers: Record<string, string> = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;
    return request<any>(`/rbac/delegations/${id}`, {
      method: 'DELETE',
      headers
    });
  }
};

export const auditApi = {
  getLogs: async (params: { page?: number; limit?: number; entity?: string } = {}, token?: string) => {
    const query = new URLSearchParams(params as any).toString();
    const headers: Record<string, string> = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;
    return request<any[]>(`/audit-logs?${query}`, { method: 'GET', headers });
  }
};
