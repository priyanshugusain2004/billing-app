# ⚡ Quick Reference Card

## 🚀 Get Running in 3 Steps

```bash
# 1. Install backend
cd /workspaces/billing-app-backend
npm install && cp .env.example .env

# 2. Edit .env with your MongoDB URI
# MONGO_URI=mongodb+srv://user:pass@cluster.net/billing-app

# 3. Start backend
npm run dev
# ✅ Server running on http://localhost:5000
```

---

## 🔑 Environment Variables

### Backend (.env)
```
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb+srv://...
JWT_SECRET=<generate-random>
JWT_EXPIRY=7d
FRONTEND_URL=http://localhost:5173
```

### Frontend (.env)
```
VITE_API_URL=http://localhost:5000/api
```

---

## 📡 API Endpoints

### Auth (No token needed)
```
POST /api/auth/signup
POST /api/auth/login
```

### Products (Token needed)
```
GET    /api/products
POST   /api/products          (Admin only)
PUT    /api/products/{id}     (Admin only)
DELETE /api/products/{id}     (Admin only)
```

### Orders (Token needed)
```
POST /api/orders
GET  /api/orders?page=1&limit=20
GET  /api/orders/stats         (Admin only)
```

### Shop (Token needed)
```
GET    /api/shop
PUT    /api/shop/settings      (Admin only)
GET    /api/shop/users         (Admin only)
POST   /api/shop/users         (Admin only)
```

**Header for protected routes:**
```
Authorization: Bearer YOUR_TOKEN
```

---

## 📝 Example API Calls

### Signup
```bash
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "shopName":"Test Shop",
    "businessType":"fruit-shop",
    "email":"shop@test.com",
    "phone":"9999999999",
    "username":"admin",
    "password":"Admin123"
  }'
```

### Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"shop@test.com","password":"Admin123"}'

# Saves token to $TOKEN variable
export TOKEN="<token_from_response>"
```

### Get Products
```bash
curl http://localhost:5000/api/products \
  -H "Authorization: Bearer $TOKEN"
```

### Create Product
```bash
curl -X POST http://localhost:5000/api/products \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name":"Apple",
    "price":80,
    "stock":50,
    "category":"Fruit",
    "image":"base64_or_url"
  }'
```

### Create Order
```bash
curl -X POST http://localhost:5000/api/orders \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "items":[{"productId":"...",
              "price":80,
              "quantity":2.5,
              "weightInGrams":2500}],
    "paymentMethod":"Cash",
    "discount":0,
    "gst":36
  }'
```

---

## 🗄️ Database Models

```typescript
Shop {
  _id, name, businessType, email, phone, address,
  settings: {
    enableInventory, enableGST, enableQRPayment,
    enableDiscounts, language, gstNumber, qrCodeUrl
  }
}

User {
  _id, username, email, passwordHash, role,
  shopId, isActive
}

Product {
  _id, name, price, stock, category, image,
  description, sku, shopId
}

Order {
  _id, items: [{productId, name, price, qty, weight}],
  subtotal, discount, gst, finalTotal,
  paymentMethod, shopId, createdBy, notes
}
```

---

## 🔒 Authentication Flow

```
1. User submits email + password
   ↓
2. Server validates, hashes password
   ↓
3. Server generates JWT token
   ↓
4. Client stores token in localStorage
   ↓
5. All API requests include: Authorization: Bearer TOKEN
   ↓
6. Server validates token, extracts shopId + role
   ↓
7. Query filtered by shopId
```

---

## 📊 Data Isolation

```
Shop A (shopId: 1)
├─ User: Admin A
├─ Products: Apple, Banana
└─ Orders: Order 1, Order 2

Shop B (shopId: 2)
├─ User: Admin B
├─ Products: Carrot, Potato
└─ Orders: Order 3, Order 4

