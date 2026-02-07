# DOKi QC Tool — Product Requirements Document

## 1. Overview

### 1.1 Purpose
DOKi QC Tool is an internal web application for DOKi, a manufacturer of premium meat-based snacks. The tool provides end-to-end quality control traceability across the entire manufacturing process — from raw material intake to packaged product — enabling data-driven quality management, yield optimization, and regulatory compliance readiness.

### 1.2 Problem Statement
- Factory workers are low-skilled and cannot directly interact with digital systems
- Quality data is currently unstructured and difficult to analyze
- No centralized system exists to track batches, yields, or QC outcomes
- Weight loss across manufacturing stages is not systematically monitored
- No alerts exist for out-of-spec measurements

### 1.3 Solution
A web-based QC management tool where:
1. The system generates **printable bilingual (English + Hindi) paper forms** for each product and stage
2. Workers fill in measurements on paper during production
3. Workers photograph completed forms and send to a manager
4. Managers upload photos to the system, which uses **OCR** to extract data
5. Extracted data is validated, correctable, and committed to the database
6. A **dashboard** provides real-time visibility into batch status, yield/loss, QC outcomes, and trends

### 1.4 Users
| Role | Count | Access |
|------|-------|--------|
| Owner/Admin | 1 | Full access — all features, settings, user management |
| Manager | 1-2 | Upload forms, view dashboard, approve QC, manage batches |
| (Future) QC Staff | TBD | Limited access to QC approval workflows |

### 1.5 Scale
- 1-10 batches per day across all product lines
- 4 product types, 1-5 flavours each (up to ~20 SKUs)
- Single factory location (expandable in future)

---

## 2. Product Catalog

### 2.1 Product Lines

| Product | Code | Category | Marination | Dehydration | Frying | Flavours |
|---------|------|----------|------------|-------------|--------|----------|
| Buffalo Jerky | BJ | Jerky | Yes | Yes | No | 5 |
| Chicken Jerky | CJ | Jerky | Yes | Yes | No | 5 |
| Chicken Chips | CC | Chips | No (seasoning post-fry) | Yes | Yes | 4 |
| Pork Puffs | PP | Puffs | No (seasoning post-fry) | Yes | Yes | 2 |

**Total SKUs: 16**

### 2.2 Flavour Catalog

| Product | Flavours |
|---------|----------|
| Buffalo Jerky | Kerala Fry, Teriyaki, Gochujang, Smokey Masala Buff, Pepper |
| Chicken Jerky | Teriyaki, Gochujang, Smokey Masala, Karnataka Nati, Murgh Mughlai |
| Chicken Chips | Cheddar Cheese, Sea Salt, Amritsari Achari, Portuguese Peri-Peri |
| Pork Puffs | Amritsari Achari, Portuguese Peri-Peri |

### 2.3 Flavour Management
- Flavours are configurable in the system — the admin can add, edit, or archive flavours
- Each unique product + flavour combination constitutes a **SKU**
- SKU format suggestion: `DOK-{PRODUCT_CODE}-{FLAVOUR_CODE}-{VERSION}` (e.g., `DOK-BJ-KF-01` for Buffalo Jerky Kerala Fry)

### 2.4 Product Configuration
The system should allow the admin to:
- Add new products and flavours
- Define the manufacturing process flow per product (ordered list of stages)
- Define which measurements are required at each stage
- Set acceptable ranges for each measurement (used for alerts)
- Archive discontinued products/flavours without deleting historical data

### 2.5 Process Flow Builder (Easy Tweaking)
A core design requirement is that **process flows are fully configurable by the admin via the UI** — no code changes should ever be needed to add, remove, reorder, or modify stages.

**Stage Management:**
- **Add a stage**: Insert a new stage at any position in the flow (e.g., add a "resting" step between marination and dehydration)
- **Remove a stage**: Mark a stage as inactive/skipped — it disappears from new batch forms but historical data for that stage is preserved
- **Reorder stages**: Drag-and-drop to change stage sequence
- **Edit a stage**: Rename, change which fields are collected, modify acceptable ranges

