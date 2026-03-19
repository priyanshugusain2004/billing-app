/**
 * API Service - All backend communication
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Utility function to get token from localStorage
const getToken = (): string | null => {
  return localStorage.getItem('authToken');
};

// Utility function to make API calls with auth header
const apiCall = async (
  endpoint: string,
  options: RequestInit = {}
): Promise<any> => {
  const token = getToken();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'API request failed');
  }

  return data.data || data;
};

// ============ AUTH SERVICES ============

export const authService = {
  /**
   * Sign up - Create new shop and admin user
   */
  signup: async (
    shopName: string,
    businessType: string,
    email: string,
    phone: string,
    username: string,
    password: string,
    address?: string
  ) => {
    const response = await apiCall('/auth/signup', {
      method: 'POST',
      body: JSON.stringify({
        shopName,
        businessType,
        email,
        phone,
        username,
        password,
        address,
      }),
    });

    // Store token and shop info
    if (response.token) {
      localStorage.setItem('authToken', response.token);
      localStorage.setItem('shopId', response.shop.id);
      localStorage.setItem('shopSettings', JSON.stringify(response.shop.settings));
    }

    return response;
  },

  /**
   * Login
   */
  login: async (email: string, password: string) => {
    const response = await apiCall('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    // Store token and shop info
    if (response.token) {
      localStorage.setItem('authToken', response.token);
      localStorage.setItem('shopId', response.shop.id);
      localStorage.setItem('shopSettings', JSON.stringify(response.shop.settings));
    }

    return response;
  },

  /**
   * Logout
   */
  logout: () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('shopId');
    localStorage.removeItem('shopSettings');
  },
};

// ============ PRODUCT SERVICES ============

export const productService = {
  /**
   * Get all products
   */
  getAll: async () => {
    return apiCall('/products', { method: 'GET' });
  },

  /**
   * Create product
   */
  create: async (product: {
    name: string;
    price: number;
    stock: number;
    category: string;
    image: string;
    description?: string;
  }) => {
    return apiCall('/products', {
      method: 'POST',
      body: JSON.stringify(product),
    });
  },

  /**
   * Update product
   */
  update: async (id: string, product: any) => {
    return apiCall(`/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(product),
    });
  },

  /**
   * Delete product
   */
  delete: async (id: string) => {
    return apiCall(`/products/${id}`, {
      method: 'DELETE',
    });
  },
};

// ============ ORDER SERVICES ============

export const orderService = {
  /**
   * Create new order
   */
  create: async (orderData: {
    items: Array<{
      productId: string;
      price: number;
      quantity: number;
      weightInGrams: number;
    }>;
    paymentMethod: string;
    discount?: number;
    gst?: number;
    notes?: string;
  }) => {
    return apiCall('/orders', {
      method: 'POST',
      body: JSON.stringify(orderData),
    });
  },

  /**
   * Get all orders (with pagination)
   */
  getAll: async (page = 1, limit = 20) => {
    return apiCall(`/orders?page=${page}&limit=${limit}`, {
      method: 'GET',
    });
  },

  /**
   * Get sales statistics
   */
  getStats: async () => {
    return apiCall('/orders/stats', { method: 'GET' });
  },
};

// ============ SHOP SERVICES ============

export const shopService = {
  /**
   * Get shop details
   */
  get: async () => {
    return apiCall('/shop', { method: 'GET' });
  },

  /**
   * Update shop settings
   */
  updateSettings: async (settings: any) => {
    return apiCall('/shop/settings', {
      method: 'PUT',
      body: JSON.stringify(settings),
    });
  },

  /**
   * Get all shop users
   */
  getUsers: async () => {
    return apiCall('/shop/users', { method: 'GET' });
  },

  /**
   * Create new user
   */
  createUser: async (userData: {
    username: string;
    email: string;
    password: string;
    role: string;
  }) => {
    return apiCall('/shop/users', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  },
};
