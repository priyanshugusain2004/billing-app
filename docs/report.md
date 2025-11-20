# Project Report: Gusain Billing App

Note: Apply formatting when exporting to DOCX/PDF — Times New Roman throughout, line spacing 1.5, A4 paper, margins: Left 1.25\", Right 1\", Top 0.75\", Bottom 0.75\". Chapters numbered in Arabic. Figures/tables numbered chapter-wise (e.g., Fig. 2.1, Table 3.1). Equations numbered chapter-wise (e.g., (3.1)). References listed in order of occurrence and cited using square brackets [1].

---

## Chapter 1 - Introduction

1.1 Company Introduction  
Gusain Billing App is a lightweight, offline-first billing and inventory solution targeted at small fruit and vegetable retailers. The project originates from the need for a simple, robust point-of-sale (POS) tool that requires minimal infrastructure, can operate on low-end hardware, and supports basic accounting and reconciliation.

1.2 Project Introduction  
This project implements a single-page web application (SPA) using React and Vite that allows shops to manage products, stock, discounts, invoices, and sales reports. It stores data locally with optional hooks for future cloud synchronization. The application supports role-based access (Admin, Cashier) and multilingual UI (English, Hindi).

1.3 Motivation  
Small retailers often lack affordable POS solutions that are offline-capable and easy to deploy. Existing systems may require subscriptions or complex setup. The motivation is to provide an open, simple, maintainable system that can be extended to support online payments, cloud backup, and analytics.

1.4 Objectives & Scope  
Objectives:
- Deliver a functioning billing and inventory web app with an intuitive UI.
- Enable invoice generation and printing.
- Provide sales reporting and basic analytics.
- Allow optional integration with online payment providers.

Scope:
- Frontend-heavy implementation, local persistence via localStorage.
- Basic admin features (site name, admin password, user selection).
- No built-in cloud auth or multi-tenant backend in initial delivery (planned future work).

1.5 Hardware & Software Requirements  
Hardware:
- Any modern workstation or laptop, 2+ GB RAM recommended for development; production clients can use low-end PCs or tablets.

Software:
- Node.js (v18+ recommended) and npm/yarn
- Development: Vite, React, TypeScript
- Browser: Chrome, Firefox, Edge (modern)
- Optional: Local printer support for invoice printing

1.6 Report Organization  
This report is organized into system analysis, design, project management, input/output design, testing and implementation, summary and future scope, references, and appendices.

---

## Chapter 2 - System Analysis & Requirements Specifications

2.1 Functional Requirements  
- FR1: Add, edit, delete products (with image, price, stock, category).  
- FR2: Create and finalize invoices; support discounts and tax calculation.  
- FR3: Role-based screens: Admin (inventory, settings, reports) and Cashier (billing).  
- FR4: Persist all data in browser localStorage; export/import for backup.  
- FR5: Generate printable invoices and export CSV for reports.  
- FR6: Optional: integrate online payments via providers (Stripe, Razorpay, PayPal).

2.2 Non-functional Requirements  
- NFR1: Application must be responsive and usable on tablets.  
- NFR2: Operations must be performant for up to thousands of product records locally.  
- NFR3: Data privacy: no data sent externally without explicit admin action.  
- NFR4: Offline capability: all core flows must work without internet.

2.3 System Context Diagram  
(Insert Fig. 2.1 — System Context Diagram)  
- Frontend SPA (React) interacts with localStorage and optional backend serverless endpoints for payments and backups.  
- External systems: Payment Provider, Printer, Admin’s browser, Optional Cloud DB.

2.4 Data Flow Diagrams (DFD)  
- Level 0 DFD: Show processes: Billing, Inventory Management, Reporting, Site Settings.  
- Level 1 DFD: Break down Billing process: Add item → calculate totals → select payment → persist invoice → print/send receipt.

2.5 Use Case Diagram  
(Insert Fig. 2.2 — Use Case Diagram showing actors Admin and Cashier with use cases: Manage Products, Process Sale, View Reports, Configure Store)

2.6 Sequence Diagrams  
- Sequence for "Finalize Sale": Cashier selects items → System computes totals → Cashier selects payment method → System persists invoice → System prints invoice / sends payment request (if online).  
(Insert Fig. 2.3 — Sequence Diagram for Finalize Sale)

