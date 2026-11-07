# Solar Business Platform — Database Architecture & Security Specification (Phase 3 Hardened Enterprise Release)

## 1. Executive Summary & Security Overview

This document specifies the enterprise-grade PostgreSQL relational architecture, security model, and Row Level Security (RLS) enforcement for the **Nowshera Solar Solutions** commercial solar business platform.

The system is designed for **Next.js 16 App Router**, **Supabase PostgreSQL**, **Supabase Auth**, and **Supabase Storage**. It adheres to the highest database security standards:
- **Financial Precision**: All monetary calculations utilize `NUMERIC(12,2)`. Floating-point types are strictly forbidden.
- **Timezone Standardization**: Timestamps are stored in `TIMESTAMPTZ` (UTC internally), with business presentation localized to `Asia/Karachi` (UTC+5).
- **Hardened SECURITY DEFINER Execution**: Every `SECURITY DEFINER` function explicitly defines `SET search_path = public, pg_temp` to prevent search_path injection attacks (CVE-2018-1058 pattern).
- **RLS & View Security**: Views specify `WITH (security_invoker = true)` and apply publication and component-status filtering, preventing bypass of underlying table RLS.
- **Explicit Principle of Least Privilege Grants**: Table-level permissions are revoked by default. Ordinary users (`anon`, `authenticated`) have write access revoked on historical logs (`price_history`, `audit_logs`).
- **Concurrency-Safe Operations**: Transaction-level advisory locks (`pg_advisory_xact_lock`) protect critical race-condition boundaries (owner bootstrapping, owner deletion/demotion, offer assignment, price changes).

---

## 2. Table Specifications & Relationships

```
                                  ┌───────────────────┐
                                  │    auth.users     │
                                  └─────────┬─────────┘
                                            │ 1:1
                                            ▼
                                  ┌───────────────────┐
                                  │     profiles      │ (owner, admin, staff)
                                  └─────────┬─────────┘
                                            │
               ┌────────────────────────────┼────────────────────────────┐
               │                            │                            │
               ▼                            ▼                            ▼
      ┌─────────────────┐          ┌─────────────────┐          ┌─────────────────┐
      │   categories    │          │     brands      │          │   audit_logs    │
      └────────┬────────┘          └────────┬────────┘          └─────────────────┘
               │ 1:N                        │ 1:N
               └──────────────┬─────────────┘
                              ▼
                     ┌─────────────────┐
                     │    products     │◄───────────────────┐
                     └────────┬────────┘                    │
                              │                             │
         ┌────────────────────┼────────────────────┐        │
         ▼                    ▼                    ▼        │
┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┴─┐
│ product_images  │  │  price_history  │  │   package_items   │
└─────────────────┘  └─────────────────┘  └────────┬──────────┘
                              ▲                    │ N:1
                              │                    ▼
                              │           ┌───────────────────┐
                              └───────────┤     packages      │
                                          └────────┬──────────┘
                                                   │
               ┌───────────────────────────────────┼───────────────────────────────────┐
               ▼                                   ▼                                   ▼
      ┌─────────────────┐                 ┌─────────────────┐                 ┌─────────────────┐
      │ offer_products  │                 │ offer_packages  │                 │    inquiries    │
      └────────▲────────┘                 └────────▲────────┘                 └─────────────────┘
               │                                   │
               └─────────────────┬─────────────────┘
                                 │
                        ┌────────┴────────┐
                        │     offers      │
                        └─────────────────┘
```

### 2.1. Profiles & Permissions (`profiles`)
- **Key Columns**:
  - `id`: `UUID` (PK, references `auth.users(id) ON DELETE CASCADE`).
  - `role`: `user_role` enum (`owner`, `admin`, `staff`). Default: `staff`.
  - `full_name`: `TEXT` (Validated: 2–100 characters).
  - `phone`: `TEXT` (Validated: 7–25 characters).
  - `is_active`: `BOOLEAN` (Default: `true`).
  - `created_at`, `updated_at`: `TIMESTAMPTZ`.
- **Triggers**:
  - `on_auth_user_created`: Automatically creates a profile record with strict `staff` role upon Supabase Auth registration.
  - `trg_prevent_role_escalation`: Blocks non-owners from elevating roles or modifying account activation status.
  - `trg_prevent_last_owner_deletion`: Blocks deletion of the last active owner account.

