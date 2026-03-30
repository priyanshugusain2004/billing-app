/**
 * API Service - All backend communication
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

const getLayoutFromBusinessType = (businessType?: string) => {
  switch (businessType) {
    case 'supermarket':
      return 'compact';
    case 'fruit-shop':
    case 'vegetable-shop':
      return 'market';
    case 'grocery':
    case 'other':
    default:
      return 'classic';
  }
};

const applyDefaultLayoutForShop = (shop: { id: string; businessType?: string }) => {
  const customizedKey = `${shop.id}:layoutCustomized`;
  const hasManualCustomization = localStorage.getItem(customizedKey) === 'true';

  if (!hasManualCustomization) {
    const layout = getLayoutFromBusinessType(shop.businessType);
    localStorage.setItem(`${shop.id}:shopLayout`, JSON.stringify(layout));
  }
};

// Utility function to get token from localStorage
const getToken = (): string | null => {
  return localStorage.getItem('authToken');
};

const parseResponseBody = async (response: Response): Promise<any> => {
  const contentType = response.headers.get('content-type') || '';

  if (contentType.includes('application/json')) {
    return response.json();
  }

  const text = await response.text();
  return {
    message: text?.slice(0, 200) || `Request failed with status ${response.status}`,
  };
};

// Utility function to make API calls with auth header
const apiCall = async (
  endpoint: string,
  options: RequestInit = {}
): Promise<any> => {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> | undefined),
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await parseResponseBody(response);

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
    address: string | undefined,
    paymentAmount = 500,
    paymentReference: string
  ) => {
    const response = await apiCall('/account/signup', {
      method: 'POST',
      body: JSON.stringify({
        shopName,
        businessType,
        email,
        phone,
        username,
        password,
        address,
        paymentAmount,
        paymentReference,
      }),
    });

    // Store token and shop info
    if (response.token) {
      localStorage.setItem('authToken', response.token);
      localStorage.setItem('shopId', response.shop.id);
      localStorage.setItem('shopSettings', JSON.stringify(response.shop.settings));
      if (response.shop.businessType) {
        localStorage.setItem(`${response.shop.id}:shopBusinessType`, response.shop.businessType);
      }
      applyDefaultLayoutForShop(response.shop);
    }

    return response;
  },

  /**
   * Login
   */
  login: async (email: string, password: string, shopId?: string) => {
    const response = await apiCall('/account/login', {
      method: 'POST',
      body: JSON.stringify({ email, password, shopId }),
    });

    // Store token and shop info
    if (response.token) {
      localStorage.setItem('authToken', response.token);
      localStorage.setItem('shopId', response.shop.id);
      localStorage.setItem('shopSettings', JSON.stringify(response.shop.settings));
      if (response.shop.businessType) {
        localStorage.setItem(`${response.shop.id}:shopBusinessType`, response.shop.businessType);
      }
      applyDefaultLayoutForShop(response.shop);
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

// ============ PLATFORM ANALYTICS SERVICES ============

export const analyticsService = {
  getOverview: async (platformAdminKey: string) => {
    const response = await fetch(`${API_BASE_URL}/analytics/overview`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'x-platform-admin-key': platformAdminKey,
      },
    });

    const data = await parseResponseBody(response);
    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch analytics overview');
    }

    return data.data;
  },
};
