# MCA Project Report
## Gusain Billing App: Offline-First Billing and Inventory Management System for Small Retail Stores

**Program:** Master of Computer Applications (MCA)  
**Project Type:** Major Project  
**Academic Session:** 2025–2026  

---

## Preliminary Pages

### 0.1 Document Formatting Standard

- Paper size: A4 (210 mm × 297 mm)
- Font: Times New Roman
- Body font size: 12 pt
- Heading font sizes: 16 pt (chapter), 14 pt (section), 12 pt (subsection)
- Line spacing: 1.5
- Margins: Left 1.25 in, Right 1.00 in, Top 0.75 in, Bottom 0.75 in
- Alignment: Justified for body text
- Page numbering:
  - Preliminary pages in lowercase Roman numerals (i, ii, iii, ...)
  - Main chapters in Arabic numerals (1, 2, 3, ...)
- Chapter-wise numbering:
  - Figures: Fig. *Chapter.Figure* (e.g., Fig. 3.1)
  - Tables: Table *Chapter.Table* (e.g., Table 2.1)
  - Equations: (*Chapter.Equation*) (e.g., (3.1))

### 0.2 Table of Contents

1. Chapter 1: Introduction  
2. Chapter 2: System Analysis and Requirements Specification  
3. Chapter 3: System Design and Architecture  
4. Chapter 4: Project Planning and Management  
5. Chapter 5: Input Design and Validation  
6. Chapter 6: Output Design and Reporting  
7. Chapter 7: Testing, Implementation, and Maintenance  
8. Chapter 8: Results, Conclusion, and Future Scope  
9. Bibliography (IEEE Format)  
10. Appendices  

### 0.3 List of Figures

- Fig. 3.1 High-Level Architecture (`docs/images/architecture.svg`)
- Fig. 3.2 Entity Relationship Diagram (`docs/images/erd.svg`)
- Fig. 3.3 Data Flow Diagram Level-0 (`docs/images/dfd.svg`)
- Fig. A.1 Billing Screen Wireframe (`docs/images/wireframe-billing.svg`)
- Fig. A.2 Project Gantt Representation (`docs/images/gantt.svg`)

### 0.4 List of Tables

- Table 2.1 Stakeholder and Role Mapping
- Table 2.2 Functional Requirements with Acceptance Criteria
- Table 2.3 Non-Functional Requirements
- Table 2.4 Requirements Traceability Matrix
- Table 4.1 Milestone Plan
- Table 5.1 Input Validation Rules
- Table 6.1 Invoice Output Field Specification
- Table 7.1 Test Summary
- Table 8.1 Performance and Usability Outcomes

---

## Chapter 1. Introduction

### 1.1 Background

Micro and small retail shops in India, especially fruit and vegetable stores, continue to depend on manual billing, handwritten ledgers, and calculator-based transactions. These methods cause calculation errors, stock inconsistencies, and delayed reporting. Existing cloud-centric POS platforms often have recurring licensing costs and require stable internet connectivity, which is not reliable in many local market environments.

### 1.2 Problem Statement

The target users require a low-cost, easy-to-use, and reliable billing application that supports weight-based pricing, inventory updates, invoice printing, and day-end reporting, while remaining functional during internet outages.

### 1.3 Project Objectives

1. Design and develop an offline-first billing and inventory web application.
2. Provide fast checkout for weight-based and unit-based products.
3. Ensure deterministic financial computations with minimal rounding error.
4. Provide printable invoices and exportable reports for accounting.
5. Maintain extensibility for online payment and cloud synchronization.

### 1.4 Scope

The project includes frontend implementation of billing, product management, invoice generation, and local data persistence. It also includes architecture hooks for payment adapters and future synchronization services.

### 1.5 Limitations

- Single-device operation in the current implementation.
- No mandatory centralized server-side authentication.
- Online payment and webhook verification require optional backend/serverless deployment.

### 1.6 Organization of the Report

This report is structured into eight chapters, followed by bibliography and appendices. It covers requirements, design, implementation approach, testing strategy, deployment guidance, and future enhancement pathways.

---

## Chapter 2. System Analysis and Requirements Specification

### 2.1 Stakeholder Analysis

The system has three primary user groups with distinct operational responsibilities.

**Table 2.1 Stakeholder and Role Mapping**

