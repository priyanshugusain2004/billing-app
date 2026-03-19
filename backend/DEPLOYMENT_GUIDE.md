# Complete Deployment Guide - SaaS Billing App

## Architecture Overview

```
┌─────────────────────────────────────────────────────┐
│                   Frontend (Vercel)                 │
│         React + Vite + TypeScript + Tailwind       │
│           https://yourapp.vercel.app               │
└────────────────────┬────────────────────────────────┘
                     │ HTTPS API calls
                     ▼
┌─────────────────────────────────────────────────────┐
│                    Backend (Render)                 │
│         Node.js + Express + TypeScript             │
│            https://api.yourdomain.com              │
└────────────────────┬────────────────────────────────┘
                     │ Mongoose queries
                     ▼
┌─────────────────────────────────────────────────────┐
│              Database (MongoDB Atlas)               │
│         Cloud MongoDB with automatic backups        │
└─────────────────────────────────────────────────────┘
```

## Part 1: Database Setup (MongoDB Atlas)

### Step 1: Create MongoDB Atlas Account
1. Go to https://www.mongodb.com/cloud/atlas
2. Sign up with email
3. Create organization and project

### Step 2: Create Cluster
1. Click "Create Deployment"
2. Select "M0 Sandbox" (free tier)
3. Choose region: "Mumbai" (or closest to you)
4. Click "Create Deployment"
5. Wait 1-2 minutes for cluster to be ready

### Step 3: Create Database User
1. Go to "Database Access" → "Add New Database User"
2. Set username: `billing_app_user`
3. Set password: Generate secure password (save it)
4. Select "Atlas Admin" role
5. Click "Add User"

### Step 4: Configure IP Whitelist
1. Go to "Network Access"
2. Click "Add IP Address"
3. Select "Allow access from anywhere" (for development)
4. In production, use specific IPs only
5. Click "Confirm"

### Step 5: Get Connection String
1. Click "Database" → "Connect"
2. Select "Drivers" → "Node.js"
3. Copy connection string:
   ```
   mongodb+srv://billing_app_user:PASSWORD@cluster.mongodb.net/billing-app?retryWrites=true&w=majority
   ```
4. Replace `PASSWORD` with the password you set

## Part 2: Backend Deployment (Render)

### Step 1: Push Backend to GitHub
```bash
cd /path/to/billing-app-backend

git init
git add .
git commit -m "Initial backend setup"

# Create GitHub repo first, then:
git remote add origin https://github.com/YOUR_USERNAME/billing-app-backend.git
git branch -M main
git push -u origin main
```

### Step 2: Deploy to Render
1. Go to https://render.com
2. Sign up with GitHub
3. Click "New +" → "Web Service"
4. Connect to your `billing-app-backend` repo
5. Configure deployment:

   **Name:** `billing-app-backend`
   
   **Environment:** Node
   
   **Region:** Singapore or Mumbai (closest to users)
   
   **Build Command:** 
   ```
   npm install && npm run build
   ```
   
   **Start Command:** 
   ```
   npm run start
   ```

### Step 3: Add Environment Variables
Click "Environment" and add:

```
PORT=5000
NODE_ENV=production
MONGO_URI=mongodb+srv://billing_app_user:YOUR_PASSWORD@cluster.mongodb.net/billing-app?retryWrites=true&w=majority
JWT_SECRET=your_very_secure_random_key_min_32_chars
JWT_EXPIRY=7d
FRONTEND_URL=https://your-frontend-domain.vercel.app
```

**Important:** Generate a strong JWT_SECRET:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Step 4: Deploy
1. Click "Create Web Service"
2. Wait for deployment (2-3 minutes)
3. Get your backend URL: `https://billing-app-backend-xxxx.onrender.com`

### Step 5: Test Backend
```bash
curl https://billing-app-backend-xxxx.onrender.com/health
# Expected: { "status": "OK", "timestamp": "..." }
```

## Part 3: Frontend Deployment (Vercel)

