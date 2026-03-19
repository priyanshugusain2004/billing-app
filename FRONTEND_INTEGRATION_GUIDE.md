# Frontend Integration Guide - React to SaaS

This guide explains how to convert your existing React billing app from localStorage-based to a cloud-based SaaS system with backend integration.

## 1. Architecture Changes

### Before (localStorage)
```
React Frontend
    ↓
localStorage (browser only)
```

### After (SaaS)
```
React Frontend
    ↓
API Service (HTTP)
    ↓
Express Backend
    ↓
MongoDB Database
```

## 2. Key Changes Required

### 2.1 Add API Service

Create `src/services/api.ts` - This file handles all backend communication:

```typescript
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const apiCall = async (endpoint: string, options: RequestInit = {}) => {
  const token = localStorage.getItem('authToken');
  const headers = {
    'Content-Type': 'application/json',
    Authorization: token ? `Bearer ${token}` : '',
    ...options.headers,
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  return response.json();
};
```

### 2.2 Update Authentication

#### Old (localStorage)
```typescript
// Login with password check in frontend
const login = (password: string) => {
  if (password === adminPassword) {
    setUser({ id: '1', name: 'Admin' });
    localStorage.setItem('user', JSON.stringify(user));
  }
};
```

#### New (Backend JWT)
```typescript
// src/services/api.ts
export const authService = {
  login: async (email: string, password: string) => {
    const response = await apiCall('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    
    localStorage.setItem('authToken', response.token);
    return response;
  },
};
```

### 2.3 Update AppContext

```typescript
// src/context/AppContext.tsx
import { authService, productService, orderService } from '../services/api';

interface AppContextType {
  user: User | null;
  shop: IShop | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  // ... other properties
}

export const AppContext = createContext<AppContextType>(null!);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [shop, setShop] = useState<IShop | null>(null);
  const [loading, setLoading] = useState(true);

  // Initialize from localStorage on mount
  useEffect(() => {
    const initializeApp = async () => {
      const token = localStorage.getItem('authToken');
      if (token) {
        try {
          const shopData = await shopService.get();
          setShop(shopData);
          
          // Decode token to get user info (or fetch from API)
          // For now, we'll store user in localStorage during login
          const userStr = localStorage.getItem('currentUser');
          if (userStr) setUser(JSON.parse(userStr));
        } catch (error) {
          console.error('Failed to initialize app', error);
          logout();
        }
      }
      setLoading(false);
    };

    initializeApp();
  }, []);

  const login = async (email: string, password: string) => {
    const response = await authService.login(email, password);
    setUser(response.user);
    setShop(response.shop);
    localStorage.setItem('currentUser', JSON.stringify(response.user));
  };

  const logout = () => {
    authService.logout();
    setUser(null);
    setShop(null);
    localStorage.removeItem('currentUser');
  };

  // Replace localStorage calls with API calls for:
  // - Products: use productService.getAll() instead of localStorage.getItem('products')
  // - Orders: use orderService.create() instead of localStorage operations
  // - Shop: use shopService.get() instead of localStorage.getItem('shop')

  return (
    <AppContext.Provider value={{ user, shop, login, logout, loading, /* ... */ }}>
      {children}
    </AppContext.Provider>
  );
};
```

## 3. Detailed Migration Steps

### Step 1: Setup Environment Variables

Create `.env` file:
```
VITE_API_URL=http://localhost:5000/api
```

### Step 2: Update Types

Add new interfaces to `src/types.ts`:
```typescript
import mongoose from 'mongoose';

export interface IShop {
  _id: string;
  name: string;
  businessType: string;
  email: string;
  phone: string;
  address?: string;
  settings: {
    enableInventory: boolean;
    enableGST: boolean;
    enableQRPayment: boolean;
    enableDiscounts: boolean;
    language: 'en' | 'hi';
    gstNumber?: string;
    qrCodeUrl?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface IOrder {
  _id: string;
  items: CartItem[];
  subtotal: number;
  discount: number;
  gst?: number;
  finalTotal: number;
  paymentMethod: PaymentMethod;
  shopId: string;
  createdBy: string;
  notes?: string;
  createdAt: Date;
}
```