### 2.2. Product Catalogue (`categories`, `brands`, `products`, `product_images`)
- **`categories`**: Product classifications (Panels, Inverters, Batteries, Mounting Structures, Accessories). Slugs are validated via `^[a-z0-9]+(?:-[a-z0-9]+)*$`.
- **`brands`**: Equipment manufacturers with tier ratings (e.g. "Tier 1").
- **`products`**:
  - SKU and slug are unique and validated via regular expressions.
  - `specifications`: `JSONB` parameter tree indexed with GIN for fast hardware querying.
  - `regular_price`: `NUMERIC(12,2)` checked `>= 0`.
  - `inventory_status`: `stock_status` (`in_stock`, `out_of_stock`, `available_on_order`).
  - `publication_status`: `publication_status` (`draft`, `published`, `archived`).
- **`product_images`**: Multi-image gallery with `display_order` sorting and a partial unique index `idx_product_images_unique_primary` on `(product_id) WHERE is_primary = true`.

### 2.3. Packages & Bill of Materials (`packages`, `package_items`)
- **`packages`**: Complete turnkey solar systems (e.g., 5kW Residential Hybrid, 10kW On-Grid Industrial).
  - `capacity_kw`: `NUMERIC(6,2)` checked `> 0`.
  - `installation_cost`: `NUMERIC(12,2)` checked `>= 0`.
  - `additional_costs`: `NUMERIC(12,2)` checked `>= 0`.
  - `manual_price_override`: `NUMERIC(12,2)` (nullable; checked `>= 0`).
  - `publication_status`: `publication_status`.
- **`package_items`**: Junction linking package to constituent products with `quantity > 0` and unique constraint `(package_id, product_id)`.

### 2.4. Promotional Offers (`offers`, `offer_products`, `offer_packages`)
- **`offers`**:
  - `discount_type`: `percentage`, `fixed_amount`, `special_price`.
  - `discount_value`: `NUMERIC(12,2)` checked `> 0`.
  - Validation: `end_time > start_time`.
  - Validation: If `percentage`, `discount_value <= 100`.

### 2.5. Price History & Audits (`price_history`, `audit_logs`)
- **`price_history`**:
  - Automatically records initial prices on creation and all subsequent price changes for products and packages.
  - Foreign keys use `ON DELETE SET NULL` with snapshot columns `item_name` and `item_sku`.
  - Non-destructive: Historical financial records remain intact if a catalogue item is retired.
  - Direct write permissions are completely revoked from regular users.
- **`audit_logs`**:
  - Immutable table with direct write access revoked from `anon`, `authenticated`, and `PUBLIC`.
  - Populated exclusively via trusted trigger functions.

### 2.6. Customer Enquiries (`inquiries`)
- Captures customer leads and WhatsApp quotation inquiries.
- Enforces strict input validation, server-side UUID and timestamp generation, and blocks public visitors from setting internal workflow fields.

---

## 3. Owner Bootstrap & Privilege Elevation Defense

### 3.1. Vulnerabilities Addressed
1. **Public Execution Block**: `bootstrap_owner(p_user_email TEXT)` has execution revoked from `PUBLIC`, `anon`, and `authenticated`. Only `service_role` can invoke it.
2. **Concurrency Serialization**: Protected with transaction-level advisory lock `pg_advisory_xact_lock(hashtext('owner_count_lock'))`.
3. **No Client-Settable Session Settings**: Removed the caller-settable `app.bootstrapping` flag. The role-protection trigger verifies whether the caller is `service_role` when no owner currently exists.
4. **Last Active Owner Protection**: Triggers acquire `pg_advisory_xact_lock(hashtext('owner_count_lock'))` and re-count active owners. Deactivating, demoting, or deleting the last active owner raises an exception.

### 3.2. Secure One-Time Setup Procedure
When deploying the platform:
```sql
-- Run inside Supabase Dashboard SQL Editor (which executes with service_role privileges):
SELECT public.bootstrap_owner('admin@nowsherasolar.com');
```
Once executed, the function permanently disables itself:
`Bootstrap denied: An owner already exists in the system.`

---

## 4. Hybrid Package Pricing Model

### 4.1. Separation of Concerns
```
┌────────────────────────────────────────────────────────┐
│                   Component Products                   │
│   Sum of (current product regular_price × quantity)    │
└──────────────────────────┬─────────────────────────────┘
                           │ = component_total
                           ▼
┌────────────────────────────────────────────────────────┐
│                   Package Fixed Costs                  │
│   + installation_cost (e.g. wiring, labor, mountings)  │
│   + additional_costs  (e.g. net-metering, delivery)    │
└──────────────────────────┬─────────────────────────────┘
                           │ = calculated_price
                           ▼
┌────────────────────────────────────────────────────────┐
│               Decoupled Selling Baseline               │
│   manual_price_override IS NOT NULL?                   │
│   ├─ YES ──► regular_selling_price = override          │
│   └─ NO  ──► regular_selling_price = calculated_price  │
└──────────────────────────┬─────────────────────────────┘
                           │
                           ▼
┌────────────────────────────────────────────────────────┐
│            Dynamic Promotional Price Engine            │
│   Active scheduled offer in effect?                    │
│   ├─ YES ──► promotional_price (discounted)            │
│   └─ NO  ──► promotional_price = regular_selling_price │
└────────────────────────────────────────────────────────┘
```

