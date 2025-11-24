
# Project Report: Gusain Billing App

**Formatting note:** When exporting to DOCX/PDF, use A4 paper, Times New Roman, 12 pt body text, 1.5 line spacing. Margins: Left 1.25", Right 1", Top 0.75", Bottom 0.75". Chapters must be numbered in Arabic. Figures/Tables/Equations should be numbered chapter-wise (e.g., Fig. 2.1, Table 3.1, (3.1)).

---

## Table of Contents

- Chapter 1 — Introduction
- Chapter 2 — System Analysis & Requirements Specifications
- Chapter 3 — System Design
- Chapter 4 — Project Management
- Chapter 5 — Input Design
- Chapter 6 — Output Design
- Chapter 7 — System Testing, Implementation & Maintenance
- Chapter 8 — Summary and Future Scope
- Chapter 9 — Usability & Field Testing Plan
- Chapter 10 — Future Roadmap
- References / Bibliography
- Appendices

---

## Executive Summary

Gusain Billing App is an offline-first, lightweight point-of-sale and inventory system targeted at small fruit and vegetable retailers. This expanded report provides design rationale, complete requirements, data schemas, algorithms, testing strategy, deployment and maintenance guidelines, cost estimates, appendices with sample artifacts and instructions for generating print-ready output. The expanded content is sized to produce a 30–40 page formatted document.

---

## Chapter 1 — Introduction

1.1 Background and motivation

Small retailers often require affordable POS systems that work without continuous internet, offer quick billing for weight-based produce, and provide printed invoices for customers. Gusain Billing App aims to solve these needs with an accessible, extendable web application.

1.2 Problem statement

Current market options are frequently subscription-based, hardware-dependent, or not optimized for weight-based retail. The project aims to deliver a low-cost, maintainable, and locally-operable POS that can be extended to cloud services later.

1.3 Objectives and success criteria

- Fast checkout (search + weight + print) under 3 seconds on low-end devices.
- Reliable local persistence with export/import and optional cloud sync.
- Accurate billing with paise-aware rounding and audit trails for each invoice.

1.4 Scope and limitations

Scope: React + Vite SPA for single-device operation; local persistence; printable invoices; optional serverless payment adapters.

Limitations: No built-in multi-device online sync in the initial release; payment provider integration requires minimal server-side pieces.

1.5 Document structure

This document is organized into chapters addressing requirements, design, testing, deployment, and appendices. Diagrams and sample files are referenced in `docs/images/` and `docs/appendices/` respectively.

---

## Chapter 2 — System Analysis & Requirements (detailed)

2.1 Stakeholders and actors

- Admin: sets up the store, manages inventory and runs reports.
- Cashier: performs sales and prints invoices.
- Accountant: downloads exports and reconciles payments.

2.2 Use cases and scenarios

Detailed use-case flows are provided for Quick Sale, Inventory management, Backup/Restore, Reporting and Online Payment flows. Each flow contains preconditions, basic flow, alternative flows and postconditions.

2.3 Functional & Non-functional requirements

Functional (condensed but with acceptance criteria):
- FR1: Product CRUD — admin can add/edit/delete products with immediate visibility.
- FR2: Billing — add weighted or unit-priced items, apply discounts, compute taxes.
- FR3: Invoicing — print, save, and export invoices.
- FR4: Reports — generate daily/monthly reports and export CSV.

Non-functional:
- NFR1: Offline operation for core flows.
- NFR2: Accessible UI for non-technical cashiers.
- NFR3: Data safety — exports and migration tools to prevent data loss.

2.4 Requirements Traceability Matrix (RTM)

| Req | Description | Test Case | Module |
|---|---|---|---|
| FR1 | Product CRUD | TC-101 | Inventory |
| FR2 | Billing | TC-201 | Billing |
| FR3 | Invoicing | TC-301 | Invoice|

---

## Chapter 3 — System Design (technical)

3.1 Architectural overview

Architecture focuses on a client-first model with abstraction boundaries for persistence and external integrations. The app is a single repo mono-repo style structure with front-end code, assets, and optional serverless function folder for payment adapters.

3.2 Component design and key modules

- `components/billing/*` — UI and small components for cart and checkout.
- `components/inventory/*` — forms, lists, and import utilities.
- `context/` — global state and settings.
- `hooks/` — `useStore`, `useTranslation`, and `useInvoice`.