### Step 1: Push Frontend to GitHub
```bash
cd /path/to/billing-app

git add .
git commit -m "Integrate with SaaS backend"

# Create GitHub repo first, then:
git remote add origin https://github.com/YOUR_USERNAME/billing-app.git
git branch -M main
git push -u origin main
```

### Step 2: Deploy to Vercel
1. Go to https://vercel.com
2. Sign in with GitHub
3. Click "New Project"
4. Select your `billing-app` repo
5. Select "React" as framework

### Step 3: Configure Build Settings
- **Framework Preset:** Vite
- **Build Command:** `npm run build`
- **Output Directory:** `dist`

### Step 4: Add Environment Variables
Click "Environment Variables" and add:

```
VITE_API_URL=https://billing-app-backend-xxxx.onrender.com/api
```

Replace with your actual Render backend URL.

### Step 5: Deploy
Click "Deploy" and wait (1-2 minutes)

Get your frontend URL: `https://your-app.vercel.app`

## Part 4: Update Configurations

### Backend CORS Configuration
Update environment variables on Render:
```
FRONTEND_URL=https://your-app.vercel.app
```

This ensures your frontend can make API calls without CORS issues.

### Frontend API URL
```
VITE_API_URL=https://billing-app-backend-xxxx.onrender.com/api
```

## Part 5: Verify Deployment

### Test Login/Signup Flow
1. Open: https://your-app.vercel.app
2. Click "Create Shop"
3. Fill form and submit
4. You should see:
   - Shop created in MongoDB Atlas
   - JWT token returned
   - Redirected to billing page

### Test API Endpoints
```bash
# Test signup
curl -X POST https://billing-app-backend-xxxx.onrender.com/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "shopName": "Test Shop",
    "businessType": "fruit-shop",
    "email": "test@example.com",
    "phone": "9876543210",
    "username": "testadmin",
    "password": "TestPass123"
  }'

# Response should include token

# Test products (with token)
curl https://billing-app-backend-xxxx.onrender.com/api/products \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Monitor Logs
**Backend (Render):**
- Go to your service → "Logs" tab
- See real-time logs

**Database (MongoDB Atlas):**
- Go to "Clusters" → "Browse Collections"
- Verify data is being stored

## Part 6: Custom Domain Setup (Optional)

### Add Custom Domain on Vercel
1. Frontend repo → "Settings" → "Domains"
2. Add your domain (e.g., `billing.yourdomain.com`)
3. Update DNS records (Vercel will show you how)

### Add Custom Domain on Render
1. Backend service → "Settings" → "Custom Domain"
2. Add domain (e.g., `api.yourdomain.com`)
3. Update DNS records

## Part 7: Monitoring & Maintenance

### Database Backups (MongoDB Atlas)
- Automatic daily backups (free tier)
- Backup retention: 7 days
- Create manual backup before major changes

### Monitor Backend Performance
1. Render → Service → "Metrics"
2. Watch CPU, Memory, Network

### Monitor Errors
1. Render logs for 500 errors
2. MongoDB Atlas Alerts
3. Set up email notifications

### Database Updates
```bash
# Connect to production DB
mongosh "mongodb+srv://user:pass@cluster.mongodb.net/billing-app"

# View collections
show collections