### 4.2. View Security & Draft Component Isolation
`public.package_pricing_view` is declared with `WITH (security_invoker = true)`:
```sql
WHERE (
  public.is_active_staff() OR 
  (pkg.publication_status = 'published' AND COALESCE(items.has_unpublished_components, false) = false)
);
```
- **Draft Component Isolation**: If ANY constituent product in a package is draft or archived, the package is automatically excluded from public view and calculations.
- **Resolvers**:
  - `public.get_package_calculated_price(p_package_id)`: Returns 0 rows to anonymous users if package is unpublished or contains draft components.
  - `public.get_effective_package_price(p_package_id, p_at_time)`: Returns 0 rows to anonymous users for unpublished packages. Resolves offers deterministically (`ORDER BY off.discount_value DESC, off.start_time ASC, off.id ASC LIMIT 1`) and guarantees promotional price never exceeds regular selling price (`LEAST(...)`).

---

## 5. Offers, Discounts & Concurrency Protection

### 5.1. Concurrency-Safe Overlap Prevention
When creating or modifying an offer, or assigning items:
- Triggers acquire advisory locks on target products/packages:
  ```sql
  PERFORM pg_advisory_xact_lock(hashtext('product_offer_' || product_id::text));
  PERFORM pg_advisory_xact_lock(hashtext('package_offer_' || package_id::text));
  ```
- Triggers check range collisions using PostgreSQL range overlap operator `&&` on `tstzrange(start_time, end_time)`. Concurrent transactions targeting the same item are serialized.

### 5.2. Special Price Sanity & Revalidation
1. **On Offer Assignment**: Triggers reject special prices that are `>= regular_price` (products) or `>= final_selling_price` (packages).
2. **On Offer Update**: Re-evaluates all assigned products and packages if `discount_value` or `discount_type` changes.
3. **On Product/Package Price Drop**: Triggers on `products` and `packages` check active/scheduled special-price offers. Dropping a regular selling price below an active special promotional price is strictly rejected.

### 5.3. Timestamp-Based Automatic Scheduling
Calculated in real-time based on `NOW()` (or custom `p_at_time`):
- `percentage`: `ROUND(regular * (1 - value/100.0), 2)`
- `fixed_amount`: `GREATEST(0, regular - value)`
- `special_price`: `value`
No background crons or browser jobs are required. Activation and expiration are instantaneous.

---

## 6. Price History & Component Auditing

### 6.1. Non-Destructive Integrity
`price_history` foreign keys use `ON DELETE SET NULL`, while persisting:
- `item_name`: Snapshot of product or package title.
- `item_sku`: Snapshot of SKU or slug.
- `changed_by_system`: Captures `service_role` when operations run without an interactive `auth.uid()`.

### 6.2. Tracked Changes
Triggers automatically record entries in `price_history` for:
1. Initial creation of products and package prices (`AFTER INSERT`).
2. `products.regular_price` updates.
3. `packages.manual_price_override` updates and **removals** (recorded accurately with `new_price = NULL` and reason: *"Manual price override removed. Reverted to dynamic calculated component price."*).
4. `packages.installation_cost` updates.
5. `packages.additional_costs` updates.
6. `package_items` component additions, quantity adjustments, and removals.

---

## 7. Customer Enquiries & Staff Restrictions

### 7.1. Public Anti-Abuse Controls
1. **Input Validation**: Check constraints enforce lengths and valid email syntax.
2. **Sanitization Trigger (`trg_sanitize_public_inquiry`)**:
   - Forces `status := 'new'`
   - Forces `assigned_to := NULL`
   - Forces `internal_notes := NULL`
   - Overwrites client-supplied IDs with `gen_random_uuid()`
   - Overwrites client-supplied timestamps with `NOW()`
   - **Published-Only References**: Verifies that public inquiries can only link to published products or packages. Linking to draft items is rejected.
3. **RLS Policy**:
   ```sql
   CREATE POLICY "Public can insert inquiries with initial defaults"
     ON public.inquiries FOR INSERT
     WITH CHECK (status = 'new' AND assigned_to IS NULL AND internal_notes IS NULL);
   ```