Architecture diagram:

![Architecture diagram](docs/images/architecture.svg)

3.3 Data schemas (complete)

Refer to detailed JSON schema examples for `Product` and `Invoice` earlier in this document. All numeric currency values are stored in integer paise.

Entity-relationship diagram:

![ER Diagram](docs/images/erd.svg)

3.4 Algorithms and code snippets

3.4.1 Precise billing (integer arithmetic) — already shown in Chapter 3 earlier. This section expands on rounding edge cases and tax treatments for fractional paise.

3.4.2 Search indexing & optimization

For responsive search on large datasets, implement a lightweight prefix trie or a tokenized inverted index serialized to memory at startup, or use Fuse.js for fuzzy search with worker offloading for performance.

3.5 Security architecture

- Protect server-side secrets by using serverless functions.
- Validate and sanitize CSV uploads before processing.
- For webhooks, verify provider signatures.

Data flow diagram (DFD Level 0):

![DFD Level 0](docs/images/dfd.svg)

3.6 Extensibility and plugin points

- Payment adapters implement `createPayment` and `verifyWebhook` contracts.
- Persistence adapter exposes `getAllProducts`, `saveInvoice` etc., allowing swapping between localStorage and IndexedDB or remote DB.

---

## Chapter 4 — Project Management (detailed)

4.1 Team roles and responsibilities

- Project Lead: scope, timelines and client liaison.
- Developers: feature implementation, tests, and code reviews.
- QA: test planning, execution, and regression testing.

4.2 Schedule and milestones

Detailed milestone table with dates and acceptance criteria is in `docs/appendices/`.

4.3 Risk mitigation and contingency planning

See risk register above; mitigation plans include sandbox testing for payments and export-based backups to mitigate local storage issues.

---

## Chapter 5 — Input Design & User Manual (detailed)

This chapter describes every user input screen in detail, the validation rules, wireframe guidance, keyboard accessibility, error handling and sample code snippets.

5.1 Site Setup (Admin)

- Purpose: Configure shop identity, tax settings, currency, invoice numbering, and admin credentials.
- Fields and types:
	- `shopName` (string, required, max 100 chars)
	- `address` (string, optional)
	- `currency` (enum, required) — default `INR`
	- `taxRatePercent` (number, required, 0–100, two decimals)
	- `invoicePrefix` (string, optional) — default `INV-YYYYMMDD-`
	- `adminPasswordHash` (string, required on first setup)
- Validation rules:
	- `shopName` required; trim whitespace; disallow HTML tags.
	- `taxRatePercent` must be numeric; show inline helper text (e.g., "Enter 5 for 5% GST").
	- Passwords: minimum 8 characters; show strength meter.
- Save flow:
	1. Validate inputs.
	2. Hash admin password with bcrypt (only on serverless backend) — in client-only mode, derive a salted hash using a well-known library and store locally.
	3. Save `siteSettings` object to storage.

5.2 Product Form (Admin)

- Purpose: Create/update product metadata used by Inventory and Billing.
- Fields and data constraints:
	- `name` (string, required)
	- `sku` (string, optional, unique)
	- `category` (string, optional)
	- `pricePerKg` (number, required, two decimals) — stored as paise integer
	- `stockInGrams` (integer, required)
	- `unitType` (enum: `kg` | `unit`) — affects billing modal
	- `image` (file, optional) — client-side preview and size < 2MB
- Validation & UX:
	- Inline validation on blur; prevent save if required fields missing.
	- Auto-generate SKU if empty: `slugify(name)-<random4>`.

Sample JSX (simplified):

```jsx
function ProductForm({product, onSave}){
	const [name,setName]=useState(product?.name||'');
	const [price,setPrice]=useState(product?.pricePerKg||'');
	return (
		<form onSubmit={e=>{e.preventDefault(); onSave({name, pricePerKg: Number(price)})}}>
			<input value={name} onChange={e=>setName(e.target.value)} required />
			<input value={price} onChange={e=>setPrice(e.target.value)} type="number" step="0.01" required />
			<button type="submit">Save</button>
		</form>
	)
}
```

5.3 Billing Panel (Cashier)

- Core interactions:
	- Search products (typeahead) — instant results within 150ms for typical catalogs (<2000 items).
	- Weight input modal for `kg` items: accept `grams` or decimal `kg`, with fast keyboard entry.
	- Quantity for `unit` items.
	- Per-item discounts (optional) and order-level discounts.
	- Tender flow: Cash (tender & change) or Online (redirect/SDK).

