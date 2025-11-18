

# Billing App

A modern billing and inventory management app for fruit and vegetable shops, built with React, Vite, and Tailwind CSS.

---

## Use Case
- Designed for small retail shops to manage billing, inventory, and sales reporting.
- Supports multi-user login (Admin, Cashier) with role-based access.
- Tracks products, stock, discounts, and sales.
- Generates invoices and sales reports.
- Can be used offline (localStorage) or prepared for future cloud sync.

---

## Features
- **Site Name Setup:** Set your shop name and admin password before login. Editable from admin panel.
- **User Authentication:** Select user and login (admin password required for admin).
- **Role-Based Access:** Admins can manage inventory, users, discounts, and reports. Cashiers can bill and sell.
- **Product Management:** Add, edit, delete products with images, price, stock, and category.
- **Cart & Billing:** Add products to cart, apply discounts, finalize sales, and generate invoices.
- **Sales Reporting:** View key metrics, sales charts, and recent transactions.
- **Discount Tiers:** Set automatic discounts based on subtotal.
- **QR Code Payment:** Admins can set a QR code for online payments.
- **Multi-language Support:** English and Hindi UI.
- **Local Data Persistence:** All data is saved in browser localStorage for offline use.
- **Clear Sales Data:** Admins can clear sales history from the reports page.

---

## Problems Faced
- **localStorage Limitations:** Data is not shared across devices or browsers; only works per device.
- **Password Sync:** Ensuring admin password is always updated and checked correctly.
- **Translation Loading:** Making sure translation files are included in production builds.
- **UI Consistency:** Keeping site name and branding updated everywhere in the app.
- **No Cloud Sync:** Users cannot access their data from multiple devices yet.

---

## Future Goals
- **Subscription-Based SaaS:** Move to cloud database (Firebase/Supabase) for multi-device sync and per-user subscriptions.
- **Authentication:** Add email/password login and user registration.
- **Feature Limiting:** Restrict features and storage based on user plan.
- **Payment Integration:** Add Stripe/Razorpay for paid plans.
- **Device Management:** Support single-device and multi-device plans.
- **Admin Panel:** Centralized settings for shop name, password, and subscription management.
- **Data Export/Import:** Allow users to backup and restore their data.
- **Advanced Reporting:** More analytics, export to CSV/PDF.

---

## How to Run Locally

**Prerequisites:** Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`
4. Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## License
MIT