2.7 System Chart / Component Diagram  
- Component boxes: UI Components, Local Persistence Layer, Payment Adapter, Reporting Module, Print Adapter, Localization Module.  
(Insert Fig. 2.4 — System Component Diagram)

2.8 Requirements Traceability Matrix (RTM)  
Table 2.1 maps FRs to implemented modules.

Table 2.1 — Requirements Traceability
| Req ID | Description | Module |
|---|---|---|
| FR1 | Product CRUD | Inventory Module |
| FR2 | Invoice creation | Billing Module |
| FR3 | RBAC | Auth/Setup Module |
| FR4 | Persistence | Persistence Layer |
| FR5 | Printing / Export | Print & Reports |
| FR6 | Online Payment | Payment Adapter |

---

## Chapter 3 - System Design

3.1 High-Level Architecture  
The application follows a modular frontend architecture:
- Router-based pages (Billing, Inventory, Reports, Login, Site Setup)
- Feature components grouped by domain
- Services: persistenceService, paymentService (adapter interface), exportService, reportService
- State management: React context and custom hooks

3.2 Entity-Relationship Diagram (ERD)  
(Insert Fig. 3.1 — ER Diagram)
Primary entities:
- Product { id, name, sku, category, price, cost, stock, image }
- User { id, name, role }
- Invoice { id, date, items[], subtotal, discount, tax, total, payment }
- InvoiceItem { productId, quantity, unitPrice, total }
- DiscountRule { id, minAmount, percent }

3.3 Detailed Data Models (JSON schema excerpts)
- Product (example)
```json
{
  "id": "uuid",
  "name": "Tomato",
  "sku": "TOM-001",
  "category": "Vegetables",
  "price": 25.0,
  "stock": 120,
  "image": "images/tomato.jpg"
}
```

3.4 Flow Charts & Algorithms
3.4.1 Billing Calculation Algorithm (pseudocode)
- Input: items[], discountRules, taxRate
- subtotal = sum(item.quantity * item.unitPrice)
- discount = computeDiscount(subtotal, discountRules)
- taxable = subtotal - discount
- tax = taxable * taxRate
- total = taxable + tax
- persistInvoice(invoice)

Equation (3.1) — Total calculation:
Subtotal = Σ (q_i × p_i)  
Discount = f(Subtotal)  
Tax = (Subtotal − Discount) × r  
Total = Subtotal − Discount + Tax  (3.1)

3.5 UI Design & Component Layout  
- Header: displays site name (user-provided) — centered title, left-justified chapter numbers for printed report visuals.  
- Billing Page: product search, category filter, cart panel, quick add.  
- Inventory Page: product list with inline edit, bulk upload via CSV.  
- Reports Page: KPI cards, recent transactions, charts (Recharts).  
(Insert Fig. 3.2 — Mockups / Wireframes)

3.6 Security Design  
- No storage of sensitive card data. Use provider-hosted checkout or tokenization.  
- Admin password stored hashed in localStorage (one-way). For cloud migration, use proper auth providers.

3.7 Extensibility Points  
- Payment Adapter interface (createPaymentIntent, verifyWebhook) to switch providers.  
- Persistence abstraction to swap localStorage for cloud DB (Firebase/Supabase).

---

## Chapter 4 - Project Management

4.1 Project Planning and Scheduling  
4.1.1 Project Development Approach & Justification  
Chosen approach: Agile iterative development with 2-week sprints. Justification: frequent feedback, ability to prioritize core billing flows early, rapid integration of payment provider sandbox.

4.1.2 Project Plan: Milestones, Deliverables, Roles
Milestones:
- M1: Foundations & Site Setup (1 week) — repo, basic pages
- M2: Billing Core (2 weeks) — cart, invoice generation, printing
- M3: Inventory Module (1 week) — CRUD, images
- M4: Reports & Export (1 week)
- M5: Payments Integration (2 weeks) — stubbed backend, provider test
- M6: Testing & Stabilization (2 weeks) — unit/integration/E2E
Deliverables:
- Working SPA, Documentation, Test suites, Deployment guide
Roles (small team example):
- Project Lead: Overall coordination
- Frontend Developer(s): UI & features
- QA/Tester: Test cases and manual testing
- DevOps: Build & deployment
Dependencies:
- Payment provider API keys, test webhooks, domain for webhook endpoints.