### Step 3: Update Components

#### Products Page
```typescript
// OLD: Read from localStorage
const [products, setProducts] = useState(() => {
  const saved = localStorage.getItem('products');
  return saved ? JSON.parse(saved) : [];
});

// NEW: Fetch from API
useEffect(() => {
  const fetchProducts = async () => {
    try {
      const data = await productService.getAll();
      setProducts(data);
    } catch (error) {
      console.error('Failed to fetch products', error);
    }
  };
  fetchProducts();
}, []);

// Add product
const addProduct = async (product: Product) => {
  try {
    const result = await productService.create(product);
    setProducts([...products, result]);
  } catch (error) {
    console.error('Failed to add product', error);
  }
};
```

#### Billing Page (Cart)
```typescript
// OLD: Calculate locally, save to localStorage
const handleCheckout = async (items: CartItem[]) => {
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const discount = calculateDiscount(subtotal);
  const finalTotal = subtotal - discount;
  
  const sale = { items, subtotal, discount, finalTotal, date: new Date() };
  const sales = JSON.parse(localStorage.getItem('sales') || '[]');
  sales.push(sale);
  localStorage.setItem('sales', JSON.stringify(sales));
};

// NEW: Send to backend
const handleCheckout = async (items: CartItem[], paymentMethod: PaymentMethod) => {
  try {
    const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const discount = calculateDiscount(subtotal);
    const gst = shop.settings.enableGST ? subtotal * 0.18 : 0;
    const finalTotal = subtotal - discount + gst;

    const order = await orderService.create({
      items: items.map(item => ({
        productId: item.id,
        price: item.price,
        quantity: item.quantity,
        weightInGrams: item.weightInGrams,
      })),
      paymentMethod,
      discount,
      gst,
    });

    // Clear cart and show success
    setCart([]);
    showSuccess('Order created successfully');
  } catch (error) {
    showError('Failed to create order');
  }
};
```

#### Reports Page
```typescript
// OLD: Calculate from localStorage
const getSalesStats = () => {
  const sales = JSON.parse(localStorage.getItem('sales') || '[]');
  return {
    total: sales.reduce((sum, s) => sum + s.finalTotal, 0),
    count: sales.length,
  };
};

// NEW: Fetch from backend (with pre-calculated stats)
useEffect(() => {
  const fetchStats = async () => {
    try {
      const stats = await orderService.getStats();
      setStats(stats);
    } catch (error) {
      console.error('Failed to fetch stats', error);
    }
  };
  fetchStats();
}, []);
```

## 4. Feature Toggle Based on Shop Settings

The backend sends `shop.settings` with feature flags. Use these to hide/show UI:

```typescript
// src/components/billing/PaymentModal.tsx
export const PaymentModal: React.FC<PaymentModalProps> = ({ shop, cartTotal }) => {
  return (
    <div>
      {/* Always show cash payment */}
      <label>
        <input type="radio" value="Cash" name="paymentMethod" />
        Cash
      </label>

      {/* Conditionally show QR payment */}
      {shop?.settings.enableQRPayment && (
        <label>
          <input type="radio" value="Online" name="paymentMethod" />
          Online (QR Code)
        </label>
      )}
    </div>
  );
};
```

```typescript
// src/components/billing/Cart.tsx
export const Cart: React.FC<CartProps> = ({ shop, items, subtotal }) => {
  const discount = calculateDiscount(subtotal);
  const gst = shop?.settings.enableGST ? subtotal * 0.18 : 0;

  return (
    <div>
      <p>Subtotal: ₹{subtotal}</p>
      {shop?.settings.enableDiscounts && <p>Discount: ₹{discount}</p>}
      {shop?.settings.enableGST && <p>GST (18%): ₹{gst}</p>}
      <p className="font-bold">Total: ₹{subtotal - discount + gst}</p>
    </div>
  );
};
```