### 7.2. Staff Update Restrictions (`trg_restrict_inquiry_updates_by_staff`)
Non-admin staff members:
- Can only update `status` and `internal_notes`.
- Cannot modify customer contact details or enquiry messages.
- Cannot modify the primary key ID.
- Can only claim unassigned inquiries for themselves; cannot reassign to other staff.

---

## 8. Audit Logs & System Tampering Defenses

1. `audit_logs` has all write permissions (`INSERT`, `UPDATE`, `DELETE`, `TRUNCATE`) revoked from `anon`, `authenticated`, and `PUBLIC`.
2. Triggers run with `SECURITY DEFINER` and call internal `public.record_audit_log(...)`.
3. Automatic audit trails are logged for:
   - User role changes and account deactivations (`profiles`).
   - Publication status changes and deletions (`products`).
   - Publication status changes and deletions (`packages`).
   - Status toggling and deletions (`offers`).

---

## 9. Explicit Database Grants & Privileges

```sql
-- Revoke all table permissions by default from PUBLIC, anon, authenticated
REVOKE ALL ON ALL TABLES IN SCHEMA public FROM PUBLIC, anon;
REVOKE ALL ON ALL TABLES IN SCHEMA public FROM authenticated;

-- Catalogue & Public Read Tables:
GRANT SELECT ON public.categories, public.brands, public.products, 
                public.product_images, public.packages, public.package_items, 
                public.offers, public.offer_products, public.offer_packages,
                public.package_pricing_view 
      TO anon, authenticated;

-- Staff & Admin Management on Catalogue:
GRANT INSERT, UPDATE, DELETE ON public.categories, public.brands, public.products,
                               public.product_images, public.packages, public.package_items,
                               public.offers, public.offer_products, public.offer_packages
      TO authenticated;

-- Inquiries:
GRANT INSERT ON public.inquiries TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.inquiries TO authenticated;

-- Profiles:
GRANT SELECT, UPDATE ON public.profiles TO authenticated;

-- Read-only History & Audits:
GRANT SELECT ON public.price_history TO authenticated;
GRANT SELECT ON public.audit_logs TO authenticated;

-- Service Role Full Access:
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;
GRANT ALL ON ALL ROUTINES IN SCHEMA public TO service_role;
```

---

## 10. Supabase Storage Policies & Media Security

### 10.1. Bucket Configurations
| Bucket | Public | File Size Limit | Allowed MIME Types | Access Model |
| :--- | :--- | :--- | :--- | :--- |
| `product-images` | Yes | 5 MB | JPEG, PNG, WebP, AVIF | Public read; Admin/Owner write |
| `package-images` | Yes | 5 MB | JPEG, PNG, WebP, AVIF | Public read; Admin/Owner write |
| `category-banners` | Yes | 5 MB | JPEG, PNG, WebP, AVIF, SVG | Public read; Admin/Owner write |
| `documents` | **No** (Private) | 20 MB | PDF, DOC, DOCX, XLS, XLSX | Staff read; Admin/Owner write |

### 10.2. Draft Media Exposure Considerations
In Supabase Storage, objects in public buckets are accessible via public CDN URLs if the exact file path is known.
- **Architectural Safeguard**: High-resolution gallery images uploaded for draft products are referenced only in the `product_images` table, which is RLS-protected to hide draft images from public queries.
- **Filename Hardening**: Media file paths use random UUID filenames (`${crypto.randomUUID()}.webp`), preventing enumeration or predictable URL guessing before official release.
- **Confidential Commercial Media**: Confidential technical specifications, supplier contracts, and quotation sheets must strictly be stored in the private `documents` bucket.

---

## 11. Verification Checklist

- [x] All 13 tables defined with UUID PKs, check constraints, and indexes.
- [x] Owner bootstrap secured: Service-role only, advisory lock protected, no client session settings.
- [x] Last active owner account protected against deletion, demotion, or deactivation.
- [x] Public inquiry injection sanitized against status, notes, ID, and timestamp tampering.
- [x] Inquiries can only reference published products/packages.
- [x] `package_pricing_view` hardened with `security_invoker = true` and excludes draft components.
- [x] `get_effective_package_price` implemented with deterministic ordering and price-ceiling protection.
- [x] Special prices verified lower than regular prices across offer and catalogue updates.
- [x] Initial prices recorded on creation; override removals recorded as `new_price = NULL`.
- [x] Non-destructive price history logging across all package cost fields with `service_role` tracking.
- [x] Explicit SQL grants applied; direct write on audit and price history revoked from ordinary users.
- [x] Storage buckets configured with size limits, MIME type filters, and private document security.
- [x] Safe `SET search_path = public, pg_temp` applied to all `SECURITY DEFINER` functions.
- [x] Zero SQL executed against live Supabase database.