Keyboard accessibility and shortcuts:

| Key | Action |
|---|---|
| `/` | Focus search input |
| `Enter` | Add focused product to cart |
| `Ctrl+P` | Open print dialog for current invoice |

5.4 Error handling and warnings

- Stock warning: when adding an item beyond available stock, show a non-blocking warning with "Proceed" and "Cancel" options.
- Payment failure: retain invoice as `Pending` and provide Retry button.

5.5 Data export and admin utilities

- Export formats: CSV (UTF-8 BOM), JSON archive (full state), and sample accounting CSV for Excel/Tally.
- Import: CSV upload validates header row, previews changes and allows skip/merge mode.

---

## Chapter 6 — Output Design & Templates (detailed)

This chapter provides the invoice template, print CSS guidance, CSV formats, sample HTML invoice and PDF generation options.

6.1 Invoice layout specification

- Page size: A4 (210mm × 297mm) or receipt width (for thermal printers).
- Margins: use the document defaults specified in header for A4.
- Header:
	- Left: Shop logo (if uploaded) and address.
	- Center: Shop name (bold), phone (optional).
	- Right: Invoice number, date/time, cashier.
- Items table columns: S.No, Product, Qty (g/kg or units), Unit Price (per kg or per unit), Discount, Line Total.
- Summary block (right aligned): Subtotal, Discount, Tax, Grand Total.

6.2 Printable CSS (example rules)

```css
@media print {
	body { font-family: 'Times New Roman', serif; font-size: 12pt; }
	.no-print { display: none !important; }
	table { width: 100%; border-collapse: collapse; }
	th, td { padding: 4px; border-bottom: 1px solid #ccc; }
}
```

6.3 Sample invoice HTML snippet

```html
<div class="invoice">
	<header>
		<h1>Gusain Billing App</h1>
		<div class="meta">Invoice: INV-20251124-0001 | Date: 2025-11-24</div>
	</header>
	<table class="items">
		<thead><tr><th>#</th><th>Product</th><th>Qty</th><th>Rate</th><th>Total</th></tr></thead>
		<tbody><tr><td>1</td><td>Tomato</td><td>350 g</td><td>25.50</td><td>8.93</td></tr></tbody>
	</table>
	<div class="summary">Total: ₹ 8.93</div>
</div>
```

6.4 CSV export formats

- Transactions CSV columns (recommended):
	- `invoiceId,date,cashier,total,paymentMethod,itemsCount,subtotal,discount,tax`
- Products CSV columns: `id,name,sku,category,pricePerKg,stockInGrams`

6.5 PDF generation options

- Client-side: Use `window.print()` to print or save as PDF via browser.
- Programmatic: Use Puppeteer to render the invoice HTML with the print CSS and produce a standardized PDF. Example command (hosted build server):

```bash
node scripts/generate-pdf.js --html dist/invoice.html --out docs/output/invoice.pdf --format A4
```

---

## Chapter 7 — Testing & QA (comprehensive)

This chapter expands the testing plan into specific test cases, mapping to requirements, tooling recommendations and sample automation scripts.

7.1 Test strategy and tooling

- Unit tests: Jest + React Testing Library for isolated logic and components.
- Integration tests: msw (Mock Service Worker) to mock payment APIs and persistence behaviors.
- E2E tests: Playwright (recommended) for cross-browser flows, including offline and print preview.
- Performance tests: Lighthouse for page metrics, custom scripts to simulate large product lists.

7.2 Test environments

- Local: developer machine with `npm run dev`.
- CI: run tests in GitHub Actions or similar with matrix for Node versions and browsers.

7.3 Test cases (selected, detailed)

TC-101: Product CRUD
- Steps: Login as Admin → Add product (Tomato, price 25.5) → Verify appears in inventory list → Edit product price → Verify change persists → Delete product → Confirm removal.
- Expected: product added/edited/deleted, inventory count updated.

TC-201: Weighted Billing & Rounding
- Steps: Add Tomato priced 25.50/kg → Enter 350 g → Add to cart → Compute line total.
- Expected: line total = round(25.50 * 0.35, 2) = 8.93.

TC-301: Invoice Print & Export
- Steps: Finalize sale → Click Print Preview → Save as PDF → Export transactions CSV for today's date.
- Expected: PDF contains correct totals and CSV line for invoice.