## 5. Error Handling & Loading States

```typescript
const [loading, setLoading] = useState(false);
const [error, setError] = useState<string | null>(null);

const fetchProducts = async () => {
  setLoading(true);
  setError(null);
  try {
    const data = await productService.getAll();
    setProducts(data);
  } catch (err) {
    setError(err instanceof Error ? err.message : 'Failed to fetch products');
  } finally {
    setLoading(false);
  }
};

if (loading) return <div>Loading...</div>;
if (error) return <div className="text-red-600">{error}</div>;
```

## 6. State Management Comparison

| Feature | Before (localStorage) | After (API) |
|---------|----------------------|------------|
| Products | localStorage.getItem | productService.getAll() |
| Add Product | localStorage.setItem | productService.create() |
| Create Order | localStorage.setItem | orderService.create() |
| Get Orders | localStorage.getItem | orderService.getAll() |
| Get Stats | Calculate locally | orderService.getStats() |
| Shop Settings | localStorage.getItem | shopService.get() |
| User Auth | Password in localStorage | JWT token + API |

## 7. Data Sync & Offline Support (Future)

For offline-first capability with sync:

```typescript
// In the future, use a sync queue
const createOrderOffline = async (order: Order) => {
  // Save to local DB (IndexedDB/SQLite)
  await db.orders.add(order);
  
  // Try to sync when online
  if (navigator.onLine) {
    await syncQueue.process();
  }
};

// Listen to online/offline events
window.addEventListener('online', () => syncQueue.process());
```

## 8. Updated Login Flow

```
User opens app
    ↓
Check for authToken in localStorage
    ↓
If exists, fetch shop data from API
    ↓
Display dashboard
    ↓
User not authenticated?
    ↓
Show Login/Signup page
    ↓
User logs in via API
    ↓
Backend returns JWT token
    ↓
Store token in localStorage
    ↓
Redirect to dashboard
```

## 9. Environment Configuration

### Development (.env)
```
VITE_API_URL=http://localhost:5000/api
```

### Production (.env.production)
```
VITE_API_URL=https://api.yourdomain.com
```

## 10. CORS Configuration (Backend)

The backend already handles CORS - it's configured in `.env`:
```
FRONTEND_URL=http://localhost:5173  # Dev
FRONTEND_URL=https://yourdomain.com # Production
```

## 11. Migration Checklist

- [ ] Create API service file
- [ ] Update environment variables
- [ ] Update AppContext for API calls
- [ ] Update Login/Signup pages
- [ ] Update Products page to use API
- [ ] Update Billing/Cart page to use API
- [ ] Update Reports page to use API
- [ ] Update Inventory page to use API
- [ ] Test all flows locally
- [ ] Add error handling
- [ ] Add loading states
- [ ] Test with backend running
- [ ] Deploy backend to production
- [ ] Update production frontend

## 12. Troubleshooting

### CORS Error
Ensure backend's `FRONTEND_URL` includes your frontend domain:
```bash
FRONTEND_URL=https://yourdomain.com
```

### Auth Token Not Persisting
Check browser localStorage:
```javascript
console.log(localStorage.getItem('authToken'));
```

### Products Not Loading
Check network tab in DevTools - verify API response structure

### Discount/GST Not Showing
Verify shop.settings.enableDiscounts and enableGST are true

## 13. Security Best Practices

✓ Store JWT token in localStorage (acceptable for SPA)
✓ Include token in all API requests via Authorization header
✓ Clear token on logout
✓ Don't store sensitive data in localStorage
✓ Use HTTPS in production
✓ Implement token refresh (optional)

---

**Next Step:** Deploy backend to MongoDB Atlas + Render, then update VITE_API_URL in frontend