**Field Management (per stage):**
- Add new measurement fields to any stage (with label in EN + HI, unit, data type, min/max range)
- Remove fields from a stage (historical data preserved)
- Mark fields as required or optional
- Reorder fields within a stage

**Safeguards:**
- Changes only apply to **new batches** — in-progress batches continue with the flow they started with
- A version history of process flow changes is maintained (who changed what, when)
- A "preview" mode lets the admin see the updated paper form before publishing changes
- QC gate designation can be toggled on/off per stage

**Why this matters:** As DOKi learns which steps are redundant, too granular, or missing, the process can evolve without developer involvement. This is a drag-and-drop, no-code configuration — not a settings file or database edit.

---

## 3. Manufacturing Process Flows

### 3.1 Buffalo Jerky & Chicken Jerky

```
Stage 1: Raw Material Intake
  → Record: supplier, lot number, weight, date received, visual inspection (pass/fail)

Stage 2: Incoming QC
  → Record: smell test (pass/fail + notes), pH level, temperature
  → Gate: Must pass smell test and pH within range to proceed

Stage 3: Cutting
  → Record: weight before cutting, weight after cutting, cut type/size, operator name

Stage 4: Marination
  → Record: weight pre-marination, marinade recipe/batch, marination start time,
             marination end time, weight post-marination, temperature during marination

Stage 5: Dehydration
  → Record: weight pre-dehydration, temperature setpoint,
             actual temperature (periodic readings), humidity setpoint,
             actual humidity (periodic readings), start time, end time,
             weight post-dehydration

Stage 6: Final QC
  → Record: water activity (Aw), taste test (pass/fail + notes, tester name),
             texture test (pass/fail + notes, tester name), visual inspection,
             final weight, yield percentage (calculated)

Stage 7: Packaging
  → Record: package weight, package count, label verification (pass/fail),
             seal integrity check (pass/fail), best before date, batch label printed
```

### 3.2 Chicken Chips

```
Stage 1: Raw Material Intake
  → Record: supplier, lot number, weight, date received, visual inspection (pass/fail)

Stage 2: Thawing
  → Record: thaw start time, thaw end time, temperature start, temperature end, weight post-thaw

Stage 3: Cutting & Mincing
  → Record: weight pre-cut, cut into small pieces, minced, weight post-mince

Stage 4: Dough Preparation
  → Record: dough ingredients/recipe batch, weight of dough, shaped into cylindrical pieces,
             piece count (approx)

Stage 5: Boiling
  → Record: boil start time, boil end time, water temperature, weight post-boil

Stage 6: Chilling
  → Record: chill start time, target duration (8 hours), actual duration,
             temperature in chiller (periodic readings), weight post-chill

Stage 7: Slicing
  → Record: weight pre-slice, slice thickness, weight post-slice, piece count (approx)

Stage 8: Dehydration
  → Record: weight pre-dehydration, temperature setpoint,
             actual temperature, humidity, start time, end time, weight post-dehydration

Stage 9: Frying
  → Record: oil type, oil temperature, fry start time, fry end time,
             weight post-fry

Stage 10: Weighing & Seasoning
  → Record: weight post-fry, seasoning/flavour applied, seasoning batch,
             weight post-seasoning

Stage 11: Final QC
  → Record: water activity (Aw), taste test (pass/fail + notes, tester name),
             texture/crunch test (pass/fail + notes, tester name),
             visual inspection, final weight, yield percentage (calculated)

Stage 12: Packaging
  → Record: package weight, package count, label verification (pass/fail),
             seal integrity check (pass/fail), best before date, batch label printed
```

### 3.3 Pork Puffs