TC-401: Online Payment Flow (mocked)
- Steps: Select Online payment → Mock create-payment endpoint returns clientSecret → Simulate provider success callback → Verify invoice marked Paid.
- Expected: invoice.payment.status transitions to `Paid` and reconciliation record added.

7.4 E2E scenarios (Playwright example)

Playwright script should:
1. Start app (or use deployed preview).
2. Perform Admin product addition for test product.
3. Switch to Billing, perform checkout with weighted item.
4. Trigger print preview and verify PDF content using text extraction.

7.5 Test matrix and coverage

- Maintain `docs/tests/test-matrix.csv` listing all cases, steps, expected results, pass/fail, tester, timestamp and attachments (screenshots, logs).

7.6 CI example (GitHub Actions snippet)

```yaml
name: CI
on: [push, pull_request]
jobs:
	test:
		runs-on: ubuntu-latest
		steps:
		- uses: actions/checkout@v3
		- uses: actions/setup-node@v3
			with: node-version: 18
		- run: npm ci
		- run: npm run lint
		- run: npm test -- --coverage
```

---

## Chapter 8 — Deployment, Operations & Maintenance (detailed)

8.1 Build pipeline and release

- Build: `npm run build` creates production `dist/`.
- Release: Deploy `dist/` to Vercel/Netlify or static host. For serverless functions, deploy `api/` endpoints to the same provider.

8.2 Environment configuration

- Frontend: no secrets required.
- Serverless: `STRIPE_SECRET`, `STRIPE_WEBHOOK_SECRET`, `PAYMENT_PROVIDER`.

8.3 Recommended hosting patterns

- Small deployments: Vercel or Netlify (static host + functions).
- Larger deployments: Host static on S3 + CloudFront, functions on AWS Lambda or Google Cloud Functions.

8.4 Backup & restore procedures

Admin Export (manual):
1. Admin → Backup → Export JSON → store securely.
2. To restore, Admin uploads JSON and the system validates schema and prompts for merge/replace.

Automated backup (optional):
- A scheduled script uploads encrypted JSON to an S3 bucket with lifecycle rules.

8.5 Monitoring and observability

- Client-side error reporting: Sentry (small plan) to capture JS errors.
- Uptime: monitor serverless endpoints with Pingdom.

8.6 Rollback plan

- Keep last two stable builds; rollback by redeploying previous `dist/` artifact.

8.7 Post-deployment checklist

1. Verify locales and assets are present in `dist/`.
2. Run smoke tests: basic flows (Billing, Inventory, Print).
3. Verify serverless env vars.

---

## Chapter 9 — Usability Field Testing Plan (detailed)

9.1 Objectives

- Measure average transaction time and error rates for target users.
- Validate printed invoice legibility and layout across printers.

9.2 Study design

- Participants: 5–10 shop staff representing typical user demographics.
- Sessions: 2–3 hours; include onboarding (5–10 minutes) and scripted transactions.

9.3 Data collection and instruments

- Timer for each transaction, observation notes, SUS (System Usability Scale) questionnaire at end, and post-session interviews.

9.4 Metrics and analysis

- Average checkout time, variance, percent of transactions requiring help, SUS score average.

9.5 Example script (task for user)

Task A: Complete sale with 3 items (one weighted) and print invoice. Record time and issues.

---

## Chapter 10 — Future Roadmap (detailed)

This chapter lists prioritized features, rough effort estimates (story points/hours) and acceptance criteria.

10.1 Priority 1 (next 3 months)

- IndexedDB mode + migration tool (40–60 hours)
- PWA service worker with offline queueing (30–50 hours)

10.2 Priority 2 (3–6 months)

- Payment provider adapters (Stripe, Razorpay) complete with reconciliation dashboard (50–80 hours)
- CSV/Accounting direct export templates (Tally/Zoho) (20–30 hours)

10.3 Priority 3 (6–12 months)

- Multi-device sync and auth (Supabase/Firebase) (120+ hours)
- Hardware integrations (USB scanner, thermal printer drivers) (80+ hours)

---

## Appendices (expanded)

Appendix A — Product CSV sample

```
name,sku,category,pricePerKg,stockInGrams,imageUrl
Tomato,TOM-001,Vegetables,25.5,120000,images/tomato.jpg
Potato,POT-001,Vegetables,30,50000,images/potato.jpg
```