| Stakeholder | Operational Role | System Responsibilities |
|---|---|---|
| Store Owner / Admin | Configuration and control | Product setup, pricing, tax settings, report export |
| Cashier | Daily billing operations | Product search, cart management, invoice generation |
| Accountant | Financial review | Daily/monthly export, reconciliation, audit checks |

### 2.2 Functional Requirements

**Table 2.2 Functional Requirements with Acceptance Criteria**

| Req ID | Requirement | Acceptance Criterion |
|---|---|---|
| FR-1 | Product CRUD | New/updated/deleted products are reflected in inventory immediately |
| FR-2 | Weighted Billing | Accurate line total generation for grams/kg inputs |
| FR-3 | Invoice Printing | Invoice print view contains item lines, totals, and metadata |
| FR-4 | Sales Reports | Daily/monthly summaries export to CSV without data loss |
| FR-5 | Backup/Restore | JSON export-import restores store state with schema checks |

### 2.3 Non-Functional Requirements

**Table 2.3 Non-Functional Requirements**

| Req ID | Requirement Type | Requirement Statement |
|---|---|---|
| NFR-1 | Performance | Product search should respond within 200 ms for typical catalog sizes |
| NFR-2 | Reliability | Core billing flow should work without network connectivity |
| NFR-3 | Usability | UI should support large touch targets and keyboard shortcuts |
| NFR-4 | Maintainability | Logic should be modular and adaptable to storage/payment backends |
| NFR-5 | Data Safety | Export capability should allow periodic backup and recovery |

### 2.4 Use Cases

Primary use cases include product administration, cashier checkout, invoice printing, and report export. Alternate flows cover out-of-stock warnings, payment failure, and interrupted sessions.

### 2.5 Requirements Traceability Matrix

**Table 2.4 Requirements Traceability Matrix**

| Requirement | Module | Test Case ID |
|---|---|---|
| FR-1 | Inventory | TC-101 |
| FR-2 | Billing Engine | TC-201 |
| FR-3 | Invoice Module | TC-301 |
| FR-4 | Reporting | TC-401 |
| FR-5 | Backup/Restore | TC-501 |
| NFR-1 | Search UX | TC-601 |
| NFR-2 | Offline Storage | TC-602 |

---

## Chapter 3. System Design and Architecture

### 3.1 Architectural Overview

The application follows a client-first architecture implemented with React and TypeScript. Business logic is isolated from rendering components, and persistence behavior is abstracted through service interfaces to allow migration from local storage to IndexedDB or cloud systems.

**Fig. 3.1 High-Level Architecture**  
Reference: `docs/images/architecture.svg`

### 3.2 Data Design

The data model contains two major domain entities: Product and Invoice.

- **Product:** identity, name, category, SKU, unit type, price-per-kg, available stock.
- **Invoice:** unique invoice number, timestamp, cashier, line items, subtotal, discount, tax, grand total, payment state.

**Fig. 3.2 Entity Relationship Diagram**  
Reference: `docs/images/erd.svg`

### 3.3 Process Design

The billing process sequence is:

1. Product retrieval and search.
2. Quantity/weight entry and line amount computation.
3. Discount and tax application.
4. Invoice finalization and persistence.
5. Print preview and record archival.

**Fig. 3.3 Data Flow Diagram Level-0**  
Reference: `docs/images/dfd.svg`

### 3.4 Financial Computation Strategy

To avoid floating-point inaccuracies in monetary operations, all currency values are internally processed in integer paise.

Let:
- \( q_g \) = quantity in grams,
- \( p_{kg} \) = unit price in paise per kg.

Then line total is computed as:

\[
\text{LineTotalPaise} = \operatorname{round}\left(\frac{q_g \times p_{kg}}{1000}\right)
\]

Final invoice amount is:

\[
\text{TotalPaise} = \text{SubtotalPaise} - \text{DiscountPaise} + \text{TaxPaise}
\]

### 3.5 Security and Data Integrity

1. Secrets for payment providers are never stored in frontend code.
2. Webhook endpoints must verify signatures and enforce idempotency.
3. Imported CSV data must be schema-validated before applying changes.
4. Backup files should be stored outside the primary device and optionally encrypted.

### 3.6 Extensibility Design

The project is designed with adapter-style boundaries:

- `StorageAdapter`: enables localStorage, IndexedDB, or remote persistence.
- `PaymentAdapter`: supports provider-specific payment initiation and verification.
- `Localization layer`: maps UI strings from locale files for multilingual UI.