```
Stage 1: Raw Material Intake
  → Record: supplier, lot number, weight, date received, visual inspection (pass/fail)

Stage 2: Thawing
  → Record: thaw start time, thaw end time, temperature start, temperature end, weight post-thaw

Stage 3: Cutting & Mincing
  → Record: weight pre-cut, cut into small pieces, minced, weight post-mince

Stage 4: Boiling (no dough step — direct from mince)
  → Record: boil start time, boil end time, water temperature, weight post-boil

Stage 5: Chilling
  → Record: chill start time, target duration, actual duration,
             temperature in chiller (periodic readings), weight post-chill

Stage 6: Slicing
  → Record: weight pre-slice, slice thickness, weight post-slice, piece count (approx)

Stage 7: Dehydration
  → Record: weight pre-dehydration, temperature setpoint,
             actual temperature, humidity, start time, end time, weight post-dehydration

Stage 8: Frying
  → Record: oil type, oil temperature, fry start time, fry end time,
             weight post-fry

Stage 9: Weighing & Seasoning
  → Record: weight post-fry, seasoning/flavour applied, seasoning batch,
             weight post-seasoning

Stage 10: Final QC
  → Record: water activity (Aw), taste test (pass/fail + notes, tester name),
             texture/crunch test (pass/fail + notes, tester name),
             visual inspection, final weight, yield percentage (calculated)

Stage 11: Packaging
  → Record: package weight, package count, label verification (pass/fail),
             seal integrity check (pass/fail), best before date, batch label printed
```

---

## 4. Paper Form System

### 4.1 Overview
Since factory workers are low-skilled and cannot use digital devices during production, data collection happens on pre-printed paper forms. The system must generate these forms.

### 4.2 Form Requirements
- **Bilingual**: All field labels in both English and Hindi
- **Pre-printed fields**: Workers only need to write numbers, check boxes, or circle options
- **Large print**: Easy to read in factory conditions
- **One form per stage per batch**: Each stage of the process gets its own form (or a combined multi-stage form for simpler flows)
- **Pre-filled information**: Batch ID, product name, date, stage name are pre-printed
- **Clear measurement units**: Each field shows the expected unit (kg, g, °C, %, etc.)
- **Structured layout**: Grid/table format optimized for OCR readability

### 4.3 Form Types
1. **Raw Material Intake Form** — Used for all products at Stage 1
2. **Jerky Process Form** — Covers cutting through dehydration for jerky products
3. **Chips/Puffs Process Form** — Covers the multi-stage chips/puffs process
4. **QC Approval Form** — Taste, texture, water activity, and final sign-off
5. **Packaging Form** — Final packaging verification

### 4.4 Form Customization
- Admin can modify form templates via the web interface
- Fields can be added, removed, or reordered
- Custom fields with custom labels (bilingual) can be added
- Forms are exported as printable PDFs (A4 format)

### 4.5 Form Generation Workflow
1. Admin configures product process and form layout in the system
2. System generates a PDF form template
3. When a new batch is created, the system generates batch-specific forms with the batch ID and date pre-filled
4. Forms are printed and distributed to the factory floor

---

## 5. Data Capture Pipeline

### 5.1 Workflow
```
Worker fills paper form
        ↓
Worker photographs form and sends to manager (WhatsApp, etc.)
        ↓
Manager uploads photo to DOKi QC Tool
        ↓
OCR engine extracts data from the image
        ↓
System presents extracted data for review/correction
        ↓
Manager verifies, corrects if needed, and commits data
        ↓
Data is linked to the batch and stage in the database
```

### 5.2 Upload Interface
- Drag-and-drop or click-to-upload photo interface
- Support for multiple photos per upload (e.g., multi-page form)
- Accept JPEG, PNG, HEIC formats (common phone camera formats)
- Image preview with rotation/crop capability
- Batch selector: manager picks which batch and stage the form belongs to

### 5.3 OCR Processing
- The system uses an OCR engine to extract handwritten and printed text from form photos
- The OCR should be tuned for:
  - Numeric data (weights, temperatures, pH values, times)
  - Checkbox detection (pass/fail, yes/no)
  - Handwritten numbers in structured form fields
- **Technology recommendation**: Use a cloud AI vision API (e.g., Google Cloud Vision, AWS Textract, or OpenAI GPT-4 Vision) for high accuracy on handwritten forms
- The form's known structure (field positions, expected data types) is used to improve extraction accuracy