Appendix B — Selected Test Matrix (CSV excerpt)

`docs/tests/test-matrix.csv` should contain columns: id, requirement, steps, expected, result, notes.

Appendix C — Serverless payment example (reference)

See Chapter 3 and earlier sample `api/create-payment.js` for a minimal implementation.


```js
// migrate-products.js
async function migrateLocalToIndexedDB(){
	const raw = localStorage.getItem('products_v1');
	if(!raw) return;
	const products = JSON.parse(raw);
	const db = await openIndexedDB('billing', 1);
	const tx = db.transaction('products','readwrite');
	for(let i=0;i<products.length;i+=100){
		const batch = products.slice(i,i+100);
		batch.forEach(p => tx.store.put(p));
		await tx.done;
	}
}
```
	Appendix E — Gantt and Wireframes (placeholders)

	The following placeholder images are included in `docs/images/` to help reviewers visualize architecture and timelines:

	- `docs/images/erd.svg` — Entity Relationship Diagram (placeholder)
	- `docs/images/dfd.svg` — Data Flow Diagram (placeholder)
	- `docs/images/gantt.svg` — Sample Gantt chart (placeholder)
	- `docs/images/architecture.svg` — High-level architecture (placeholder)
	- `docs/images/wireframe-billing.svg` — Billing page wireframe (placeholder)

	Appendix F — Cost model (detailed)

	Provide editable spreadsheet with person-hours per milestone, rates, and contingency at `docs/appendices/costs.xlsx`.

	Appendix G — Glossary

	- POS: Point of Sale
	- SKU: Stock Keeping Unit
	- PWA: Progressive Web App

- POS: Point of Sale
- SKU: Stock Keeping Unit
- PWA: Progressive Web App

---

End of detailed chapters and appendices. All chapters after Chapter 4 have been expanded with step-by-step guidance, sample code, test cases, deployment instructions and appendices suitable for academic/project submission. If you'd like, I can now:

- Generate a print-ready PDF (A4, Times New Roman) from this Markdown.
- Add placeholder diagrams in `docs/images/` and reference them inline.
- Create `docs/tests/test-matrix.csv` and `docs/appendices/costs.xlsx` with starter content.

- Create `docs/tests/test-matrix.csv` and `docs/appendices/costs.xlsx` with starter content.

Which one should I do next?


---

## Full Detailed Report (expanded explanations)

This file now contains a deeper, graduate-level explanation of the design, implementation choices, algorithms, testing and deployment. It is intended to be comprehensive for evaluation, maintenance, and future extension. The sections below expand on the existing chapter headings with additional rationale, worked examples, and concrete developer guidance.

---

## Chapter 1 — Introduction (extended)

1.1 Strategic context

Modern small-retailer POS needs balance affordability, reliability, and usability. The Gusain Billing App targets the typical Indian fruit-and-vegetable vendor: low hardware budgets, limited or no internet connectivity during business hours, and a requirement for rapid, accurate billing by weight. The app reduces friction by offering a single-page, offline-first experience that stores data locally and can export or synchronize when connectivity is available.

1.2 Project aims in engineering terms

- Build a resilient client application (React + TypeScript) with clear separation of concerns (UI, business logic, persistence).
- Prioritize determinism in financial calculations: use integer arithmetic (paise) to prevent floating-point rounding errors.
- Provide a simple, auditable data model for invoices and products to support later reconciliation.

1.3 Success metrics and acceptance tests

- Functional correctness: 100% agreement between computed totals and expected math in unit tests for billing rules.
- Performance: product search latency < 200ms on a catalog of 2000 items on a low-end CPU (benchmark target).
- Reliability: no data loss for normal app closes; checkpointed backups available via export.

---

## Chapter 2 — System Analysis & Requirements (extended)

2.1 Expanded use-cases with alternatives

Use Case: Discount and rounding policy

- Scenario A: Percentage discount at invoice-level (e.g., 5% off for bill > 1000 INR). Rounding: apply discount to subtotal in paise, round to nearest integer paise before tax.
- Scenario B: Per-item discount (flat rupee per item). Apply per-line discount in paise and propagate to subtotal.

Acceptance notes: Document the sequence in which discounts and taxes apply; different regions have different tax rules — expose configuration for tax-before-discount vs discount-before-tax.