---

## Chapter 4. Project Planning and Management

### 4.1 Development Methodology

An incremental and iterative implementation approach is followed. Core billing capability is delivered first, followed by inventory and reporting modules, and finally integration features.

### 4.2 Milestone Plan

**Table 4.1 Milestone Plan**

| Milestone | Scope | Deliverable |
|---|---|---|
| M1 | Requirement finalization | Requirement specification and use cases |
| M2 | Core billing module | Cart, pricing logic, invoice draft generation |
| M3 | Inventory module | Product CRUD and stock update workflows |
| M4 | Reporting and export | Daily/monthly summaries and CSV outputs |
| M5 | Testing and deployment | Test evidence, build artifact, deployment guide |

### 4.3 Risk Management

Major risks include data corruption due to abrupt browser closure, inaccurate manual stock entries, and integration instability for external payment APIs. Mitigation strategies include periodic backups, validation constraints, and mock-based integration testing.

### 4.4 Quality Control

Code consistency is maintained through modular component boundaries, repeatable build checks, and requirement-linked test cases.

---

## Chapter 5. Input Design and Validation

### 5.1 Input Modules

Input interfaces include:

1. Site setup form (shop details and tax settings).
2. Product form (catalog maintenance).
3. Billing panel (search, quantity/weight, discounts).
4. Backup/restore controls.

### 5.2 Validation Rules

**Table 5.1 Input Validation Rules**

| Field | Type | Validation Rule | Error Condition |
|---|---|---|---|
| Product Name | Text | Required, trimmed, max 100 chars | Empty or only spaces |
| Price per Kg | Numeric | Non-negative, max two decimals | Non-numeric or negative |
| Stock in Grams | Integer | Required, non-negative | Decimal or negative value |
| Tax Rate | Numeric | Range 0 to 100 | Out-of-range value |
| CSV Header | Structured text | Must match mandatory column set | Missing/invalid columns |

### 5.3 Input Error Handling Design

Validation is performed before persistence. Errors are displayed inline to reduce correction time. Recovery actions include retaining entered values, highlighting invalid fields, and providing explicit resolution messages.

### 5.4 Accessibility Features for Input

- Keyboard navigation for major forms.
- Focus order designed for cashier speed.
- Shortcut support for search and print operations.
- High-contrast action buttons for visibility in shop environments.

---

## Chapter 6. Output Design and Reporting

### 6.1 Invoice Output Structure

The generated invoice includes store header, invoice metadata, itemized table, tax/discount breakup, payment mode, and grand total.

**Table 6.1 Invoice Output Field Specification**

| Section | Output Fields |
|---|---|
| Header | Shop name, address, contact |
| Transaction Metadata | Invoice number, timestamp, cashier |
| Item Lines | Product, quantity/weight, unit rate, line total |
| Financial Summary | Subtotal, discount, tax, grand total |
| Footer | Thank-you note and optional return policy |

### 6.2 Printed Output Requirements

- A4 and thermal-print compatible layout.
- Consistent alignment of numeric amounts.
- Legible typography and monochrome print-safe styling.

### 6.3 Reports

The system provides structured reports for operational and accounting needs:

1. Daily sales summary.
2. Monthly sales trend.
3. Product-wise movement statistics.
4. CSV export for downstream accounting tools.

### 6.4 Export Reliability

CSV export preserves UTF-8 encoding and deterministic column ordering to ensure compatibility with spreadsheet and accounting software.

---

## Chapter 7. Testing, Implementation, and Maintenance

### 7.1 Implementation Environment

- Frontend stack: React, TypeScript, Vite.
- Runtime target: modern Chromium, Firefox, and Edge versions.
- Build artifact: static `dist/` output.

### 7.2 Testing Strategy

Testing combines functional checks, integration-level flow verification, and user-level scenario validation.

- Functional tests validate calculation and validation logic.
- Integration tests validate workflow continuity across modules.
- Scenario tests validate complete checkout and report export flows.

### 7.3 Representative Test Cases

1. **TC-101 Product CRUD:** add/edit/delete product and verify persistence.
2. **TC-201 Weighted Billing:** verify paise-level total for gram-based quantity.
3. **TC-301 Invoice Output:** verify print layout and financial summary fields.
4. **TC-501 Backup/Restore:** verify imported backup reproduces state.