### 5.4 Data Validation & Correction
After OCR extraction, the system shows a side-by-side view:
- **Left**: Original uploaded photo
- **Right**: Extracted data in editable form fields
- Fields with low OCR confidence are highlighted in yellow
- Fields with values outside acceptable ranges are highlighted in red
- Manager can correct any field before committing
- A "confidence score" is shown per field

### 5.5 Data Commit
- Once the manager approves, data is committed to the batch record
- The original photo is stored as an audit trail artifact
- A timestamp and the manager's user ID are recorded with each commit
- Data cannot be deleted after commit — only corrections (with audit trail) are allowed

---

## 6. Batch Traceability

### 6.1 Batch Identification
- Every production run gets a unique **Batch ID**
- Format: `DOK-{YYYYMMDD}-{PRODUCT_CODE}-{SEQ}` (e.g., `DOK-20260207-BJ-001`)
- Batch ID is printed on all forms, packaging labels, and tracked throughout the system

### 6.2 Batch Lifecycle
```
Created → In Progress → QC Pending → QC Approved / QC Rejected → Packaged → Shipped
```

Each stage transition is timestamped and logged.

### 6.3 Supplier Traceability
- Each batch links to a **supplier** and **supplier lot number** for the raw material
- Supplier records include: name, contact, certifications, material type
- In case of a quality issue or recall, the system can:
  - Find all batches from a specific supplier lot
  - Find all batches produced on a specific date
  - Find all batches of a specific product/flavour in a date range

### 6.4 Recall Support
- A "recall" workflow allows marking batches as recalled
- Recall traces backward (which supplier lot?) and forward (which packages?)
- Recalled batches are flagged across the dashboard

---

## 7. QC Measurements & Checkpoints

### 7.1 Measurement Types

| Measurement | Unit | Acceptable Range | When Measured |
|-------------|------|-----------------|---------------|
| Weight | kg / g | Varies by stage | Every stage |
| Temperature | °C | -18 to 200 (varies by stage) | Intake, marination, dehydration, frying, chilling |
| Time/Duration | hours:minutes | Varies | Marination, dehydration, chilling, frying |
| Water Activity (Aw) | 0.00 - 1.00 | See table below | Final QC |
| pH | 0.0 - 14.0 | See table below | Incoming QC |
| Humidity | % RH | Varies | Dehydration environment |
| Smell Test | Pass/Fail | — | Incoming QC |
| Taste Test | Pass/Fail + Notes | — | Final QC |
| Texture Test | Pass/Fail + Notes | — | Final QC |
| Visual Inspection | Pass/Fail + Notes | — | Intake, Final QC, Packaging |

**Water Activity (Aw) Targets by Product:**

| Product | Acceptable Aw Range |
|---------|-------------------|
| Buffalo Jerky | < 0.80 |
| Chicken Jerky | < 0.80 |
| Chicken Chips | 0.20 - 0.26 |
| Pork Puffs | 0.38 - 0.42 |

**pH Targets for Incoming Raw Material:**

| Raw Material | Maximum pH |
|-------------|-----------|
| Red Meat (Buffalo) | ≤ 5.8 |
| Chicken | ≤ 6.0 |
| Pork | ≤ 6.0 |

### 7.2 Acceptable Ranges
- Admin configures acceptable min/max ranges per measurement per product per stage
- When a value falls outside the range, it triggers an alert
- Ranges can be updated over time (historical ranges are preserved)

### 7.3 QC Gates
Certain stages act as **gates** — a batch cannot proceed if:
- Incoming QC: smell test fails or pH is out of range
- Final QC: taste, texture, or Aw fails
- Packaging: seal or label check fails

Failed gates require a **disposition decision**: rework, hold, or reject.

### 7.4 QC Approval Workflow
- Multiple authorized people can perform QC checks
- Each QC check records: tester name, timestamp, result, notes
- For a batch to pass final QC, all required checks must pass
- If any check fails, the batch is flagged and requires a disposition decision by the admin/manager