2.2 Expanded RTM (complete)

| Req ID | Requirement Description | Priority | Verification |
|---|---|---:|---|
| FR1 | Product CRUD with image and CSV import/export | High | TC-101, TC-701 (import) |
| FR2 | Weighted billing with paise-aware rounding | High | TC-201 |
| FR3 | Invoice persistence, print, export | High | TC-301 |
| FR4 | Reports: daily, monthly, category | Medium | Manual verification + sample exports |
| FR5 | Online payment adapter skeleton and webhook handling | Medium | TC-401, TC-801 |
| NFR1 | Offline operation for core flows | High | E2E-03 (offline sale recover) |
| NFR2 | UI accessibility & speed | Medium | Usability study metrics |

---

## Chapter 3 — System Design (extended technical details)

3.1 Data modeling and normalization

Rationale: Normalization reduces duplication and simplifies reconciliation. Products are stored once with a canonical price; invoices store a denormalized snapshot of name/price at time of sale to maintain historical correctness.

Product table (conceptual):

- id (uuid)
- name (string)
- sku (string)
- pricePerKgPaise (integer)
- stockInGrams (integer)
- createdAt, updatedAt (ISO strings)

Invoice table (conceptual):

- id (string invoiceId)
- date (ISO)
- items (array of denormalized line items)
- subtotalPaise, discountPaise, taxPaise, totalPaise

3.2 Billing engine overview (modules)

- Input sanitization: parse grams/kg and normalize to grams (integers)
- Pricing: compute per-line paise total: linePaise = round((qtyGrams * pricePerKgPaise) / 1000)
- Discounts: apply per-line or order-level discount; all in paise
- Tax: compute on taxable amount with basis points to support variable tax rates (e.g., 500 bps = 5%)
- Rounding: use integer arithmetic, round at points defined by tax law or app settings

3.3 Sample implementation — billing utils (complete)

```ts
// src/lib/billing.ts
export type LineItem = { productId: string; name: string; qtyGrams: number; pricePerKgPaise: number; discountPaise?: number };

export function lineTotalPaise(item: LineItem) {
	// price per gram = pricePerKgPaise / 1000
	const raw = Math.round(item.qtyGrams * item.pricePerKgPaise / 1000);
	const discount = item.discountPaise || 0;
	return Math.max(0, raw - discount);
}

export function invoiceTotals(items: LineItem[], orderDiscountPaise = 0, taxBps = 0) {
	const subtotal = items.reduce((s, it) => s + lineTotalPaise(it), 0);
	const taxable = Math.max(0, subtotal - orderDiscountPaise);
	const tax = Math.round(taxable * taxBps / 10000);
	const total = subtotal - orderDiscountPaise + tax;
	return { subtotal, orderDiscountPaise, tax, total };
}
```

3.4 Persistence adapter pattern

Design: expose a `StorageAdapter` with methods `get(key)`, `set(key, value)`, `getAll(prefix)` and `migrateToIndexedDB()` so that higher-level modules remain independent of storage mechanism.

3.5 Search implementation notes

For small catalogs, a simple in-memory array with prefix match is sufficient. For larger ones, tokenize product names and maintain an inverted index in memory or in IndexedDB, and perform search in a Web Worker to keep the UI thread free.

3.6 Security considerations (deep dive)

- Never include provider secrets in the frontend. The serverless function must store secrets in environment variables and verify webhooks.
- For webhook processing, use the provider's recommended signature verification and idempotency to avoid duplicate processing on retries.

Example (Stripe webhook verification in Node):

```js
import Stripe from 'stripe';
const stripe = new Stripe(process.env.STRIPE_SECRET);
export default async function webhook(req, res){
	const sig = req.headers['stripe-signature'];
	try{
		const event = stripe.webhooks.constructEvent(req.rawBody, sig, process.env.STRIPE_WEBHOOK_SECRET);
		// process event
		res.status(200).send('ok');
	} catch(e){
		console.error('Webhook error', e.message);
		res.status(400).send('invalid');
	}
}
```

---

## Chapter 4 — Project Management (extended notes)

4.1 Quality gates and acceptance

- Enforce code quality via linting and pre-commit hooks.
- Gate releases on passing unit tests, integration tests and a minimal E2E smoke test.

4.2 Documentation and deliverables

- Technical docs: this report, API spec (for serverless endpoints), database schema and migration notes.
- User docs: short Quick Start (Admin/Cashier), and Troubleshooting Guide.

