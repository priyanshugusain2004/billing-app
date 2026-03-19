# Billing App - Backend Documentation

## Setup Instructions

### 1. Install Dependencies
\`\`\`bash
npm install
\`\`\`

### 2. Configure Environment
Create a `.env` file based on `.env.example`:
\`\`\`
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://localhost:27017/billing-app
JWT_SECRET=your_super_secret_key
JWT_EXPIRY=7d
FRONTEND_URL=http://localhost:5173
\`\`\`

### 3. MongoDB Setup

#### Local Development
\`\`\`bash
# Install MongoDB Community Edition
# On macOS: brew install mongodb-community
# On Linux: Follow MongoDB installation guide

# Start MongoDB service
mongod
\`\`\`

#### MongoDB Atlas (Cloud)
1. Create account at https://www.mongodb.com/cloud/atlas
2. Create a free cluster
3. Get connection string: \`mongodb+srv://user:pass@cluster.mongodb.net/billing-app\`
4. Add to `.env`

### 4. Run Development Server
\`\`\`bash
npm run dev
\`\`\`

Server runs on: http://localhost:5000

## API Endpoints

### Authentication

#### POST /api/auth/signup
Create a new shop and admin user

Request:
\`\`\`json
{
  "shopName": "Fresh Fruits Store",
  "businessType": "fruit-shop",
  "email": "shop@example.com",
  "phone": "9876543210",
  "username": "admin",
  "password": "SecurePassword123",
  "address": "123 Main St"
}
\`\`\`

Response:
\`\`\`json
{
  "message": "Shop created successfully",
  "data": {
    "shop": {
      "id": "...",
      "name": "Fresh Fruits Store",
      "businessType": "fruit-shop",
      "settings": {...}
    },
    "user": {
      "id": "...",
      "username": "admin",
      "role": "Admin"
    },
    "token": "eyJhbGciOiJIUzI1NiIs..."
  }
}
\`\`\`

#### POST /api/auth/login
Login user

Request:
\`\`\`json
{
  "email": "shop@example.com",
  "password": "SecurePassword123"
}
\`\`\`

### Products

#### GET /api/products
Get all products for the shop

Headers:
\`\`\`
Authorization: Bearer <token>
\`\`\`

#### POST /api/products
Create a new product (Admin only)

\`\`\`json
{
  "name": "Apple",
  "price": 80,
  "stock": 50,
  "category": "Fruit",
  "image": "base64_string_or_url",
  "description": "Red apples",
  "sku": "APPLE001"
}
\`\`\`

#### PUT /api/products/:id
Update product (Admin only)

#### DELETE /api/products/:id
Delete product (Admin only)

### Orders

#### POST /api/orders
Create a new order

\`\`\`json
{
  "items": [
    {
      "productId": "...",
      "price": 80,
      "quantity": 2.5,
      "weightInGrams": 2500
    }
  ],
  "paymentMethod": "Cash",
  "discount": 50,
  "gst": 24
}
\`\`\`

#### GET /api/orders
Get all orders (with pagination)

Query params:
- \`page\`: page number (default: 1)
- \`limit\`: items per page (default: 20)

#### GET /api/orders/stats
Get sales statistics (Admin only)

### Shop

#### GET /api/shop
Get shop details

#### PUT /api/shop/settings
Update shop settings (Admin only)

\`\`\`json
{
  "name": "Updated Name",
  "settings": {
    "enableGST": true,
    "enableQRPayment": true,
    "language": "hi"
  }
}
\`\`\`

#### GET /api/shop/users
Get all shop users (Admin only)

#### POST /api/shop/users
Create new user (Admin only)

\`\`\`json
{
  "username": "cashier1",
  "email": "cashier@example.com",
  "password": "Pass123",
  "role": "Cashier"
}
\`\`\`

## Multi-Tenant Architecture

### Data Isolation
- All queries automatically filter by \`shopId\` from JWT token
- Each shop's data is completely isolated
- Users can only access their shop's data

### Example Controller Pattern
\`\`\`typescript
export const getProducts = async (req: Request, res: Response) => {
  // shopId is extracted from JWT token
  const products = await Product.find({ shopId: req.shopId });
  res.json({ data: products });
};
\`\`\`

## Database Models

### Shop
- name, businessType, email, phone, address
- settings: { enableInventory, enableGST, enableQRPayment, enableDiscounts, language }

### User
- username, email, passwordHash, role (Admin/Cashier)
- shopId (FK to Shop)
- Unique constraint: username + shopId

### Product
- name, price, stock, category, image, sku, description
- shopId (FK to Shop)
- Indexes: (shopId, name)

### Order
- items: array of {productId, name, price, quantity, weightInGrams}
- subtotal, discount, gst, finalTotal
- paymentMethod, shopId, createdBy
- Indexes: (shopId, createdAt), (shopId, paymentMethod)

## Security Features

✓ JWT-based authentication
✓ Password hashing with bcryptjs
✓ Role-based access control (Admin/Cashier)
✓ Multi-tenant data isolation
✓ CORS configuration
✓ Security headers (Helmet.js)
✓ Request validation
✓ Token expiry

## Deployment

### MongoDB Atlas
1. Create cluster
2. Add IP whitelist
3. Create database user
4. Get connection string

### Render (Node.js Hosting)
1. Push code to GitHub
2. Connect Render to GitHub repo
3. Add environment variables
4. Deploy

### Vercel (Alternative for Serverless)
Not recommended for this - use Render/Railway for full Node.js server

## Future Enhancements

- [ ] Email notifications
- [ ] SMS/WhatsApp integration
- [ ] Advanced analytics
- [ ] Inventory low-stock alerts
- [ ] Customer profiles
- [ ] Loyalty program
- [ ] Multi-currency support
- [ ] Advanced reporting (CSV/PDF export)
- [ ] Webhook support
- [ ] Rate limiting
