/**
 * Admin API Service
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

const getAdminToken = (): string | null => {
  return localStorage.getItem('adminToken');
};

const adminApiCall = async (
  endpoint: string,
  options: RequestInit = {}
): Promise<any> => {
  const token = getAdminToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> | undefined),
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}/admin${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json();

  if (!response.ok) {
    const error = new Error(data.message || 'API request failed') as Error & {
      code?: string;
      data?: any;
      status?: number;
    };
    error.code = data.code;
    error.data = data.data;
    error.status = response.status;
    throw error;
  }

  return data.data || data;
};

export const adminService = {
  /**
   * Login admin with password
   */
  login: async (password: string) => {
    const response = await fetch(`${API_BASE_URL}/admin/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ password }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Login failed');
    }

    if (data.token) {
      localStorage.setItem('adminToken', data.token);
      localStorage.setItem('isAdmin', 'true');
    }

    return data;
  },

  /**
   * Logout admin
   */
  logout: async () => {
    try {
      await adminApiCall('/logout', { method: 'POST' });
    } catch (error) {
      // Even if error, clear local storage
    }
    localStorage.removeItem('adminToken');
    localStorage.removeItem('isAdmin');
  },

  /**
   * Get platform analytics
   */
  getAnalytics: async () => {
    return adminApiCall('/analytics', { method: 'GET' });
  },
};
