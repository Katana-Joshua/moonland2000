## Moon Land POS — Investment Proposal (Uganda)

Prepared by: [Your Name / Company]
Date: [DD Mon YYYY]
Contact: [Email] | [Phone/WhatsApp] | [Website]

### Executive Summary
- **Problem**: SMEs in Uganda (especially food courts, restaurants, bars, and mini-marts) struggle with manual processes, fragmented tools, and limited visibility into daily cash flows, inventory shrinkage, and staff performance.
- **Solution**: Moon Land POS — a modern, fast, and reliable point-of-sale and back-office system tailored for Ugandan businesses, supporting cash and mobile money (MTN MoMo, Airtel Money) workflows, inventory control, shift tracking, accounting light, and actionable reports.
- **Product Status**: Functional MVP with core modules already implemented and deployable. Ready to pilot at The Address Food Court, Kampala.
- **Business Model**: Subscription (SaaS) + onboarding/implementation + optional hardware margin + premium add-ons (integrations, advanced analytics).
- **Market**: Large and growing addressable market across hospitality and retail in Uganda; mobile money penetration and digitization policies accelerate adoption.
- **Funding Ask**: [UGX/USD Amount] for [Runway Months] months to complete integrations (including EFRIS readiness), scale pilots to [#] sites, and accelerate go-to-market.
- **Use of Funds**: Product hardening [X%], integrations [X%], sales & marketing [X%], operations & support [X%], working capital [X%].

### The Opportunity (Uganda Context)
- **Digitization tailwinds**: High mobile money penetration and increasing demand for real-time visibility and controls.
- **Compliance & reporting**: URA EFRIS e-invoicing adoption (where applicable) and cleaner books drive enterprise readiness.
- **Fragmented incumbents**: Legacy POS tools are expensive, offline-first without cloud analytics, or lack local workflows.
- **Our wedge**: Fast, beautiful UI with reliable core POS, tailored mobile money flows, and a clear roadmap to compliance and integrations.

### Product Overview (Aligned to Current Codebase)
Implemented modules (MVP):
- Sales & Checkout: Cart, payment methods (cash, credit, mobile money: MTN MoMo, Airtel Money), change, receipt print/reprint.
- Inventory: Items, categories, pricing, cost price, stock levels, low stock alerts.
- Shift Management: Open/close shifts, starting/ending cash, logs.
- Staff Management: Staff list and roles; authentication with JWT and role-based access (admin/cashier).
- Receipts: Customizable headers/footers, logo, company info.
- Credit Sales: Track unpaid sales and customer details.
- Expenses: Cash expense capture during shifts.
- Reporting: Sales charts, exports (Excel/PDF), transaction history.
- Accounting Light: Chart of accounts, vouchers, voucher entries (foundation for P&L, trial balance).
- Media: Product image upload and optimization.

Technology stack:
- Frontend: React 18, Vite, TailwindCSS, Radix UI, Recharts, jsPDF/xlsx, Router v6.
- Backend: Node.js/Express, MySQL, JWT auth, data validation, rate limiting, secure headers.
- DevOps: Environment-based config; deployable to Railway/Render/Vercel; REST API.

Planned near-term features (roadmap highlights):
- Kitchen Order Tickets (KOT) / Kitchen Display System (KDS) and printer routing.
- Multi-branch and stock transfers; purchase orders and supplier management.
- EFRIS readiness & electronic invoicing integration (where applicable).
- Mobile money reconciliation (MTN, Airtel) and receipt via SMS/WhatsApp.
- Advanced analytics (basket analysis, cohort, staff performance), role granular permissions, audit trails.

### Customers and Use Cases
- Primary segments: Food courts, restaurants, cafes, bars, mini-marts, takeaways, bakeries.
- Initial flagship pilot: The Address Food Court (Kampala) — [#] tills, [#] staff, [avg transactions/day].
- Expansion: Rollout playbook for similar venues and franchise-style operations.

### Traction (Placeholders)
- Pilots: [#] active pilots; [Client 1], [Client 2].
- Usage: [#] weekly active users, [#] daily transactions, [UGX] monthly GMV processed.
- Revenue: [UGX/USD] MRR, [UGX/USD] services revenue.
- Pipeline: [#] qualified leads; LOIs from [Names].

### Market Size (Placeholders)
- Total Addressable Market (TAM): [UGX/USD] for hospitality and small retail POS in Uganda.
- Serviceable Available Market (SAM): [UGX/USD] focusing on urban food service and mini-marts.
- Serviceable Obtainable Market (SOM): [UGX/USD] in next 3 years via Kampala+Wakiso penetration.

### Competitive Landscape (Examples; Customize)
- Local/Regional: Odoo partners (custom POS), SabiPOS, Loyverse, Chromis/uniCenta, manual cashbooks.
- Global SMB: Square (limited in UG), Lightspeed, Toast (not localized), Vend.
- Our advantages: Local workflows (mobile money first), simpler onboarding, lower TCO, strong reporting, and planned URA EFRIS compliance.

### Business Model & Pricing (Placeholders)
- SaaS tiers (UGX/month per till):
  - Starter: [UGX] — POS, inventory, receipts, reports.
  - Pro: [UGX] — + multi-branch, advanced analytics, KDS/KOT.
  - Enterprise: [UGX] — + API access, custom integrations, priority support.
- One-off services: Onboarding/training [UGX], data migration [UGX], hardware installation [UGX].
- Hardware margin: Thermal printers, cash drawers, barcode scanners, tablets/PCs [margin %].
- Optional: Integrated payments revenue share [bps] (subject to aggregator agreements).

### Go-To-Market Strategy
- Direct sales to high-traffic venues (food courts, malls) starting Kampala/Wakiso.
- Channel partners: Hardware resellers, ICT shops, and accounting firms.
- Reference pilots: Public case studies from [Pilot Clients] with before/after KPIs.
- Marketing: Demos, WhatsApp/YouTube tutorials, merchant communities.

### Technology, Security, and Compliance
- Security: JWT-based auth, password hashing, input validation, rate limiting, secure headers.
- Data: MySQL with indices, transaction safety; configurable backup/restore policy.
- Privacy & compliance: Data protection best practices; role-based access.
- URA EFRIS: Integration planned in roadmap; architectural readiness for e-invoice issuance and QR codes.

### 12-Month Product Roadmap (Placeholders)
Q1 (Months 1–3):
- Production hardening, UX polish, full receipt designer, granular roles & audit logs.
- Pilot at The Address Food Court; iterate on learnings; finalize go-to-market collateral.

Q2 (Months 4–6):
- KOT/KDS and kitchen printer routing; purchase orders; supplier management; stock transfers.
- EFRIS pilot integration (limited scope), SMS/WhatsApp receipt delivery, payment recon reports.

Q3 (Months 7–9):
- Multi-branch dashboards, consolidated inventory and finance; advanced analytics; forecasting.
- Integrations: Accounting exports (Sage/QuickBooks format), WhatsApp Business Cloud.

Q4 (Months 10–12):
- EFRIS GA (where applicable), API for partners, embedded apps marketplace, loyalty module.

### Team & Hiring Plan (Placeholders)
- Founders: [Name], [Role], background in [Domain]; [Name], [Role], ex-[Company].
- Current team: [#] engineers, [#] product/design, [#] sales/support.
- Hiring: 1 full-stack engineer, 1 mobile money integrations engineer, 1 implementation lead, 1 account executive.

### Financial Projections (3 Years) — Placeholders
- Year 1: [UGX/USD] revenue; [#] paying sites; burn [UGX/USD]; runway [months].
- Year 2: [UGX/USD] revenue; [#] sites; gross margin [X%]; approaching break-even.
- Year 3: [UGX/USD] revenue; [#] sites; EBITDA positive [X%].
- Key drivers: Sites acquired/mo, ARPU/till, churn, services mix, hardware margin.

### Funding Ask & Use of Funds (Placeholders)
- Ask: [UGX/USD Amount] for [X%] equity OR via SAFE ([Valuation Cap], [Discount]% discount).
- Use of funds:
  - Product & Engineering: [X%]
  - Integrations & Compliance (EFRIS, payments): [X%]
  - Sales & Marketing: [X%]
  - Customer Success & Support: [X%]
  - Operations & Working Capital: [X%]
- Milestones to next round: [#] paying sites, EFRIS GA, gross margin [X%], churn < [X%].

### Risks & Mitigations
- Integration timelines (EFRIS, payments) — phased rollouts, partner SLAs.
- Merchant onboarding friction — simplified setup flows, in-person onboarding kits.
- Competition undercutting — local service, faster iteration, value-based pricing.
- Data reliability — backup policy, monitoring, and support SLAs.

### Implementation Plan for The Address Food Court (Pilot)
- Scope: [#] tills, [#] kitchens/printers, [operating hours].
- Hardware: Thermal printers ([models]), cash drawers, barcode scanners, tablets/PCs.
- Timeline: Week 1 setup/training; Weeks 2–3 pilot; Week 4 go-live + SLA.
- Success metrics: Avg checkout time, shrinkage reduction, stock-out incidents, daily sales visibility, staff compliance.
- Support: Onsite go-live, WhatsApp hotline, weekly check-ins for first month.

### KPIs We Will Track
- Daily sales, average order value, gross margin.
- Stock turn, low-stock incidents, variance/shrinkage.
- Shift variances (cash over/short), expense leakage.
- System usage (active users, session duration), uptime.

### Future Uganda-Focused Enhancements (Investor-Facing Roadmap)
- Compliance & Tax
  - URA EFRIS e-invoicing: direct API integration, fiscal QR codes on receipts, automated invoice posting. [Target: Q[ ] / [Year]]
  - VAT and WHT handling: VAT rates, withholding tax on supplier invoices, compliant receipt numbering sequences.
  - TIN capture and compliant invoice templates (B2B/B2C) aligned to URA requirements.

- Mobile Money & Payments
  - MTN MoMo and Airtel Money APIs: push-to-pay, payment links, QR/USSD deep links, automatic reconciliation by reference. [Pilot with: [Partner]]
  - Aggregators (e.g., Yo! Uganda, Pegasus, Flutterwave/Paystack where applicable) for redundancy and better rates.
  - Tipping, service charge, and cash-rounding workflows tailored to hospitality.

- Inventory, Food Costing & Procurement
  - Recipes/BOM and yield management; wastage tracking; theoretical vs actual cost variance dashboards.
  - Procurement suite: suppliers, POs, GRNs, price lists, lead times, and re-order point logic.
  - Multi-warehouse/branch stock, batch/lot/expiry tracking (FMCG, bakeries), barcode/label printing.

- Operations & Kitchen
  - KOT/KDS with station routing (grill, fryer, bar), order status and recall, kitchen timers.
  - Table management, delivery/takeaway, split/merge bills, course firing, menu schedules/happy hour.
  - Driver/rider dispatch logs and handover reports for takeout/delivery.

- Analytics & Management Reporting
  - Multi-branch dashboards, consolidated P&L, cohort retention, product mix, and staff KPIs.
  - Exception reports: cash-up variances, voids/returns heatmaps, discount misuse; anomaly detection alerts.
  - Budget vs actuals, seasonal forecasting, demand planning; automated reorder suggestions.

- Customer Experience & Loyalty
  - Points-based and tiered loyalty; vouchers/gift cards; household/customer profiles with visit frequency.
  - CRM and campaign tools: SMS/WhatsApp promos, birthday offers; opt-in consent management.

- Integrations (Local-first)
  - Accounting: Sage 50, QuickBooks Online; export packs for auditors (.csv/.xlsx mapping to local charts).
  - HR/Payroll: [Local partner], staff attendance exports; rota import.
  - E-commerce & Delivery: WooCommerce/Shopify connectors; Glovo/bolt-food style order ingestion (where available).
  - Messaging: WhatsApp Business Cloud API for receipts and order updates.

- Reliability, Offline & Support
  - Offline-first POS with seamless sync; local print spooling for uninterrupted operations.
  - Automated encrypted backups, monitoring/alerting, and business-hour/on-call SLAs.
  - Self-serve help center, in-product walkthroughs, and WhatsApp support bot.

- Hardware & IoT
  - Support Android POS terminals, rugged handhelds, kitchen screens, and fiscal printers if mandated.
  - Weighing scale integration (butchery/bulk), cash drawer status sensing, CCTV POS overlay.

- Localization & UX
  - UGX-first UX, English/Luganda labels, 24h time, local date formats; regional tax presets.
  - Receipt templates for brands (food courts, bars, bakeries); multi-language receipts.

- Governance & Enterprise Controls
  - Fine-grained permissions, audit trails, maker-checker approvals for price changes/voids/discounts.
  - Multi-tenant parent-child orgs, SSO (Google/Microsoft) for enterprise buyers.

- Data & AI Assist
  - Forecasting (time-series models) for purchasing; dynamic reorder points; menu engineering suggestions.
  - Fraud detection signals (void/discount anomalies), staff performance scoring, and smart shift cash-up guidance.

Investor note: Each capability above has a clear business outcome (shrinkage ↓, speed ↑, compliance ↑). We will phase delivery by ROI and publish per-feature KPIs. [Insert 3–5 target KPIs with baseline → target].

### Appendices
1) Feature Checklist (Current MVP)
- POS checkout: cash, credit, MoMo (MTN), Airtel Money
- Receipts: custom logo/header/footer; reprint
- Inventory: categories, stock, cost price, low-stock alerts
- Staff & shifts: roles, open/close shift, logs
- Expenses: capture & tie to shift
- Credit sales: customer name/phone; unpaid status
- Reports: sales charts; export to Excel/PDF; transaction history
- Accounting foundation: chart of accounts, vouchers, voucher entries

2) Architecture Overview
- React frontend (Vite, Tailwind, Radix UI) -> Express API (JWT) -> MySQL
- Image optimization for product catalogs; role-based access; rate limiting
- Deployment: Railway/Render backend; Vercel/Netlify frontend

3) References & Case Studies (Placeholders)
- Pilot case study: [Client Name] — before/after KPIs
- Testimonials: “[Quote]” — [Owner/Manager]

---

Notes for customization:
- Replace all [placeholders] with your numbers, names, and timelines.
- Add 2–4 screenshots of the admin dashboard, sales screen, and a sample receipt.
- Confirm regulatory scope for EFRIS based on client category before committing timelines.

