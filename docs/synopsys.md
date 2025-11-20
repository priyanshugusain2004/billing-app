Synopsis: Gusain Billing App

Formatting Instructions (apply in your editor/word processor before printing):
- Paper: A4 (210 × 297 mm)
- Print: Single-sided only
- Line spacing: 1.5
- Font: Times New Roman throughout
- Margins: Left – 1.25″, Right – 1″, Top – 0.75″, Bottom – 0.75″
- Chapter numbers: left-justified, Times New Roman, 16 pt, Bold
- Chapter titles: centered, Times New Roman, 18 pt, Bold
- Section headings: left-justified, Times New Roman, 14 pt, Bold
- Subsection headings: left-justified, Times New Roman, 12 pt, Bold
- Body text: Times New Roman, 12 pt, justified
- Figures/Tables captions: chapter-wise numbering (e.g., Fig. 2.1), Times New Roman, 10 pt, Bold
- Equations: numbered chapter-wise in decimal form (e.g., (3.2))
- References: numbered in order of occurrence and cited in text using square brackets [1]

---

Chapter 1  Introduction

1.1 Company Introduction
Gusain Billing App is a lightweight, easy-to-deploy billing and inventory management system designed specifically for small fruit and vegetable retailers. It provides a simple point-of-sale (POS) interface, local data persistence for offline operation, and essential reporting features required by shop owners.

1.2 Project Introduction
This project implements a client-side web application using React and Vite. The app includes user roles (Admin and Cashier), product and inventory management, cart and billing workflows, printable invoice generation, sales reporting, and hooks for optional online payment integration and cloud sync.

1.3 Motivation
Small retailers face affordability and reliability constraints with existing POS solutions. A lightweight, offline-capable system reduces dependency on continuous internet access, lowers costs, and enables fast adoption.

1.4 Objectives & Scope
Objectives:
- Provide a reliable offline-first POS web app with product management and invoicing.
- Offer role-based access and a simple admin UI for store settings.
- Allow printable invoices and sales export for accounting.
- Prepare the architecture for optional online payments and cloud backup.

Scope:
- Frontend-first implementation using browser localStorage for persistence.
- Admin features for setting shop name and basic user password handling.
- No initial cloud-hosted database or multi-tenant backend (future work).

1.5 Hardware & Software Requirements
Hardware: Any modern laptop/desktop or tablet; low-end devices supported for cashier operations.
Software: Node.js (for development), modern web browser, Vite and React for development; no server required for core flows.


Chapter 2  System Analysis & Requirements

2.1 Functional Requirements (summary)
- Product management (add/edit/delete) with image, price, stock and category.
- Billing: add items to cart, apply discounts, compute tax, finalize invoices, print/save PDF.
- User roles: Admin and Cashier with role-based access to inventory and reports.
- Reporting: daily/monthly KPIs, charts, recent transactions.
- Data: persisted locally (localStorage); export/import for backup.
- Optional: integrate online payments and reconciliation.

2.2 Non-functional Requirements
- Usability: fast, responsive UI suitable for touch and keyboard use.
- Reliability: core flows must work offline.
- Performance: handle thousands of product records with acceptable search/filter latency.

2.3 Use Cases (key)
- UC1: Admin sets up shop name and admin password.
- UC2: Cashier logs in, creates invoice, completes sale (cash/online).
- UC3: Admin manages inventory and configures discount tiers.
- UC4: Admin views reports and clears sales data.


Chapter 3  System Design (summary)

3.1 Architecture Overview
- Single-page application (React) with routes for Billing, Inventory, Reports, Login and Site Setup.
- Local persistence layer using localStorage with a simple abstraction.
- Payment adapter to allow switching between online providers (Stripe, Razorpay, PayPal) or QR-based UPI.

3.2 Data Entities (brief)
- Product(id, name, category, price, stock, image)
- User(id, name, role, password)
- Invoice(id, date, items[], subtotal, discount, tax, total, payment)
- DiscountRule(id, threshold, percent)