---

## 8. Alerts & Notifications

### 8.1 Real-Time Alerts
Triggered immediately when:
- A measurement falls outside the configured acceptable range
- A QC gate fails (smell, taste, texture, Aw, pH)
- A batch has been in a stage longer than expected (e.g., chilling > 10 hours)
- OCR confidence on a critical field is below threshold

**Delivery**: In-app notification banner + optional email/WhatsApp notification

### 8.2 Daily Summary Report
Generated automatically at end of day, containing:
- Total batches processed today
- Batches currently in progress (and which stage)
- QC pass/fail summary
- Any out-of-range measurements flagged
- Yield summary per product
- Alerts triggered during the day

**Delivery**: Email to admin/managers + viewable in-app

### 8.3 Alert Configuration
- Admin can configure which measurements trigger alerts
- Admin can set alert thresholds (different from acceptable ranges if desired)
- Alerts can be snoozed or acknowledged with a note

---

## 9. Dashboard & Visualization

### 9.1 Home / Overview Dashboard
A single-page overview showing:

**Active Batches Panel**
- Cards or rows for each batch currently in production
- Each shows: Batch ID, product, flavour, current stage, time in current stage, status color (green/yellow/red)

**Today's Summary**
- Batches started / completed / in progress
- QC pass rate (%)
- Total yield (%)
- Active alerts count

### 9.2 Yield & Loss Tracking Dashboard
The primary analytical view for understanding weight loss at each stage.

**Weight Waterfall Chart**
- For a selected batch: a waterfall/funnel chart showing weight at each stage
- Clearly shows where the biggest losses occur (cutting, dehydration, frying)

**Yield Trend Line**
- Yield % over time, filterable by product and flavour
- Compare yield across batches to spot consistency issues

**Stage-by-Stage Loss Table**
- Average weight loss (%) at each stage, by product
- Highlight stages with higher-than-normal loss

**Loss Comparison**
- Compare yield between: products, flavours, time periods, suppliers

### 9.3 QC Dashboard
**Pass/Fail Rates**
- Bar chart: QC pass/fail rates by product, by week/month
- Trend line: pass rate over time

**Failure Analysis**
- Breakdown of failure reasons (taste, texture, Aw, pH, smell)
- Frequency of each failure type

**Water Activity Trend**
- Aw readings over time, with the acceptable range band shown
- Scatter plot: Aw vs. dehydration time/temperature

**pH Tracking**
- pH readings at incoming QC over time
- Grouped by supplier to detect supplier-level quality issues

### 9.4 Batch Detail View
Clicking on any batch opens a detailed timeline:
- Full stage-by-stage timeline with timestamps
- All measurements at each stage
- Photos of original paper forms
- QC results and approver names
- Yield calculation with breakdown
- Any alerts triggered during this batch

### 9.5 Supplier Analysis Dashboard
- Quality metrics grouped by supplier
- Average pH, visual pass rate, rejection rate per supplier
- Trend over time per supplier

### 9.6 Dashboard Filters
All dashboards support filtering by:
- Date range
- Product type
- Flavour
- Supplier
- Batch status
- QC result (pass/fail)

---

## 10. User Roles & Access Control

### 10.1 Roles

| Role | Permissions |
|------|------------|
| Admin | Full access: configure products, stages, forms, ranges, users, view all data, manage alerts, export data |
| Manager | Upload forms, view dashboard, approve QC, create batches, view reports |
| (Future) Viewer | Read-only dashboard access |
| (Future) QC Approver | Can only perform and record QC checks |

### 10.2 Authentication
- Email + password login (simple, given 1-3 users)
- Future: SSO integration if needed
- Session-based auth with secure token management

### 10.3 Audit Trail
- Every data entry, correction, and approval is logged with user ID and timestamp
- Audit log is viewable by admin
- Data corrections show both old and new values

---

## 11. Compliance & Future-Proofing

