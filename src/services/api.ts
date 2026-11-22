/**
 * SolarOS Typed Frontend API Client
 * Connects the React application to the Node.js Express backend.
 */

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  code?: string;
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

    // Safe handling: avoid response.json() on empty, HTML, or proxy error response
    const contentType = response.headers.get('content-type') || '';
    const rawText = await response.text();
    let result: any = null;

    if (rawText && rawText.trim().length > 0) {
      if (contentType.includes('application/json') || rawText.trim().startsWith('{') || rawText.trim().startsWith('[')) {
        try {
          result = JSON.parse(rawText);
        } catch {
          // not valid JSON
        }
      }
    }

    if (!response.ok || (result && result.success === false)) {
      const isGatewayError = response.status === 502 || response.status === 503 || response.status === 504;
      const errorMsg = 
        result?.error?.message || 
        result?.message || 
        (isGatewayError 
          ? 'SolarOS backend server is not responding. Please verify the backend service is running on port 5000.'
          : response.status === 404
          ? `API route '${endpoint}' not found.`
          : rawText.length > 0 && rawText.length < 200 && !rawText.includes('<')
          ? rawText
          : `Request failed with HTTP status ${response.status}`);

      const error = new Error(errorMsg) as any;
      error.code = result?.error?.code || result?.code || (isGatewayError ? 'SERVER_UNREACHABLE' : `HTTP_${response.status}`);
      error.details = result?.error?.details || result?.details;
      error.statusCode = response.status;
      throw error;
    }

    // Handle 204 No Content
    if (!result && response.status === 204) {
      return { success: true, meta: { requestId: '204', timestamp: new Date().toISOString() } } as any;
    }

    if (!result) {
      throw new Error(`Empty or invalid response from server (HTTP ${response.status})`);
    }

    return result as ApiResponse<T>;
  } catch (err: any) {
    if (!err.code) {
      err.code = 'NETWORK_ERROR';
      const isNetworkFailure =
        err.name === 'TypeError' ||
        /failed to fetch|networkerror|load failed|fetch failed/i.test(err.message || '');
      err.message = isNetworkFailure
        ? 'Unable to connect to the SolarOS backend server. Please ensure it is running on port 5000.'
        : err.message || 'Unable to connect to SolarOS server.';
    }
    throw err;
  }
}

export interface EmployeeSearchResult {
  employees: any[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
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

export interface AuditLogQueryParams {
  page?: number;
  limit?: number;
  entity?: string;
  module?: string;
  action?: string;
  actorId?: string;
  department?: string;
  result?: string;
  startDate?: string;
  endDate?: string;
  search?: string;
}

export const auditApi = {
  getLogs: async (params: AuditLogQueryParams = {}, token?: string) => {
    const cleanParams: Record<string, string> = {};
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== '' && val !== 'All') {
        cleanParams[key] = String(val);
      }
    });
    const query = new URLSearchParams(cleanParams).toString();
    const headers: Record<string, string> = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;
    return request<any[]>(`/audit-logs?${query}`, { method: 'GET', headers });
  }
};