4.2 Risk Management  
4.2.1 Risk Identification
- R1: Payment provider integration issues (webhook verification, CORS)
- R2: Data loss due to localStorage overflow or corruption
- R3: UI/UX issues leading to cashier errors
- R4: Late requirement changes

4.2.2 Risk Analysis
- R1: Medium probability, high impact (prevents online payments)
- R2: Low probability, high impact (data loss)
- R3: Medium probability, medium impact
- R4: Medium probability, medium impact

4.2.3 Risk Planning (Mitigation)
- R1: Use provider sandbox; test webhooks with ngrok; implement idempotency keys.  
- R2: Offer export/import backup; warn admins about storage limits.  
- R3: Perform usability testing with sample cashiers; implement confirmation dialogs.  
- R4: Freeze scope for payment integration sprint; backlog new features.

4.3 Estimation
4.3.1 Cost Analysis (high-level)
- Personnel costs (example): 3 developers × 8 weeks × $X/hour = $Total  
- Breakdown (by activity): requirements & analysis (10%), design (15%), development (45%), testing (20%), deployment & docs (10%).  
- Hardware/software: negligible if using existing workstations; hosting costs for serverless backend if deployed (est. $5–$30/month depending on usage).  
Note: This is an illustrative estimate; project-specific salary rates and durations determine final cost.

---

## Chapter 5 - Input Design

5.1 General Principles  
Inputs are designed for quick cashier use: large touch targets, search-as-you-type, keyboard shortcuts, and validation feedback.

5.2 Input Screens / Forms (detailed)
5.2.1 Site Setup Form
- Fields: Shop Name, Admin Password, Default Currency, Tax Rate, Language
- Save action persists to siteSettings in localStorage.

5.2.2 Login / Role Selection
- Cashier selects user from list; admin requires password.

5.2.3 Product Add/Edit Form
- Fields:
  - Name (required)
  - SKU (optional)
  - Category (dropdown)
  - Unit Price (required, numeric)
  - Cost Price (optional)
  - Stock Quantity (number)
  - Image upload (optional)
  - Discount tag (optional)
- Validation: numeric fields enforce numeric input; image maximum size check.

5.2.4 Billing Input Panel
- Product search box (autocomplete)
- Quantity selector (default 1)
- Discount input (per-item or order-level)
- Payment method selection (Cash, Online — provider names)
- Payment details: for cash, tendered amount; for online, placeholder to start checkout

5.2.5 Reports Filter
- Date range, product/category filters, user filter, payment method filter

(Insert Fig. 5.1 — Screenshot mockups for input forms)

---

## Chapter 6 - Output Design

6.1 Invoice & Receipt Design  
- Printable invoice header: Shop name, address placeholder, invoice number, date/time, cashier name.  
- Line items with columns: S.No, Product, Qty, Unit Price, Discount, Line Total.  
- Summary block: Subtotal, Discount, Tax, Total, Amount Tendered, Change Due, Payment Method, Transaction ID (if online).  
- Footer: Thank you note and return policy.

Fig. 6.1 — Sample Invoice (placeholder)

6.2 Reports and Dashboards  
6.2.1 Daily/Monthly Sales Summary
- KPIs: Total Sales, Number of Transactions, Average Ticket Size, Cash vs Online totals.

6.2.2 Charts
- Sales by day (bar chart), Sales by category (pie chart), Top-selling products (table).

6.2.3 Export Options
- CSV export of transactions, PDF of selected report, print-friendly layout.

Table 6.1 — Sample Sales Summary

| Date | Transactions | Total Sales (INR) | Cash | Online |
|---|---:|---:|---:|---:|
| 2025-10-01 | 45 | 12,450.00 | 9,500.00 | 2,950.00 |

6.3 Logs & Audit Outputs  
- Admin can view recent admin actions (site name changes, product deletes) with timestamps.

---

## Chapter 7 - System Testing, Implementation & Maintenance

7.1 Testing Strategy  
7.1.1 Unit Testing
- Test billing calculations, discount rules, persistence read/write.

7.1.2 Integration Testing
- Test flows: Product add → invoice creation → print/export; mock payment provider interactions.

7.1.3 End-to-End (E2E)
- Use Cypress or Playwright to simulate cashier flows, offline scenarios, print previews.

