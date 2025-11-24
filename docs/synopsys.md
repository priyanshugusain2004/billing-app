Chapter 1  Introduction

1.1 Company Introduction
Gusain Billing App is a lightweight, easy-to-deploy billing and inventory management system designed specifically for small fruit and vegetable retailers. It provides a simple point-of-sale (POS) interface, local data persistence for offline operation, and essential reporting features required by shop owners.

1.2 Project Introduction
This project implements a client-side web application using React and Vite. The app includes user roles (Admin and Cashier), product and inventory management, cart and billing workflows, printable invoice generation, sales reporting, and hooks for optional online payment integration and cloud sync.

1.3 Motivation
Small retailers face affordability and reliability constraints with existing POS solutions. A lightweight, offline-capable system reduces dependency on continuous internet access, lowers costs, and enables fast adoption.

1.4 Objectives & Scope
Objectives:
- Introduction and Problem Statement

1. Company background
- Gusain Billing App targets small fruit and vegetable retailers that need a low-cost, easy-to-run point-of-sale solution.

2. Problem statement
- Small retailers commonly rely on cash-ledgers or expensive cloud POS systems; they need an offline-capable, fast billing tool supporting weight-based items, inventory, and printable invoices.

3. Scope and limitations
- Scope: Frontend SPA for billing, inventory, and reports; local persistence; optional payment and cloud sync integrations.
- Limitations: No built-in multi-device sync or server-side auth in initial delivery; payment integrations require serverless endpoints.

4. Objectives (summary)
- Fast billing (weight-based), inventory CRUD, printable invoices, secure admin controls, CSV import/export, configurable tax/currency, backup/restore toggle.

Background / Literature Survey

1. Offline-first architectures
- Concepts: service workers, IndexedDB/localStorage, background sync, and idempotent APIs to ensure reliable offline capture and later reconciliation.

2. POS usability studies
- Best practices: minimal input latency, large tap targets, quick weight entry, and prominent confirmation for transactions.

3. Payment integration best practices
- Use hosted checkout/tokenization; verify webhooks server-side; implement idempotency on create-payment requests.

4. Synchronization and reconciliation
- Strategies: outbound queues, idempotency keys, settlement matching algorithms, and manual reconciliation UIs.

Objectives

1. Primary objectives
- Implement a responsive offline-capable billing and inventory app with invoice printing and reporting.

2. Secondary objectives
- Provide payment integration hooks, CSV import/export, configurable tax/currency and backup options.

3. Success criteria
- Ability to create and persist invoices offline; printable invoices; configurable tax and discounts; successful webhook-based payment confirmation when integrated.

Hardware and Software Requirements

1. Hardware (minimum)
- 1.5 GHz CPU, 2 GB RAM, 1024×768 display, optional thermal printer.

2. Hardware (recommended)
- 2+ GHz CPU, 4 GB RAM, 1920×1080 display.

3. Software (development)
- Node.js (v18+), npm, Vite, TypeScript, code editor.

4. Software (runtime)
- Modern browsers (Chrome/Firefox/Edge) supporting ES modules and service workers.

5. Optional server components
- Serverless functions or small Node server for payment intents and webhook verification; optional cloud DB for sync.

Possible Approach / Algorithms

1. Product search and lookup
- Maintain an in-memory tokenized index built at app load for fast prefix searches; debounce input and paginate results for very large catalogs.

2. Billing calculation
- Deterministic calculation: subtotal, tiered discount selection, tax computation, total. Use fixed-point arithmetic or integer cents/paise to avoid floating-point errors.

3. Tiered discount algorithm
- Sort discount tiers descending by threshold and pick first applicable tier; O(n_tiers) where n_tiers is small.

4. Offline queue and sync
- On finalize sale, push invoice to outbound queue with status `pending`. Background sync attempts delivery; use idempotency keys and retries with exponential backoff.

5. Payment integration pattern
- Server creates payment intent/order with provider and returns token/checkout info; server verifies provider webhooks and updates invoice status.

6. Reconciliation matching
- Match invoices to provider settlements by transaction id and amount; flag discrepancies for manual review; allow manual mark/resolution.

References

1. MDN Web Docs — Service Workers & IndexedDB
2. Google Developers — Progressive Web Apps
3. Stripe Documentation — Payments & Webhooks
4. Razorpay Documentation — Orders & Webhooks

End of synopsis