### 11.1 Current State
No formal regulatory compliance is required at launch. However, the system architecture must support future compliance with:

### 11.2 FSSAI (Food Safety and Standards Authority of India)
- Batch traceability (already included)
- Record retention for minimum 2 years
- Temperature monitoring records
- Hygiene and sanitation checklists (can be added as form types)

### 11.3 FDA (US Food & Drug Administration)
- 21 CFR Part 117 (Current Good Manufacturing Practice)
- HARPC (Hazard Analysis and Risk-Based Preventive Controls)
- Traceability from supplier to customer (FSMA 204)

### 11.4 HACCP
- Critical Control Points (CCPs) can be mapped to QC gates
- Monitoring records at each CCP (already captured)
- Corrective action records (disposition decisions)
- Verification procedures (QC approval workflow)

### 11.5 Architecture Requirements for Compliance
- All data must be immutable once committed (append-only corrections)
- Original paper form photos stored as evidence
- Full audit trail on all data changes
- Data export in standard formats (CSV, PDF reports)
- Data retention: minimum 2 years (configurable)
- Digital signature support for QC approvals (future)

---

## 12. Technical Architecture

### 12.1 Recommended Stack

| Layer | Technology | Rationale |
|-------|-----------|-----------|
| Frontend | Next.js (React) + Tailwind CSS | Modern, fast, great for dashboards, SSR for initial loads |
| Charts | Recharts or Tremor | Beautiful, React-native charting libraries |
| Backend | Next.js API Routes (or separate Node/Express if needed) | Simple for 1-3 users, co-located with frontend |
| Database | PostgreSQL | Relational, ACID-compliant, perfect for traceability data |
| ORM | Prisma | Type-safe database access, great migration support |
| OCR | Google Cloud Vision API or GPT-4 Vision API | Best accuracy for handwritten form extraction |
| File Storage | AWS S3 or Google Cloud Storage | Store uploaded form photos |
| Auth | NextAuth.js | Simple auth for small user base |
| Hosting | Vercel (frontend) + managed PostgreSQL (Supabase/Neon) | Low maintenance, auto-scaling |
| Notifications | Email (Resend/SendGrid) + WhatsApp Business API (optional) | Alerts and daily reports |

### 12.2 Key Architecture Decisions
- **Monorepo**: Single Next.js app with API routes — simple for the scale
- **Immutable records**: All batch data uses append-only pattern (no UPDATE/DELETE on measurement records)
- **Photo storage**: Uploaded images stored in cloud object storage, referenced by URL in the database
- **OCR pipeline**: Async processing — upload triggers OCR job, results returned to the user for validation
- **Form templates**: Stored as JSON schema in the database, rendered to PDF via a PDF generation library (e.g., `@react-pdf/renderer` or `puppeteer`)

---

## 13. Data Model

### 13.1 Core Entities

```
Supplier
├── id, name, contact_info, certifications, created_at, updated_at

Product
├── id, name, code, category (jerky/chips/puffs), active, created_at
└── has_many: Flavours, ProcessStages

Flavour
├── id, product_id, name, code, active, created_at

ProcessStage
├── id, product_id, name, order, is_qc_gate, created_at
└── has_many: StageFields

StageField
├── id, stage_id, name, label_en, label_hi, field_type (number/text/boolean/select),
│   unit, min_value, max_value, required, order

Batch
├── id, batch_code, product_id, flavour_id, supplier_id, supplier_lot,
│   status (created/in_progress/qc_pending/qc_approved/qc_rejected/packaged/shipped/recalled),
│   created_by, created_at, updated_at
└── has_many: StageRecords, Alerts

StageRecord
├── id, batch_id, stage_id, started_at, completed_at, recorded_by, committed_by,
│   committed_at, form_photo_urls[], ocr_confidence_avg
└── has_many: Measurements

Measurement
├── id, stage_record_id, field_id, value, ocr_raw_value, ocr_confidence,
│   is_corrected, corrected_from, recorded_at

QCApproval
├── id, batch_id, stage_record_id, approver_name, result (pass/fail),
│   taste_pass, taste_notes, texture_pass, texture_notes,
│   smell_pass, smell_notes, visual_pass, visual_notes,
│   water_activity, ph_level, disposition (proceed/rework/hold/reject),
│   approved_at

Alert
├── id, batch_id, stage_record_id, measurement_id, type (out_of_range/gate_fail/timeout/low_confidence),
│   severity (warning/critical), message, acknowledged_by, acknowledged_at, created_at

AuditLog
├── id, user_id, action, entity_type, entity_id, old_value, new_value, timestamp

User
├── id, email, name, role (admin/manager), password_hash, created_at

FormTemplate
├── id, product_id, name, template_json, pdf_url, version, created_at, updated_at

DailySummary
├── id, date, total_batches, completed_batches, avg_yield, qc_pass_rate,
│   alerts_count, report_json, generated_at
```