7.1.4 Performance Testing
- Simulate thousands of products to test list rendering and search latency.

7.1.5 Security Testing
- Validate that no sensitive payment data is stored; test webhook verification.

7.2 Test Cases (examples)
TC-01: Add new product with valid inputs → Expect product appears in inventory list.  
TC-02: Create invoice with multiple items and a tiered discount → Validate totals and saved invoice.  
TC-03: Simulate online payment success webhook → Invoice marked Paid; reports reflect online total.

7.3 Implementation Plan (Deployment)
- Step 1: Build static site (vite build).  
- Step 2: Host on static host (Netlify / Vercel / GitHub Pages) for frontend.  
- Step 3: Optional serverless endpoints for payments on Vercel/Netlify functions.  
- Step 4: Setup environment variables: PAYMENT_PROVIDER, PAYMENT_API_KEY, PAYMENT_WEBHOOK_SECRET, GEMINI_API_KEY (if applicable).

7.4 Maintenance Plan  
- Regular backups: instruct admin to export data monthly.  
- Update dependencies quarterly; monitor security advisories.  
- Provide issue tracker for bug reports and feature requests.

---

## Chapter 8 - Summary and Future Scope

8.1 Summary  
The Gusain Billing App delivers a pragmatic, offline-capable billing and inventory solution suitable for small retailers. The modular architecture eases extension toward payments, cloud sync, and analytics.

8.2 Future Scope (detailed)
- Full cloud sync with per-user authentication (Firebase / Supabase).  
- Multi-store and multi-device support with device authorization.  
- Payment provider integrations: Stripe (cards, UPI via integration), Razorpay (India-first), PayPal.  
- Service worker and queued sync for offline-to-online transaction reconciliation.  
- POS hardware support: barcode scanner input, thermal printer direct integration.  
- Loyalty/CRM features and advanced reporting exports.

---

## References

[1] React Documentation, “React — A JavaScript library for building user interfaces,” https://reactjs.org (accessed 2025).  
[2] Vite Documentation, “Vite — Next Generation Frontend Tooling,” https://vitejs.dev (accessed 2025).  
[3] Stripe Docs, “Stripe Integration Guide,” https://stripe.com/docs (accessed 2025).  
[4] Razorpay Docs, “Razorpay Integration,” https://razorpay.com/docs (accessed 2025).  
[5] Recharts Documentation, “Recharts — Chart library for React,” https://recharts.org (accessed 2025).  
[6] MDN Web Docs, “Web Storage API — localStorage,” https://developer.mozilla.org (accessed 2025).

References are numbered in order of initial citation within the text.

---

## Appendices

### Appendix A — Glossary
- POS: Point of Sale  
- SKU: Stock Keeping Unit  
- API: Application Programming Interface  
- PWA: Progressive Web App

### Appendix B — Sample Invoice JSON
```json
{
  "id": "INV-20251120-0001",
  "date": "2025-11-20T10:35:00Z",
  "cashier": "Cashier A",
  "items": [
    { "productId": "p-001", "name": "Tomato", "qty": 2, "unitPrice": 25.0, "total": 50.0 },
    { "productId": "p-002", "name": "Potato", "qty": 1, "unitPrice": 30.0, "total": 30.0 }
  ],
  "subtotal": 80.0,
  "discount": 8.0,
  "tax": 7.2,
  "total": 79.2,
  "payment": { "method": "Cash", "status": "Paid" }
}
```

### Appendix C — Sample ERD & Diagram File Paths
- docs/images/erd.png (ER Diagram)  
- docs/images/dfd-level0.png (DFD Level 0)  
- docs/images/sequence-finalize-sale.png (Sequence Diagram)

### Appendix D — Example Test Cases (detailed)
- TC-101: Verify discount tier application when subtotal >= threshold.  
- TC-102: Ensure invoice numbering increments and is unique.  
- TC-103: Offline persistence: complete a sale with network offline; data saved and not lost after reload.

### Appendix E — Deployment Checklist
1. Ensure Node version compatibility.  
2. Build: `npm run build`  
3. Verify `dist/` contains locales (postbuild step copies locales).  
4. Configure payment webhook endpoint and environment variables.  
5. Publish to static host and test on target devices.

---

End of report.