### 7.4 Test Summary

**Table 7.1 Test Summary**

| Category | Coverage Outcome |
|---|---|
| Product Management | CRUD and validation paths verified |
| Billing Engine | Weight, discount, and tax scenarios verified |
| Invoice/Print | Layout and data consistency verified |
| Export/Backup | CSV and JSON export/restore workflows verified |

Detailed case rows are maintained in `docs/tests/test-matrix.csv`.

### 7.5 Deployment and Maintenance

Deployment is performed by building frontend assets and hosting them on static infrastructure. Maintenance activities include periodic data backup, dependency updates, and monitoring of integration endpoints.

---

## Chapter 8. Results, Conclusion, and Future Scope

### 8.1 Results and Observations

The developed system demonstrates reliable offline billing with deterministic amount calculation and structured reporting. It addresses practical retail problems such as fast product lookup, invoice printing, and simple stock updates without requiring continuous internet connectivity.

### 8.2 Performance and Usability Outcomes

**Table 8.1 Performance and Usability Outcomes**

| Metric | Observed Outcome |
|---|---|
| Checkout flow completion | Stable for mixed weighted/unit item transactions |
| Billing accuracy | Consistent paise-level arithmetic for tested datasets |
| Report generation | CSV export generated in expected schema |
| Operator effort | Reduced manual ledger dependency during peak hours |

### 8.3 Conclusion

The project successfully delivers an MCA-level practical software system tailored to small retail contexts. Its architecture balances immediate usability with long-term extensibility, allowing migration to cloud-enabled workflows when business scale requires it.

### 8.4 Future Scope

1. Multi-device synchronization with conflict resolution.
2. Payment gateway production integration and reconciliation dashboard.
3. Progressive Web App enhancements with background synchronization.
4. Advanced analytics for category-wise and seasonal sales forecasting.
5. Peripheral support for barcode scanners and receipt printers.

---

## Bibliography (IEEE Format)

[1] MDN Web Docs, “Service workers,” Mozilla, 2025. [Online]. Available: https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API. [Accessed: 16-May-2026].

[2] MDN Web Docs, “IndexedDB API,” Mozilla, 2025. [Online]. Available: https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API. [Accessed: 16-May-2026].

[3] Google Developers, “Progressive Web Apps,” Google, 2025. [Online]. Available: https://web.dev/progressive-web-apps/. [Accessed: 16-May-2026].

[4] Stripe, “Webhooks,” Stripe Documentation, 2026. [Online]. Available: https://docs.stripe.com/webhooks. [Accessed: 16-May-2026].

[5] Razorpay, “Payments and Webhooks Documentation,” Razorpay Docs, 2026. [Online]. Available: https://razorpay.com/docs/. [Accessed: 16-May-2026].

[6] React Team, “React documentation,” Meta, 2026. [Online]. Available: https://react.dev/. [Accessed: 16-May-2026].

[7] Vite Team, “Vite documentation,” 2026. [Online]. Available: https://vite.dev/. [Accessed: 16-May-2026].

[8] R. S. Pressman and B. R. Maxim, *Software Engineering: A Practitioner’s Approach*, 9th ed. New York, NY, USA: McGraw-Hill, 2019.

---

## Appendices

### Appendix A. Figures and Visual Artifacts

- **Fig. A.1 Billing Screen Wireframe:** `docs/images/wireframe-billing.svg`
- **Fig. A.2 Project Gantt Representation:** `docs/images/gantt.svg`

### Appendix B. Test Matrix

Detailed test evidence is maintained in:  
`docs/tests/test-matrix.csv`

### Appendix C. Data Backup and Recovery Procedure

1. Navigate to admin backup utility.
2. Export JSON archive of products, settings, and invoices.
3. Store backup in secured secondary storage.
4. Restore by importing JSON and validating schema before replacement.

### Appendix D. CSV Templates

Example product CSV columns:

`name,sku,category,pricePerKg,stockInGrams,imageUrl`

Example transaction CSV columns:

`invoiceId,date,cashier,total,paymentMethod,itemsCount,subtotal,discount,tax`

### Appendix E. Glossary

- **POS:** Point of Sale.
- **SKU:** Stock Keeping Unit.
- **PWA:** Progressive Web Application.
- **RTM:** Requirements Traceability Matrix.
- **NFR:** Non-Functional Requirement.

---

**End of Report**