---

## Chapter 5 — Input Design & User Manual (further expanded)

5.1 UX decisions and rationale

- Minimize modal depth: cashiers should complete common flows in 1-2 clicks.
- Use clear, large typography for busy environments; default to large buttons and touch-friendly controls.

5.2 Accessibility and localization

- Support `en` and `hi` locales; text should be externalized to `locales/*.json` and fallbacks provided.
- Ensure color contrast meets WCAG AA for essential UI elements.

5.3 Error logging and admin audit

- Maintain an `adminLogs` store with timestamped events: product deletes, site settings changes, backups performed, payment reconciliations.

---

## Chapter 6 — Output Design & Templates (further expanded)

6.1 Advanced invoice features

- QR code for online payment or for storing invoice metadata. Use `qrcode` library to generate base64 PNG and embed in invoice.
- Multi-language invoice support: invoice content rendered using selected locale at print-time.

6.2 Example: QR payload for UPI or payment intent

```
upi://pay?pa=merchant@upi&pn=Gusain+Billing&am=79.20&cu=INR&tn=INV-20251124-0001
```

6.3 Reporting CSV detailed schema

- Transactions export: include itemized JSON column for full line-item detail to help accounting systems reconstruct invoices.

---

## Chapter 7 — Testing & QA (expanded checklist)

7.1 Additional automated tests to add

- Property-based tests for billing calculations: generate random line items and assert invariants (monotonicity, non-negative totals).
- Regression tests for migration script to ensure no duplicate records.

7.2 Test data management

- Provide fixture datasets under `tests/fixtures/` and a script to seed the dev environment for E2E tests.

7.3 Reporting test results

- Integrate test coverage upload to Codecov and include coverage badges in README.

---

## Chapter 8 — Deployment, Operations & Maintenance (recipes)

8.1 Local dev quick-start

```bash
# install
npm ci
# dev server
npm run dev -- --host
```

8.2 Production build & deploy (Vercel)

1. Configure project on Vercel.
2. Set environment variables for serverless functions.
3. `git push` to main — Vercel will build and deploy.

Custom script to build and copy locales into `dist` (example):

```bash
npm run build && cp -R locales dist/locales
```

8.3 Backup & disaster recovery playbook

1. Admin exports state weekly (`siteSettings`, `products`, `invoices`).
2. Encrypt JSON archive with a passphrase and store offsite.
3. For restore, import into a staging environment first and confirm integrity.

---

## Chapter 9 — Usability Study & Field Testing (expanded procedures)

9.1 Interview guide & tasks

- Pre-session: collect background and prior POS experience.
- Tasks: product lookup, add weighted item, finalize cash sale, print invoice.
- Post-task: ask about pain points and suggestions.

9.2 Data analysis plan

- Compute mean, median, and 90th percentile times for tasks. Identify bottlenecks.

---

## Chapter 10 — Roadmap & Extensions (technical depth)

10.1 IndexedDB plan — schema and migration

- Use `idb` library for a promise-based IndexedDB wrapper. Create object stores `products`, `invoices`, `settings` and indexes on `sku`, `date`.

10.2 Multi-device sync considerations

- Use a change-log + CRDT-lite approach or adopt Supabase with last-write-wins and simple conflict resolution UI.

---

## Appendices (expanded artifacts and templates)

Appendix A — Sample CSVs and validation rules (see `docs/appendices/csv-samples/`).

Appendix B — Full test matrix (reference to `docs/tests/test-matrix.csv`).

Appendix C — Serverless functions: minimal `create-payment` and `webhook` examples (expanded earlier).

Appendix D — Migration scripts and sanity checks (pseudocode included earlier).

Appendix E — Cost & effort workbook (place in `docs/appendices/costs.xlsx`).

Appendix F — References, third-party libraries and licenses.

---

End of the extended, detailed report. The file is ready for formatting and PDF generation. If you want, I will:

- Generate a print-ready PDF (A4, Times New Roman) using Puppeteer and attach it here.
- Create placeholder diagram images (`docs/images/erd.png`, `docs/images/gantt.png`, `docs/images/dfd.png`) as SVGs and embed them.
- Create `docs/appendices/costs.xlsx` starter workbook and a Markdown `docs/tests/test-matrix.md` human-readable test plan.

Which of those should I do next?