Shop A's users CANNOT access Shop B's data
(enforced at database query level)
```

---

## 🛠️ Development vs Production

### Development
```
MONGO_URI = mongodb://localhost:27017/billing-app
FRONTEND_URL = http://localhost:5173
NODE_ENV = development
JWT_SECRET = can_be_simple
```

### Production
```
MONGO_URI = mongodb+srv://user:pass@cluster.net/...
FRONTEND_URL = https://yourapp.vercel.app
NODE_ENV = production
JWT_SECRET = <cryptographically_random>
```

---

## 🚢 Deployment Checklist

### Pre-Deployment
- [ ] npm run build works locally
- [ ] Test signup/login/products/orders
- [ ] Environment variables set
- [ ] MongoDB Atlas cluster created
- [ ] Generate strong JWT_SECRET

### Post-Deployment
- [ ] Test all endpoints on production
- [ ] Verify CORS working
- [ ] Check MongoDB backups enabled
- [ ] Monitor error logs daily

---

## 📈 Performance Tips

1. **Pagination**: Always use `limit` parameter for orders
   ```
   GET /api/orders?page=1&limit=20
   ```

2. **Indexing**: Database indexes already created for:
   - shopId queries
   - Order date range queries

3. **Caching**: Frontend can cache products locally:
   ```typescript
   useEffect(() => {
     const cached = localStorage.getItem('products_cache');
     if (cached) setProducts(JSON.parse(cached));
     productService.getAll().then(data => {
       localStorage.setItem('products_cache', JSON.stringify(data));
       setProducts(data);
     });
   }, []);
   ```

---

## 🐛 Common Issues

| Issue | Solution |
|-------|----------|
| CORS Error | Update FRONTEND_URL env var on backend |
| Connection timeout | Check MongoDB IP whitelist |
| Invalid token | Regenerate/login again |
| MONGO_URI not found | Create .env file with MONGO_URI |
| Port 5000 in use | Kill process: `lsof -i :5000` |
| npm install fails | Delete node_modules, run again |

---

## 📚 Documentation Quick Links

| Document | Purpose |
|----------|---------|
| [SUMMARY.md](SUMMARY.md) | Complete overview |
| [QUICK_START.md](QUICK_START.md) | Setup guide |
| [README.md](README.md) | API reference |
| [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) | Production deploy |
| [INDEX.md](INDEX.md) | Full documentation index |

---

## 🎯 File Locations

| File | Location | Purpose |
|------|----------|---------|
| API Service | `billing-app/src/services/api.ts` | Use in React |
| Integration Guide | `billing-app/FRONTEND_INTEGRATION_GUIDE.md` | How to integrate |
| Backend | `billing-app-backend/src/` | Express server |
| Models | `billing-app-backend/src/models/` | Database schemas |
| Controllers | `billing-app-backend/src/controllers/` | Business logic |

---

## 💻 Shell Commands

```bash
# Developer - Backend
npm install          Install dependencies
npm run dev          Start dev server
npm run build        Build for production
npm run start        Start production server

# Developer - Frontend
npm run dev          Start dev server
npm run build        Build optimized bundle

# MongoDB
mongosh "mongodb+srv://..."  Connect to production DB

# Git
git init
git add .
git commit -m "message"
git push              Push to GitHub
```

---

## 🔐 Security Checklist

- [ ] JWT_SECRET is random 32+ chars
- [ ] Passwords hashed (bcryptjs)
- [ ] HTTPS enabled (automatic)
- [ ] CORS set to specific origin
- [ ] MongoDB user has limited permissions
- [ ] No secrets in Git history
- [ ] Environment variables not logged
- [ ] Rate limiting considered

---

## 📱 Feature Flags (Shop.settings)

```json
{
  "enableInventory": true,     // Show inventory page
  "enableGST": true,           // Show GST field
  "enableQRPayment": true,     // Show QR payment option
  "enableDiscounts": true,     // Auto-calculate discounts
  "language": "en"             // en or hi
}
```

Frontend checks these and hides/shows features accordingly.

---

## 🌍 Deployment URLs

### After Deployment
```
Frontend:  https://your-app.vercel.app
Backend:   https://your-api.onrender.com
Database:  MongoDB Atlas (no public URL)
```

---

## 🎓 Learning Path

1. **Understand**: Read SUMMARY.md
2. **Setup**: Follow QUICK_START.md
3. **Code**: Explore src/ folder
4. **Test**: Try API calls with curl
5. **Deploy**: Follow DEPLOYMENT_GUIDE.md
6. **Integrate**: Update React components

---

**Total Time to Production: ~2 hours** ⏱️

**Ready?** Start with [QUICK_START.md](QUICK_START.md) →