export const employeeApi = {
  getDepartments: async (token?: string, signal?: AbortSignal) => {
    const headers: Record<string, string> = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;
    return request<any[]>('/employees/departments', { method: 'GET', headers, signal });
  },

  searchEmployees: async (
    params: {
      department?: string;
      search?: string;
      status?: string;
      page?: number;
      limit?: number;
    } = {},
    token?: string,
    signal?: AbortSignal
  ) => {
    const query = new URLSearchParams();
    if (params.department && params.department !== 'all') query.set('department', params.department);
    if (params.search) query.set('search', params.search);
    if (params.status && params.status !== 'all') query.set('status', params.status);
    if (params.page) query.set('page', String(params.page));
    query.set('limit', String(params.limit || 20));

    const headers: Record<string, string> = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const qs = query.toString();
    return request<EmployeeSearchResult>(`/employees${qs ? `?${qs}` : ''}`, { method: 'GET', headers, signal });
  },

  createEmployee: async (data: any, token?: string) => {
    const headers: Record<string, string> = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;
    return request<any>('/employees', {
      method: 'POST',
      headers,
      body: JSON.stringify(data)
    });
  },

  updateEmployee: async (id: string, data: any, token?: string) => {
    const headers: Record<string, string> = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;
    return request<any>(`/employees/${id}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(data)
    });
  },

  deleteEmployee: async (id: string, token?: string) => {
    const headers: Record<string, string> = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;
    return request<any>(`/employees/${id}`, {
      method: 'DELETE',
      headers
    });
  }
};

export const customerApi = {
  getCustomers: async (token?: string, signal?: AbortSignal) => {
    const headers: Record<string, string> = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;
    return request<any[]>('/customers', { method: 'GET', headers, signal });
  },

  createCustomer: async (data: any, token?: string) => {
    const headers: Record<string, string> = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;
    return request<any>('/customers', {
      method: 'POST',
      headers,
      body: JSON.stringify(data)
    });
  },

  updateCustomer: async (id: string, data: any, token?: string) => {
    const headers: Record<string, string> = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;
    return request<any>(`/customers/${id}`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify(data)
    });
  },

  deleteCustomer: async (id: string, token?: string) => {
    const headers: Record<string, string> = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;
    return request<any>(`/customers/${id}`, {
      method: 'DELETE',
      headers
    });
  }
};

export const financeApi = {
  getSummary: async (token?: string) => {
    const headers: Record<string, string> = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;
    return request<any>('/finance/summary', { method: 'GET', headers });
  },

  getProjects: async (token?: string) => {
    const headers: Record<string, string> = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;
    return request<any[]>('/finance/projects', { method: 'GET', headers });
  },

  getProjectDetail: async (projectId: string, token?: string) => {
    const headers: Record<string, string> = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;
    return request<any>(`/finance/projects/${projectId}`, { method: 'GET', headers });
  },

  getTransactions: async (
    params: {
      projectId?: string;
      type?: string;
      category?: string;
      status?: string;
      search?: string;
      startDate?: string;
      endDate?: string;
    } = {},
    token?: string
  ) => {
    const query = new URLSearchParams();
    if (params.projectId) query.set('projectId', params.projectId);
    if (params.type && params.type !== 'ALL') query.set('type', params.type);
    if (params.category && params.category !== 'ALL') query.set('category', params.category);
    if (params.status && params.status !== 'ALL') query.set('status', params.status);
    if (params.search) query.set('search', params.search);
    if (params.startDate) query.set('startDate', params.startDate);
    if (params.endDate) query.set('endDate', params.endDate);

    const qs = query.toString();
    const headers: Record<string, string> = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;
    return request<any[]>(`/finance/transactions${qs ? `?${qs}` : ''}`, { method: 'GET', headers });
  },

  getExpenses: async (params: { projectId?: string; orderId?: string } = {}, token?: string) => {
    const query = new URLSearchParams();
    if (params.projectId) query.set('projectId', params.projectId);
    if (params.orderId) query.set('orderId', params.orderId);
    const qs = query.toString();
    const headers: Record<string, string> = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;
    return request<any[]>(`/finance/expenses${qs ? `?${qs}` : ''}`, { method: 'GET', headers });
  },

  recordExpense: async (data: any, token?: string) => {
    const headers: Record<string, string> = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;
    return request<any>('/finance/expenses', {
      method: 'POST',
      headers,
      body: JSON.stringify(data)
    });
  },

  approveExpense: async (expenseId: string, token?: string) => {
    const headers: Record<string, string> = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;
    return request<any>(`/finance/expenses/${expenseId}/approve`, {
      method: 'POST',
      headers
    });
  },

  recordPayment: async (data: any, token?: string) => {
    const headers: Record<string, string> = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;
    return request<any>('/finance/payments', {
      method: 'POST',
      headers,
      body: JSON.stringify(data)
    });
  },

  verifyPayment: async (paymentId: string, token?: string) => {
    const headers: Record<string, string> = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;
    return request<any>('/finance/verify', {
      method: 'POST',
      headers,
      body: JSON.stringify({ paymentId })
    });
  },

  exportLedger: async (token?: string) => {
    const headers: Record<string, string> = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;
    return request<any>('/finance/export', { method: 'GET', headers });
  }
};

export const surveyReviewApi = {
  getSurveys: async (
    params: { queue?: string; status?: string; reviewerId?: string; technicianId?: string; search?: string } = {},
    token?: string
  ) => {
    const query = new URLSearchParams();
    if (params.queue) query.set('queue', params.queue);
    if (params.status) query.set('status', params.status);
    if (params.reviewerId) query.set('reviewerId', params.reviewerId);
    if (params.technicianId) query.set('technicianId', params.technicianId);
    if (params.search) query.set('search', params.search);

    const qs = query.toString();
    const headers: Record<string, string> = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;
    return request<any[]>(`/surveys${qs ? `?${qs}` : ''}`, { method: 'GET', headers });
  },

  getEligibleReviewers: async (excludeTechnicianId?: string, token?: string) => {
    const query = excludeTechnicianId ? `?excludeTechnicianId=${encodeURIComponent(excludeTechnicianId)}` : '';
    const headers: Record<string, string> = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;
    return request<any[]>(`/surveys/eligible-reviewers${query}`, { method: 'GET', headers });
  },

  getEligibleApprovers: async (excludeTechnicianId?: string, token?: string) => {
    const query = excludeTechnicianId ? `?excludeTechnicianId=${encodeURIComponent(excludeTechnicianId)}` : '';
    const headers: Record<string, string> = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;
    return request<any[]>(`/surveys/eligible-approvers${query}`, { method: 'GET', headers });
  },

  assignReviewer: async (surveyId: string, reviewerId: string, reviewerName?: string, token?: string) => {
    const headers: Record<string, string> = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;
    return request<any>(`/surveys/${surveyId}/assign-reviewer`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ reviewerId, reviewerName })
    });
  },

  assignApprover: async (surveyId: string, approverId: string, approverName?: string, token?: string) => {
    const headers: Record<string, string> = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;
    return request<any>(`/surveys/${surveyId}/assign-approver`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ approverId, approverName })
    });
  },

  startReview: async (surveyId: string, token?: string) => {
    const headers: Record<string, string> = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;
    return request<any>(`/surveys/${surveyId}/start-review`, {
      method: 'POST',
      headers
    });
  },

  saveReviewNotes: async (surveyId: string, notes: string, token?: string) => {
    const headers: Record<string, string> = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;
    return request<any>(`/surveys/${surveyId}/review-notes`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ notes })
    });
  },

  requestCorrections: async (surveyId: string, comments: string, token?: string) => {
    const headers: Record<string, string> = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;
    return request<any>(`/surveys/${surveyId}/request-corrections`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ comments })
    });
  },

  resubmit: async (surveyId: string, data: any, token?: string) => {
    const headers: Record<string, string> = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;
    return request<any>(`/surveys/${surveyId}/resubmit`, {
      method: 'POST',
      headers,
      body: JSON.stringify(data)
    });
  },

  submitRecommendation: async (surveyId: string, recommendation: string, notes?: string, token?: string) => {
    const headers: Record<string, string> = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;
    return request<any>(`/surveys/${surveyId}/recommend`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ recommendation, notes })
    });
  },

  approve: async (surveyId: string, notes?: string, token?: string) => {
    const headers: Record<string, string> = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;
    return request<any>(`/surveys/${surveyId}/approve`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ notes })
    });
  },

  reject: async (surveyId: string, reason: string, token?: string) => {
    const headers: Record<string, string> = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;
    return request<any>(`/surveys/${surveyId}/reject`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ reason })
    });
  },

  getAuditTrail: async (surveyId: string, token?: string) => {
    const headers: Record<string, string> = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;
    return request<any[]>(`/surveys/${surveyId}/audit-trail`, { method: 'GET', headers });
  }
};