### 13.2 Key Relationships
- A **Batch** belongs to a Product + Flavour and is linked to a Supplier
- A **Batch** has many **StageRecords** (one per manufacturing stage completed)
- Each **StageRecord** has many **Measurements** (one per field recorded)
- **QCApprovals** are linked to specific batches and QC stage records
- **Alerts** can be linked to specific measurements, stages, or batches
- **AuditLog** tracks every change across the system

---

## 14. MVP Scope & Phasing

### Phase 1 — MVP (Target: 4-6 weeks)
- Product and flavour configuration
- Process flow definition for all 4 products
- Batch creation and lifecycle management
- Paper form generation (PDF, bilingual)
- Photo upload with OCR data extraction
- Data validation and correction interface
- Basic dashboard (active batches, today's summary)
- Yield waterfall chart per batch
- User auth (admin + manager)

### Phase 2 — Analytics & Alerts (2-3 weeks after MVP)
- Full dashboard suite (yield trends, QC analysis, supplier analysis)
- Real-time alerts (in-app + email)
- Daily summary reports
- QC gate enforcement
- Alert configuration and management

### Phase 3 — Compliance & Advanced (Ongoing)
- FSSAI/FDA/HACCP compliance templates and reports
- Data export (CSV, PDF compliance reports)
- Digital signatures for QC approvals
- WhatsApp notification integration
- Recall management workflow
- Multi-factory support

---

## 15. Success Metrics

| Metric | Target |
|--------|--------|
| Data capture time per batch | < 5 minutes (upload + verify) |
| OCR accuracy on numeric fields | > 90% (reducing manual corrections) |
| Dashboard load time | < 2 seconds |
| QC gate compliance | 100% of batches go through required gates |
| Yield visibility | Every stage's weight loss tracked for 100% of batches |
| Alert response time | Critical alerts acknowledged within 1 hour |

---

## 16. Resolved Decisions & Assumptions

### Resolved Decisions
| Question | Decision |
|----------|----------|
| Flavour catalog | Buffalo Jerky (5), Chicken Jerky (5), Chicken Chips (4), Pork Puffs (2) — see Section 2.2 |
| Equipment tracking | Not needed — single equipment per type, no IDs required |
| Water Activity (Aw) ranges | Jerky < 0.80, Chicken Chips 0.20-0.26, Pork Puffs 0.38-0.42 |
| pH ranges | Red meat ≤ 5.8, Chicken ≤ 6.0, Pork ≤ 6.0 |
| Barcode/QR on packaging | Not at launch — may be added in a future phase |
| Data retention | 2 years minimum |
| Paper form language | Bilingual (English + Hindi), pre-printed, system-generated with admin customization |
| Data capture method | Photo upload with OCR (workers send photos to manager via WhatsApp) |
| Production scale | Small: 1-10 batches/day |

### Assumptions
- Workers have access to a phone camera (personal or shared) to photograph forms
- WhatsApp or similar messaging is already used for worker-manager communication
- Internet connectivity is available at the factory for the management office
- The admin/manager has basic computer literacy to use a web application
- Single factory location (multi-factory support deferred to Phase 3)