# Check data
db.shops.find().pretty()
db.orders.find().limit(5)
```

## Part 8: Cost Breakdown (Current)

| Service | Tier | Cost |
|---------|------|------|
| MongoDB Atlas | M0 Sandbox | **Free** |
| Render | Free Tier | **Free** (includes 0.5 CPU hours/month) |
| Vercel | Hobby | **Free** |
| **Total** | | **$0/month** |

**Note:** Free tiers have limitations:
- Render: Services spin down after 15 min inactivity
- MongoDB Atlas: 512 MB storage
- Vercel: 100 GB bandwidth/month

### Upgrade Paths
- **Small shop (500 orders/month):** ~$10/month
- **Medium shop (5000 orders/month):** ~$30/month
- **Large shop (50000 orders/month):** ~$100/month

## Part 9: Post-Deployment Checklist

- [ ] Backend deployed to Render
- [ ] Frontend deployed to Vercel
- [ ] MongoDB Atlas cluster created
- [ ] Environment variables set
- [ ] CORS configured
- [ ] Login/Signup tested
- [ ] Products CRUD tested
- [ ] Order creation tested
- [ ] Payments function tested
- [ ] Reports loading correctly
- [ ] Mobile responsive verified
- [ ] Custom domain configured (optional)
- [ ] Backups configured
- [ ] Error monitoring setup

## Part 10: Troubleshooting Deployment

### Backend returns 500 error
1. Check Render logs
2. Verify MONGO_URI is correct
3. Verify JWT_SECRET is set
4. Check MongoDB user credentials

### Frontend shows "Failed to fetch"
1. Check VITE_API_URL is correct
2. Verify backend is running
3. Check CORS configuration
4. Open DevTools → Network tab

### CORS Error
```
Access to XMLHttpRequest blocked by CORS policy
```
Solution:
1. On Render, update `FRONTEND_URL` env var
2. Restart backend
3. Clear browser cache (Ctrl+Shift+Del)

### Database connection timeout
1. Check MongoDB Atlas IP whitelist
2. Verify connection string
3. Check account hasn't exceeded free tier limits

### Vercel build fails
```bash
# Test locally first
npm run build

# Check for build errors in code
npm run dev
```

## Part 11: Performance Optimization

### Backend Optimization
1. Add caching for frequently accessed data
2. Implement pagination (already done ✓)
3. Add database indexes (already done ✓)
4. Use connection pooling

### Frontend Optimization
1. Enable Gzip compression (Vercel default)
2. Use image optimization
3. Lazy load components
4. Code splitting with React.lazy

### Database Optimization
1. Monitor slow queries in MongoDB Atlas
2. Add indexes on frequently filtered fields
3. Archive old orders to separate collection
4. Use aggregation pipeline for reports

## Part 12: Scaling Strategy

### Phase 1: MVP (Current)
- Single MongoDB cluster
- Backend on free/hobby tier
- Max ~50 shops, 5000 orders/month

### Phase 2: Growth
- Upgrade MongoDB to M10 ($96/month)
- Use Render Web Service (paid)
- Add Redis for caching
- Implement worker jobs for reports

### Phase 3: Enterprise
- MongoDB sharded cluster
- Load balancer
- Multiple backend instances
- CDN for static assets
- Email service integration

## Part 13: Security Hardening

Before going live:

- [ ] Change JWT_SECRET to strong random string
- [ ] Use HTTPS everywhere (automatic on Vercel/Render)
- [ ] Set MongoDB IP whitelist to specific IPs
- [ ] Add rate limiting middleware
- [ ] Implement CSRF protection
- [ ] Add request validation
- [ ] Set secure CORS origin
- [ ] Enable MongoDB encryption at rest
- [ ] Use environment variables for all secrets
- [ ] Implement audit logging

## Part 14: Maintenance Plan

### Weekly
- Monitor logs for errors
- Check database size

### Monthly
- Review monthly costs
- Update dependencies
- Create manual backup

### Quarterly
- Security audit
- Performance review
- Plan scaling if needed

### Yearly
- Major version updates
- Architecture review
- Disaster recovery test

---

## Quick Reference: URLs After Deployment

| Service | URL |
|---------|-----|
| Frontend | https://your-app.vercel.app |
| Backend API | https://billing-app-backend-xxxx.onrender.com/api |
| MongoDB Atlas | https://cloud.mongodb.com |
| Render Dashboard | https://dashboard.render.com |
| Vercel Dashboard | https://vercel.com/dashboard |

---

## Support & Resources

- **Render Docs:** https://render.com/docs
- **Vercel Docs:** https://vercel.com/docs
- **MongoDB Docs:** https://docs.mongodb.com
- **Express Docs:** https://expressjs.com
- **React Docs:** https://react.dev