3.3 Billing Calculation (equations)
Subtotal = Σ (quantity_i × price_i)
Discount = f(Subtotal) (tiered)
Tax = (Subtotal − Discount) × tax_rate
Total = Subtotal − Discount + Tax  (number as (3.1) in reports)


Chapter 4  Project Management (summary)

4.1 Development Approach
Agile iterative with short sprints (1–2 weeks) to deliver core billing features first and payments integration later.

4.2 Milestones (example)
- M1: Basic UI & Site Setup
- M2: Billing core & invoice printing
- M3: Inventory and product CRUD
- M4: Reporting, export and backups
- M5: Payment integration (sandbox)
- M6: Testing and deployment

4.3 Risk Management
- Payment integration issues: mitigate by using sandbox keys and local webhook testing (ngrok).
- Data loss risk: mitigate by export/import backup and warnings about localStorage size.


Chapter 5  Implementation Notes

5.1 Inputs
- Site Setup form: Shop name, admin password, tax rate, default currency, language.
- Product form: name, price, stock (grams), category, image upload.
- Billing panel: product search, weight input (grams), quantity, apply discount.

5.2 Outputs
- Printable invoice with shop header, itemized list, totals and payment metadata.
- Reports: CSV export, charts for daily/weekly/monthly sales.


Chapter 6  Online Payment (design & flow)

6.1 Provider Options & Recommendation
- Providers: Stripe (global), Razorpay (India), PayPal (global), or direct UPI/QR.
- Recommendation: For India-first deployments use Razorpay (UPI/QR support). For broader/global use, Stripe provides robust SDKs and hosted checkout.

6.2 Integration Flow (minimal safe pattern)
1. Frontend requests payment intent/order from a small backend endpoint (/api/create-payment) supplying invoice id and amount.
2. Backend calls provider API using server-side secret and returns client token/checkout URL/QR data.
3. Frontend shows provider-hosted checkout or QR to customer. For hosted checkout, redirect or open modal.
4. Provider sends webhook to backend on payment success/failure. Backend verifies signature, updates invoice status. Frontend polls or fetches updated invoice status.

6.3 UX & Reconciliation
- Show `Pending` state for online payments until webhook confirms.
- Support split payments (cash + online) and refunds (store refund record, call provider refund API).
- Reconciliation screen to match provider settlements with recorded transactions.

6.4 Security
- Do not store raw card data. Use provider tokenization / hosted checkout.
- Keep API keys in environment variables (`PAYMENT_API_KEY`, `PAYMENT_WEBHOOK_SECRET`).


Chapter 7  Testing & Deployment

7.1 Test Types
- Unit tests for calculations and business logic.
- Integration tests for flows that interact with provider mocks.
- E2E tests simulating cashier flows with Playwright or Cypress.

7.2 Deployment Steps
- Build: `npm run build` (postbuild copies `locales` to `dist/`).
- Host static front-end on Netlify/Vercel/GitHub Pages.
- If using serverless payment endpoints, deploy functions on Vercel or Netlify and configure webhook URL.


Chapter 8  Conclusion & Future Work

8.1 Summary
Gusain Billing App provides a focused, offline-first POS experience for small retailers with clear upgrade paths for payments and cloud sync.

8.2 Future Enhancements
- Cloud sync & authentication (Firebase/Supabase).
- Service worker + background sync for queued payments.
- Loyalty program, tax rules, multi-currency support, hardware integration (barcode/thermal printer).


References
[1] React Documentation — https://reactjs.org
[2] Vite Documentation — https://vitejs.dev
[3] Stripe Docs — https://stripe.com/docs
[4] Razorpay Docs — https://razorpay.com/docs


Checklist for printing
- Single-sided A4, Times New Roman, 1.5 line spacing, margins: Left 1.25\", Right 1\", Top/Bottom 0.75\".
- Verify chapter numbering, figure/table numbering (chapter-wise), and equation numbering before final print.

---

End of synopsis
