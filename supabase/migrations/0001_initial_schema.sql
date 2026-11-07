-- ==============================================================================
-- Migration: 0001_initial_schema.sql
-- Description: Hardened Enterprise PostgreSQL Database Schema for Solar Business Platform
-- Stack: Next.js 16 App Router, Supabase PostgreSQL, Supabase Auth & Storage
-- Timezone convention: Timestamps stored in TIMESTAMPTZ (UTC internally, localized to Asia/Karachi in app)
-- Security: Strict table grants, concurrency-safe advisory locks, tamper-proof audit & price history,
--           secure owner bootstrap without client-settable session settings, and RLS on all tables.
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. EXTENSIONS
-- ------------------------------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "btree_gist"; -- Required for range exclusion overlap constraints

-- ------------------------------------------------------------------------------
-- 2. CUSTOM ENUM TYPES
-- ------------------------------------------------------------------------------
DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('owner', 'admin', 'staff');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE stock_status AS ENUM ('in_stock', 'out_of_stock', 'available_on_order');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE publication_status AS ENUM ('draft', 'published', 'archived');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE discount_type AS ENUM ('percentage', 'fixed_amount', 'special_price');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE price_target_type AS ENUM ('product', 'package');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE enquiry_status AS ENUM ('new', 'contacted', 'in_progress', 'quoted', 'converted', 'cancelled');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- ------------------------------------------------------------------------------
-- 3. CORE HELPER FUNCTIONS & TRIGGERS
-- ------------------------------------------------------------------------------

-- Generic updated_at timestamp trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public, pg_temp;

-- ------------------------------------------------------------------------------
-- 4. USERS & PERMISSIONS: PROFILES TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role user_role NOT NULL DEFAULT 'staff',
  full_name TEXT NOT NULL CHECK (length(trim(full_name)) >= 2 AND length(full_name) <= 100),
  phone TEXT CHECK (phone IS NULL OR (length(trim(phone)) >= 7 AND length(phone) <= 25)),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_is_active ON public.profiles(is_active);

DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Security Definer functions to verify roles safely without recursion
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS user_role AS $$
  SELECT role FROM public.profiles
  WHERE id = auth.uid() AND is_active = true;
$$ LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public, pg_temp;

CREATE OR REPLACE FUNCTION public.is_owner()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'owner' AND is_active = true
  );
$$ LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public, pg_temp;

CREATE OR REPLACE FUNCTION public.is_admin_or_owner()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role IN ('owner', 'admin') AND is_active = true
  );
$$ LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public, pg_temp;

CREATE OR REPLACE FUNCTION public.is_active_staff()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND is_active = true
  );
$$ LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public, pg_temp;

-- Concurrency-Safe Owner Protection & Role Escalation Defense:
-- 1. Uses transaction-level advisory locks to serialize demotions, deactivations, and deletions.
-- 2. Strictly forbids non-owners from elevating roles or modifying status.
-- 3. Does NOT rely on client-settable session settings.
CREATE OR REPLACE FUNCTION public.prevent_profile_role_self_escalation()
RETURNS TRIGGER AS $$
DECLARE
  v_owner_count INTEGER;
  v_caller_is_service_role BOOLEAN;
  v_caller_is_owner BOOLEAN;
  v_no_owner_exists BOOLEAN;
BEGIN
  -- Evaluate caller privileges securely
  v_caller_is_service_role := (auth.jwt() ->> 'role' = 'service_role') OR (current_user = 'postgres') OR (session_user = 'postgres');
  v_caller_is_owner := public.is_owner();

  -- If an active owner is being demoted or deactivated, serialize and count remaining active owners
  IF OLD.role = 'owner' AND (NEW.role != 'owner' OR NEW.is_active = false) THEN
    PERFORM pg_advisory_xact_lock(hashtext('owner_count_lock'));

    SELECT COUNT(*) INTO v_owner_count
    FROM public.profiles
    WHERE role = 'owner' AND is_active = true AND id != OLD.id;

    IF v_owner_count = 0 THEN
      RAISE EXCEPTION 'Action rejected: Cannot demote or deactivate the last remaining active owner.';
    END IF;
  END IF;

  -- If role or active status is modified, enforce authorization boundary
  IF (OLD.role IS DISTINCT FROM NEW.role OR OLD.is_active IS DISTINCT FROM NEW.is_active) THEN
    -- Check if system is in initial bootstrap state (no owner exists yet)
    IF NOT v_caller_is_owner THEN
      SELECT NOT EXISTS (SELECT 1 FROM public.profiles WHERE role = 'owner') INTO v_no_owner_exists;
      
      -- Only service_role during bootstrap (when no owner exists) or an active owner may alter roles
      IF NOT (v_no_owner_exists AND v_caller_is_service_role) THEN
        RAISE EXCEPTION 'Unauthorized: Only an active owner or service role can modify user roles or activation status.';
      END IF;
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;

DROP TRIGGER IF EXISTS trg_prevent_role_escalation ON public.profiles;
CREATE TRIGGER trg_prevent_role_escalation
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_profile_role_self_escalation();

-- Concurrency-Safe Last Owner Deletion Protection
CREATE OR REPLACE FUNCTION public.prevent_last_owner_deletion()
RETURNS TRIGGER AS $$
DECLARE
  v_owner_count INTEGER;
BEGIN
  IF OLD.role = 'owner' THEN
    PERFORM pg_advisory_xact_lock(hashtext('owner_count_lock'));

    SELECT COUNT(*) INTO v_owner_count
    FROM public.profiles
    WHERE role = 'owner' AND is_active = true AND id != OLD.id;

    IF v_owner_count = 0 THEN
      RAISE EXCEPTION 'Action rejected: Cannot delete the last remaining active owner account.';
    END IF;
  END IF;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;

DROP TRIGGER IF EXISTS trg_prevent_last_owner_deletion ON public.profiles;
CREATE TRIGGER trg_prevent_last_owner_deletion
  BEFORE DELETE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_last_owner_deletion();

-- Trigger for auto-creating a profile when a new user signs up via Supabase Auth
-- Note: Default role is always strictly 'staff'. Never 'owner' or 'admin'.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, phone, role, is_active)
  VALUES (
    NEW.id,
    COALESCE(NULLIF(trim(NEW.raw_user_meta_data->>'full_name'), ''), 'Staff Member'),
    NEW.raw_user_meta_data->>'phone',
    'staff', -- Strict default
    true
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Secure Owner Bootstrap function:
-- - Concurrency-safe via transaction advisory lock
-- - Bypasses role protection trigger legitimately via service_role identity check
-- - Self-disables if any owner already exists
-- - Callable ONLY by service_role (revoked from PUBLIC, anon, and authenticated)
CREATE OR REPLACE FUNCTION public.bootstrap_owner(p_user_email TEXT)
RETURNS VOID AS $$
DECLARE
  target_user_id UUID;
BEGIN
  -- Acquire transaction-level advisory lock to serialize concurrent bootstrap calls
  PERFORM pg_advisory_xact_lock(hashtext('owner_count_lock'));

  -- Guarantee that this cannot be used once an owner already exists
  IF EXISTS (SELECT 1 FROM public.profiles WHERE role = 'owner') THEN
    RAISE EXCEPTION 'Bootstrap denied: An owner already exists in the system.';
  END IF;

  SELECT id INTO target_user_id FROM auth.users WHERE email = lower(trim(p_user_email));
  IF target_user_id IS NULL THEN
    RAISE EXCEPTION 'User not found in auth.users with email: %', p_user_email;
  END IF;

  UPDATE public.profiles
  SET role = 'owner', is_active = true
  WHERE id = target_user_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Profile record not found for user id: %', target_user_id;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, auth, pg_temp;

-- Revoke all public execution on bootstrap_owner; Grant ONLY to service_role
REVOKE EXECUTE ON FUNCTION public.bootstrap_owner(TEXT) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.bootstrap_owner(TEXT) FROM anon;
REVOKE EXECUTE ON FUNCTION public.bootstrap_owner(TEXT) FROM authenticated;
GRANT EXECUTE ON FUNCTION public.bootstrap_owner(TEXT) TO service_role;

-- ------------------------------------------------------------------------------
-- 5. PRODUCT CATALOGUE: CATEGORIES & BRANDS
-- ------------------------------------------------------------------------------

-- Categories (Solar Panels, Inverters, Batteries, Mounting Structures, Accessories)
CREATE TABLE IF NOT EXISTS public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL CHECK (length(trim(name)) >= 2 AND length(name) <= 100),
  slug TEXT NOT NULL UNIQUE CHECK (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  description TEXT,
  image_url TEXT,
  display_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_categories_slug ON public.categories(slug);
CREATE INDEX IF NOT EXISTS idx_categories_display_order ON public.categories(display_order);

DROP TRIGGER IF EXISTS update_categories_updated_at ON public.categories;
CREATE TRIGGER update_categories_updated_at
  BEFORE UPDATE ON public.categories
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Brands (Longi, Canadian Solar, Jinko, Huawei, Growatt, Inverex, etc.)
CREATE TABLE IF NOT EXISTS public.brands (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL CHECK (length(trim(name)) >= 2 AND length(name) <= 100),
  slug TEXT NOT NULL UNIQUE CHECK (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  logo_url TEXT,
  website_url TEXT,
  description TEXT,
  tier_rating TEXT, -- e.g., 'Tier 1'
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_brands_slug ON public.brands(slug);
CREATE INDEX IF NOT EXISTS idx_brands_is_active ON public.brands(is_active);

DROP TRIGGER IF EXISTS update_brands_updated_at ON public.brands;
CREATE TRIGGER update_brands_updated_at
  BEFORE UPDATE ON public.brands
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- ------------------------------------------------------------------------------
-- 6. PRODUCT CATALOGUE: PRODUCTS & IMAGES
-- ------------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID NOT NULL REFERENCES public.categories(id) ON DELETE RESTRICT,
  brand_id UUID REFERENCES public.brands(id) ON DELETE SET NULL,
  name TEXT NOT NULL CHECK (length(trim(name)) >= 2 AND length(name) <= 150),
  slug TEXT NOT NULL UNIQUE CHECK (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  sku TEXT NOT NULL UNIQUE CHECK (sku ~ '^[A-Za-z0-9_-]{3,50}$'),
  short_description TEXT,
  description TEXT,
  specifications JSONB NOT NULL DEFAULT '{}'::jsonb, -- Technical specs: wattage, efficiency, cell_type, voltage, dimensions, warranty_years
  regular_price NUMERIC(12,2) NOT NULL CHECK (regular_price >= 0),
  inventory_status stock_status NOT NULL DEFAULT 'in_stock',
  publication_status publication_status NOT NULL DEFAULT 'draft',
  is_featured BOOLEAN NOT NULL DEFAULT false,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  updated_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_brand ON public.products(brand_id);
CREATE INDEX IF NOT EXISTS idx_products_slug ON public.products(slug);
CREATE INDEX IF NOT EXISTS idx_products_sku ON public.products(sku);
CREATE INDEX IF NOT EXISTS idx_products_status ON public.products(publication_status, inventory_status);
CREATE INDEX IF NOT EXISTS idx_products_featured ON public.products(is_featured);
CREATE INDEX IF NOT EXISTS idx_products_specs_gin ON public.products USING GIN (specifications);

DROP TRIGGER IF EXISTS update_products_updated_at ON public.products;
CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON public.products
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Product Images with support for multiple images, ordering, and primary flag
CREATE TABLE IF NOT EXISTS public.product_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  alt_text TEXT,
  display_order INTEGER NOT NULL DEFAULT 0,
  is_primary BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_product_images_product_sort ON public.product_images(product_id, display_order ASC);
-- Partial unique index guarantees that at most ONE image per product can be primary
CREATE UNIQUE INDEX IF NOT EXISTS idx_product_images_unique_primary 
  ON public.product_images(product_id) 
  WHERE is_primary = true;

-- ------------------------------------------------------------------------------
-- 7. SOLAR PACKAGES & HYBRID PACKAGE PRICING
-- ------------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.packages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL CHECK (length(trim(name)) >= 2 AND length(name) <= 150),
  slug TEXT NOT NULL UNIQUE CHECK (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  description TEXT,
  capacity_kw NUMERIC(6,2) NOT NULL CHECK (capacity_kw > 0),
  installation_cost NUMERIC(12,2) NOT NULL DEFAULT 0 CHECK (installation_cost >= 0),
  additional_costs NUMERIC(12,2) NOT NULL DEFAULT 0 CHECK (additional_costs >= 0),
  manual_price_override NUMERIC(12,2) CHECK (manual_price_override IS NULL OR manual_price_override >= 0),
  inventory_status stock_status NOT NULL DEFAULT 'in_stock',
  publication_status publication_status NOT NULL DEFAULT 'draft',
  featured_image_url TEXT,
  is_featured BOOLEAN NOT NULL DEFAULT false,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  updated_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_packages_slug ON public.packages(slug);
CREATE INDEX IF NOT EXISTS idx_packages_status ON public.packages(publication_status);
CREATE INDEX IF NOT EXISTS idx_packages_capacity ON public.packages(capacity_kw);

DROP TRIGGER IF EXISTS update_packages_updated_at ON public.packages;
CREATE TRIGGER update_packages_updated_at
  BEFORE UPDATE ON public.packages
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Package Items (Bill of Materials linking products to packages)
CREATE TABLE IF NOT EXISTS public.package_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  package_id UUID NOT NULL REFERENCES public.packages(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE RESTRICT,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_package_product UNIQUE (package_id, product_id)
);

CREATE INDEX IF NOT EXISTS idx_package_items_package ON public.package_items(package_id);
CREATE INDEX IF NOT EXISTS idx_package_items_product ON public.package_items(product_id);

-- Hardened Hybrid Pricing View:
-- 1. Declared with security_invoker = true so PostgreSQL respects querying user's RLS.
-- 2. Explicitly checks for unpublished constituent products:
--    Non-staff public visitors CANNOT see or calculate packages if ANY required component product is draft/archived.
-- 3. Decouples component total, installation costs, additional costs, and manual override.
CREATE OR REPLACE VIEW public.package_pricing_view
WITH (security_invoker = true) AS
SELECT 
  pkg.id AS package_id,
  pkg.name,
  pkg.slug,
  pkg.description,
  pkg.capacity_kw,
  pkg.installation_cost,
  pkg.additional_costs,
  pkg.manual_price_override,
  COALESCE(items.components_sum, 0::NUMERIC(12,2)) AS component_total,
  (COALESCE(items.components_sum, 0::NUMERIC(12,2)) + pkg.installation_cost + pkg.additional_costs) AS calculated_price,
  COALESCE(
    pkg.manual_price_override, 
    (COALESCE(items.components_sum, 0::NUMERIC(12,2)) + pkg.installation_cost + pkg.additional_costs)
  ) AS final_selling_price,
  (pkg.manual_price_override IS NOT NULL) AS is_manually_overridden,
  pkg.inventory_status,
  pkg.publication_status,
  pkg.is_featured,
  pkg.featured_image_url,
  COALESCE(items.has_unpublished_components, false) AS has_unpublished_components,
  pkg.created_at,
  pkg.updated_at
FROM public.packages pkg
LEFT JOIN (
  SELECT 
    pi.package_id,
    SUM(p.regular_price * pi.quantity)::NUMERIC(12,2) AS components_sum,
    BOOL_OR(p.publication_status != 'published') AS has_unpublished_components
  FROM public.package_items pi
  JOIN public.products p ON p.id = pi.product_id
  GROUP BY pi.package_id
) items ON items.package_id = pkg.id
WHERE (
  public.is_active_staff() OR 
  (pkg.publication_status = 'published' AND COALESCE(items.has_unpublished_components, false) = false)
);

-- Function to retrieve real-time calculated package price
-- Respects publication status: public can only query published packages without draft components; staff can query any.
CREATE OR REPLACE FUNCTION public.get_package_calculated_price(p_package_id UUID)
RETURNS TABLE (
  component_total NUMERIC(12,2),
  calculated_price NUMERIC(12,2),
  final_selling_price NUMERIC(12,2),
  is_overridden BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    v.component_total,
    v.calculated_price,
    v.final_selling_price,
    v.is_manually_overridden
  FROM public.package_pricing_view v
  WHERE v.package_id = p_package_id
    AND (public.is_active_staff() OR (v.publication_status = 'published' AND v.has_unpublished_components = false));
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public, pg_temp;

-- ------------------------------------------------------------------------------
-- 8. OFFERS, DISCOUNTS & SCHEDULED PROMOTIONS
-- ------------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.offers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL CHECK (length(trim(title)) >= 2 AND length(title) <= 150),
  description TEXT,
  discount_type discount_type NOT NULL,
  discount_value NUMERIC(12,2) NOT NULL CHECK (discount_value > 0),
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  is_enabled BOOLEAN NOT NULL DEFAULT true,
  banner_image_url TEXT,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT valid_offer_dates CHECK (end_time > start_time),
  CONSTRAINT valid_percentage_discount CHECK (discount_type != 'percentage' OR discount_value <= 100)
);

CREATE INDEX IF NOT EXISTS idx_offers_dates_enabled ON public.offers(start_time, end_time, is_enabled);

DROP TRIGGER IF EXISTS update_offers_updated_at ON public.offers;
CREATE TRIGGER update_offers_updated_at
  BEFORE UPDATE ON public.offers
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Offer Target: Products
CREATE TABLE IF NOT EXISTS public.offer_products (
  offer_id UUID NOT NULL REFERENCES public.offers(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  PRIMARY KEY (offer_id, product_id)
);

CREATE INDEX IF NOT EXISTS idx_offer_products_product ON public.offer_products(product_id);

-- Offer Target: Packages
CREATE TABLE IF NOT EXISTS public.offer_packages (
  offer_id UUID NOT NULL REFERENCES public.offers(id) ON DELETE CASCADE,
  package_id UUID NOT NULL REFERENCES public.packages(id) ON DELETE CASCADE,
  PRIMARY KEY (offer_id, package_id)
);

CREATE INDEX IF NOT EXISTS idx_offer_packages_package ON public.offer_packages(package_id);

-- Validation Trigger: Prevent overlapping active offers on the same product & validate special price
CREATE OR REPLACE FUNCTION public.check_offer_product_overlap()
RETURNS TRIGGER AS $$
DECLARE
  v_start_time TIMESTAMPTZ;
  v_end_time TIMESTAMPTZ;
  v_is_enabled BOOLEAN;
  v_discount_type discount_type;
  v_discount_value NUMERIC(12,2);
  v_regular_price NUMERIC(12,2);
  v_conflict_title TEXT;
BEGIN
  -- Obtain transaction-level advisory lock on target product to serialize concurrent offer assignments
  PERFORM pg_advisory_xact_lock(hashtext('product_offer_' || NEW.product_id::text));

  -- Obtain details of the offer being linked
  SELECT start_time, end_time, is_enabled, discount_type, discount_value
  INTO v_start_time, v_end_time, v_is_enabled, v_discount_type, v_discount_value
  FROM public.offers WHERE id = NEW.offer_id;

  -- Validate special selling price does not exceed or equal product regular price
  IF v_discount_type = 'special_price' THEN
    SELECT regular_price INTO v_regular_price
    FROM public.products WHERE id = NEW.product_id;

    IF v_discount_value >= v_regular_price THEN
      RAISE EXCEPTION 'Invalid offer: Special selling price (% PKR) must be lower than product regular price (% PKR).',
        v_discount_value, v_regular_price;
    END IF;
  END IF;

  IF v_is_enabled THEN
    SELECT o.title INTO v_conflict_title
    FROM public.offer_products op
    JOIN public.offers o ON o.id = op.offer_id
    WHERE op.product_id = NEW.product_id
      AND op.offer_id != NEW.offer_id
      AND o.is_enabled = true
      AND tstzrange(o.start_time, o.end_time) && tstzrange(v_start_time, v_end_time)
    LIMIT 1;

    IF v_conflict_title IS NOT NULL THEN
      RAISE EXCEPTION 'Conflicting offer: Product is already assigned to active offer "%" during this timeframe.', v_conflict_title;
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public, pg_temp;

DROP TRIGGER IF EXISTS trg_validate_offer_product_overlap ON public.offer_products;
CREATE TRIGGER trg_validate_offer_product_overlap
  BEFORE INSERT OR UPDATE ON public.offer_products
  FOR EACH ROW
  EXECUTE FUNCTION public.check_offer_product_overlap();

-- Validation Trigger: Prevent overlapping active offers on the same package & validate special price
CREATE OR REPLACE FUNCTION public.check_offer_package_overlap()
RETURNS TRIGGER AS $$
DECLARE
  v_start_time TIMESTAMPTZ;
  v_end_time TIMESTAMPTZ;
  v_is_enabled BOOLEAN;
  v_discount_type discount_type;
  v_discount_value NUMERIC(12,2);
  v_selling_price NUMERIC(12,2);
  v_conflict_title TEXT;
BEGIN
  -- Obtain transaction-level advisory lock on target package to serialize concurrent offer assignments
  PERFORM pg_advisory_xact_lock(hashtext('package_offer_' || NEW.package_id::text));

  SELECT start_time, end_time, is_enabled, discount_type, discount_value
  INTO v_start_time, v_end_time, v_is_enabled, v_discount_type, v_discount_value
  FROM public.offers WHERE id = NEW.offer_id;

  -- Validate special selling price does not exceed or equal package baseline price
  IF v_discount_type = 'special_price' THEN
    SELECT final_selling_price INTO v_selling_price
    FROM public.package_pricing_view WHERE package_id = NEW.package_id;

    IF v_selling_price IS NOT NULL AND v_discount_value >= v_selling_price THEN
      RAISE EXCEPTION 'Invalid offer: Special selling price (% PKR) must be lower than package regular selling price (% PKR).',
        v_discount_value, v_selling_price;
    END IF;
  END IF;

  IF v_is_enabled THEN
    SELECT o.title INTO v_conflict_title
    FROM public.offer_packages op
    JOIN public.offers o ON o.id = op.offer_id
    WHERE op.package_id = NEW.package_id
      AND op.offer_id != NEW.offer_id
      AND o.is_enabled = true
      AND tstzrange(o.start_time, o.end_time) && tstzrange(v_start_time, v_end_time)
    LIMIT 1;

    IF v_conflict_title IS NOT NULL THEN
      RAISE EXCEPTION 'Conflicting offer: Package is already assigned to active offer "%" during this timeframe.', v_conflict_title;
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public, pg_temp;

DROP TRIGGER IF EXISTS trg_validate_offer_package_overlap ON public.offer_packages;
CREATE TRIGGER trg_validate_offer_package_overlap
  BEFORE INSERT OR UPDATE ON public.offer_packages
  FOR EACH ROW
  EXECUTE FUNCTION public.check_offer_package_overlap();

-- Validation Trigger: Check conflicts and revalidate special prices if an existing offer's dates, discount, or enabled status changes
CREATE OR REPLACE FUNCTION public.check_offer_dates_overlap_on_offer_update()
RETURNS TRIGGER AS $$
DECLARE
  r_prod RECORD;
  r_pkg RECORD;
BEGIN
  -- Lock all assigned products and packages to prevent race conditions during updates
  FOR r_prod IN SELECT product_id FROM public.offer_products WHERE offer_id = NEW.id LOOP
    PERFORM pg_advisory_xact_lock(hashtext('product_offer_' || r_prod.product_id::text));
  END LOOP;

  FOR r_pkg IN SELECT package_id FROM public.offer_packages WHERE offer_id = NEW.id LOOP
    PERFORM pg_advisory_xact_lock(hashtext('package_offer_' || r_pkg.package_id::text));
  END LOOP;

  -- 1. Revalidate special prices if discount type or value changed
  IF (NEW.discount_type = 'special_price' AND (OLD.discount_type IS DISTINCT FROM NEW.discount_type OR OLD.discount_value IS DISTINCT FROM NEW.discount_value)) THEN
    -- Check against assigned products
    IF EXISTS (
      SELECT 1 FROM public.offer_products op
      JOIN public.products p ON p.id = op.product_id
      WHERE op.offer_id = NEW.id AND NEW.discount_value >= p.regular_price
    ) THEN
      RAISE EXCEPTION 'Cannot update offer: Special selling price (% PKR) is greater than or equal to the regular price of one or more assigned products.', NEW.discount_value;
    END IF;

    -- Check against assigned packages
    IF EXISTS (
      SELECT 1 FROM public.offer_packages op
      JOIN public.package_pricing_view v ON v.package_id = op.package_id
      WHERE op.offer_id = NEW.id AND NEW.discount_value >= v.final_selling_price
    ) THEN
      RAISE EXCEPTION 'Cannot update offer: Special selling price (% PKR) is greater than or equal to the regular price of one or more assigned packages.', NEW.discount_value;
    END IF;
  END IF;

  -- 2. Check date range conflicts if dates or enabled status changed
  IF NEW.is_enabled AND (
     OLD.start_time IS DISTINCT FROM NEW.start_time OR 
     OLD.end_time IS DISTINCT FROM NEW.end_time OR 
     OLD.is_enabled IS DISTINCT FROM NEW.is_enabled
  ) THEN
    -- Check product conflicts
    IF EXISTS (
      SELECT 1
      FROM public.offer_products op1
      JOIN public.offer_products op2 ON op2.product_id = op1.product_id AND op2.offer_id != op1.offer_id
      JOIN public.offers o2 ON o2.id = op2.offer_id AND o2.is_enabled = true
      WHERE op1.offer_id = NEW.id
        AND tstzrange(NEW.start_time, NEW.end_time) && tstzrange(o2.start_time, o2.end_time)
    ) THEN
      RAISE EXCEPTION 'Cannot update offer: One or more assigned products have conflicting active offers in the new date range.';
    END IF;

    -- Check package conflicts
    IF EXISTS (
      SELECT 1
      FROM public.offer_packages op1
      JOIN public.offer_packages op2 ON op2.package_id = op1.package_id AND op2.offer_id != op1.offer_id
      JOIN public.offers o2 ON o2.id = op2.offer_id AND o2.is_enabled = true
      WHERE op1.offer_id = NEW.id
        AND tstzrange(NEW.start_time, NEW.end_time) && tstzrange(o2.start_time, o2.end_time)
    ) THEN
      RAISE EXCEPTION 'Cannot update offer: One or more assigned packages have conflicting active offers in the new date range.';
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public, pg_temp;

DROP TRIGGER IF EXISTS trg_validate_offer_dates_update ON public.offers;
CREATE TRIGGER trg_validate_offer_dates_update
  BEFORE UPDATE ON public.offers
  FOR EACH ROW
  EXECUTE FUNCTION public.check_offer_dates_overlap_on_offer_update();

-- Revalidate special-price offers when product regular price changes:
-- Prevents a product regular price from dropping below an existing active or scheduled special promotional price
CREATE OR REPLACE FUNCTION public.check_product_price_against_active_offers()
RETURNS TRIGGER AS $$
BEGIN
  IF (OLD.regular_price IS DISTINCT FROM NEW.regular_price) THEN
    PERFORM pg_advisory_xact_lock(hashtext('product_offer_' || NEW.id::text));

    IF EXISTS (
      SELECT 1
      FROM public.offer_products op
      JOIN public.offers o ON o.id = op.offer_id
      WHERE op.product_id = NEW.id
        AND o.is_enabled = true
        AND o.discount_type = 'special_price'
        AND o.discount_value >= NEW.regular_price
        AND o.end_time > NOW()
    ) THEN
      RAISE EXCEPTION 'Cannot lower product regular price to % PKR: An active or scheduled special-price offer has an equal or higher price.', NEW.regular_price;
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public, pg_temp;

DROP TRIGGER IF EXISTS trg_check_product_price_against_active_offers ON public.products;
CREATE TRIGGER trg_check_product_price_against_active_offers
  BEFORE UPDATE ON public.products
  FOR EACH ROW
  EXECUTE FUNCTION public.check_product_price_against_active_offers();

-- Pure Database-Level Real-Time Effective Product Price Resolver:
-- 1. Enforces publication status: Anonymous callers get 0 rows for unpublished products.
-- 2. Deterministic offer ordering (highest discount, earliest start, id tiebreaker).
-- 3. Guarantees promotional price can never exceed regular price.
CREATE OR REPLACE FUNCTION public.get_effective_product_price(
  p_product_id UUID, 
  p_at_time TIMESTAMPTZ DEFAULT NOW()
)
RETURNS TABLE (
  regular_price NUMERIC(12,2),
  promotional_price NUMERIC(12,2),
  discount_amount NUMERIC(12,2),
  offer_id UUID,
  offer_title TEXT,
  discount_type discount_type,
  discount_value NUMERIC(12,2)
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.regular_price,
    LEAST(
      p.regular_price,
      CASE 
        WHEN o.id IS NULL THEN p.regular_price
        WHEN o.discount_type = 'percentage' THEN ROUND(p.regular_price * (1 - (o.discount_value / 100.0)), 2)
        WHEN o.discount_type = 'fixed_amount' THEN GREATEST(0::NUMERIC(12,2), p.regular_price - o.discount_value)
        WHEN o.discount_type = 'special_price' THEN o.discount_value
        ELSE p.regular_price
      END
    ) AS promotional_price,
    CASE 
      WHEN o.id IS NULL THEN 0::NUMERIC(12,2)
      WHEN o.discount_type = 'percentage' THEN ROUND(p.regular_price * (o.discount_value / 100.0), 2)
      WHEN o.discount_type = 'fixed_amount' THEN LEAST(p.regular_price, o.discount_value)
      WHEN o.discount_type = 'special_price' THEN GREATEST(0::NUMERIC(12,2), p.regular_price - o.discount_value)
      ELSE 0::NUMERIC(12,2)
    END AS discount_amount,
    o.id AS offer_id,
    o.title AS offer_title,
    o.discount_type,
    o.discount_value
  FROM public.products p
  LEFT JOIN LATERAL (
    SELECT off.*
    FROM public.offer_products op
    JOIN public.offers off ON off.id = op.offer_id
    WHERE op.product_id = p.id
      AND off.is_enabled = true
      AND p_at_time >= off.start_time 
      AND p_at_time < off.end_time
    ORDER BY off.discount_value DESC, off.start_time ASC, off.id ASC
    LIMIT 1
  ) o ON true
  WHERE p.id = p_product_id
    AND (p.publication_status = 'published' OR public.is_active_staff());
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public, pg_temp;

-- Pure Database-Level Real-Time Effective Package Price Resolver:
-- 1. Enforces publication status: Anonymous callers get 0 rows for unpublished packages or packages with draft components.
-- 2. Deterministic offer ordering.
-- 3. Guarantees promotional price can never exceed regular selling price.
CREATE OR REPLACE FUNCTION public.get_effective_package_price(
  p_package_id UUID,
  p_at_time TIMESTAMPTZ DEFAULT NOW()
)
RETURNS TABLE (
  component_total NUMERIC(12,2),
  calculated_price NUMERIC(12,2),
  manual_price_override NUMERIC(12,2),
  regular_selling_price NUMERIC(12,2),
  promotional_price NUMERIC(12,2),
  discount_amount NUMERIC(12,2),
  is_overridden BOOLEAN,
  offer_id UUID,
  offer_title TEXT,
  discount_type discount_type,
  discount_value NUMERIC(12,2)
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    v.component_total,
    v.calculated_price,
    v.manual_price_override,
    v.final_selling_price AS regular_selling_price,
    LEAST(
      v.final_selling_price,
      CASE 
        WHEN o.id IS NULL THEN v.final_selling_price
        WHEN o.discount_type = 'percentage' THEN ROUND(v.final_selling_price * (1 - (o.discount_value / 100.0)), 2)
        WHEN o.discount_type = 'fixed_amount' THEN GREATEST(0::NUMERIC(12,2), v.final_selling_price - o.discount_value)
        WHEN o.discount_type = 'special_price' THEN o.discount_value
        ELSE v.final_selling_price
      END
    ) AS promotional_price,
    CASE 
      WHEN o.id IS NULL THEN 0::NUMERIC(12,2)
      WHEN o.discount_type = 'percentage' THEN ROUND(v.final_selling_price * (o.discount_value / 100.0), 2)
      WHEN o.discount_type = 'fixed_amount' THEN LEAST(v.final_selling_price, o.discount_value)
      WHEN o.discount_type = 'special_price' THEN GREATEST(0::NUMERIC(12,2), v.final_selling_price - o.discount_value)
      ELSE 0::NUMERIC(12,2)
    END AS discount_amount,
    v.is_manually_overridden AS is_overridden,
    o.id AS offer_id,
    o.title AS offer_title,
    o.discount_type,
    o.discount_value
  FROM public.package_pricing_view v
  LEFT JOIN LATERAL (
    SELECT off.*
    FROM public.offer_packages op
    JOIN public.offers off ON off.id = op.offer_id
    WHERE op.package_id = v.package_id
      AND off.is_enabled = true
      AND p_at_time >= off.start_time 
      AND p_at_time < off.end_time
    ORDER BY off.discount_value DESC, off.start_time ASC, off.id ASC
    LIMIT 1
  ) o ON true
  WHERE v.package_id = p_package_id
    AND (public.is_active_staff() OR (v.publication_status = 'published' AND v.has_unpublished_components = false));
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public, pg_temp;

-- ------------------------------------------------------------------------------
-- 9. PRICE HISTORY
-- ------------------------------------------------------------------------------

-- Price history uses ON DELETE SET NULL to preserve historical financial records
-- and stores item name and SKU snapshots in case items are deleted or archived.
CREATE TABLE IF NOT EXISTS public.price_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  target_type price_target_type NOT NULL,
  product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
  package_id UUID REFERENCES public.packages(id) ON DELETE SET NULL,
  item_name TEXT NOT NULL,
  item_sku TEXT,
  price_field TEXT NOT NULL, -- 'regular_price', 'manual_price_override', 'installation_cost', 'additional_costs', 'component_change'
  previous_price NUMERIC(12,2),
  new_price NUMERIC(12,2) CHECK (new_price IS NULL OR new_price >= 0),
  reason TEXT,
  changed_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  changed_by_system TEXT NOT NULL DEFAULT 'authenticated', -- 'authenticated', 'service_role'
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT chk_price_history_target CHECK (
    (target_type = 'product' AND package_id IS NULL) OR
    (target_type = 'package' AND product_id IS NULL)
  )
);

CREATE INDEX IF NOT EXISTS idx_price_history_product ON public.price_history(product_id, created_at DESC) WHERE target_type = 'product';
CREATE INDEX IF NOT EXISTS idx_price_history_package ON public.price_history(package_id, created_at DESC) WHERE target_type = 'package';
CREATE INDEX IF NOT EXISTS idx_price_history_created_at ON public.price_history(created_at DESC);

-- Automatic price audit triggers on products table (INSERT and UPDATE)
CREATE OR REPLACE FUNCTION public.log_product_price_change()
RETURNS TRIGGER AS $$
DECLARE
  v_changed_by UUID;
  v_changed_system TEXT;
BEGIN
  v_changed_by := auth.uid();
  v_changed_system := CASE WHEN v_changed_by IS NULL THEN 'service_role' ELSE 'authenticated' END;

  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.price_history (
      target_type, product_id, item_name, item_sku, price_field, previous_price, new_price, reason, changed_by, changed_by_system
    )
    VALUES (
      'product', NEW.id, NEW.name, NEW.sku, 'regular_price', NULL, NEW.regular_price,
      'Initial product regular price established', COALESCE(NEW.created_by, v_changed_by), v_changed_system
    );
  ELSIF TG_OP = 'UPDATE' AND (OLD.regular_price IS DISTINCT FROM NEW.regular_price) THEN
    INSERT INTO public.price_history (
      target_type, product_id, item_name, item_sku, price_field, previous_price, new_price, reason, changed_by, changed_by_system
    )
    VALUES (
      'product', NEW.id, NEW.name, NEW.sku, 'regular_price', OLD.regular_price, NEW.regular_price,
      'Product regular price updated' || CASE WHEN v_changed_by IS NULL THEN ' (via service_role)' ELSE '' END,
      COALESCE(NEW.updated_by, v_changed_by), v_changed_system
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;

DROP TRIGGER IF EXISTS trg_log_product_price_change ON public.products;
CREATE TRIGGER trg_log_product_price_change
  AFTER INSERT OR UPDATE ON public.products
  FOR EACH ROW
  EXECUTE FUNCTION public.log_product_price_change();

-- Automatic price audit triggers on packages table (INSERT and UPDATE)
CREATE OR REPLACE FUNCTION public.log_package_price_change()
RETURNS TRIGGER AS $$
DECLARE
  v_changed_by UUID;
  v_changed_system TEXT;
BEGIN
  v_changed_by := auth.uid();
  v_changed_system := CASE WHEN v_changed_by IS NULL THEN 'service_role' ELSE 'authenticated' END;

  IF TG_OP = 'INSERT' THEN
    IF NEW.manual_price_override IS NOT NULL THEN
      INSERT INTO public.price_history (
        target_type, package_id, item_name, item_sku, price_field, previous_price, new_price, reason, changed_by, changed_by_system
      ) VALUES (
        'package', NEW.id, NEW.name, NEW.slug, 'manual_price_override', NULL, NEW.manual_price_override,
        'Initial manual price override established', COALESCE(NEW.created_by, v_changed_by), v_changed_system
      );
    END IF;

    IF NEW.installation_cost > 0 THEN
      INSERT INTO public.price_history (
        target_type, package_id, item_name, item_sku, price_field, previous_price, new_price, reason, changed_by, changed_by_system
      ) VALUES (
        'package', NEW.id, NEW.name, NEW.slug, 'installation_cost', NULL, NEW.installation_cost,
        'Initial installation cost established', COALESCE(NEW.created_by, v_changed_by), v_changed_system
      );
    END IF;

    IF NEW.additional_costs > 0 THEN
      INSERT INTO public.price_history (
        target_type, package_id, item_name, item_sku, price_field, previous_price, new_price, reason, changed_by, changed_by_system
      ) VALUES (
        'package', NEW.id, NEW.name, NEW.slug, 'additional_costs', NULL, NEW.additional_costs,
        'Initial additional costs established', COALESCE(NEW.created_by, v_changed_by), v_changed_system
      );
    END IF;

  ELSIF TG_OP = 'UPDATE' THEN
    -- Manual Price Override changed or removed (accurately logged as NULL when cleared)
    IF (OLD.manual_price_override IS DISTINCT FROM NEW.manual_price_override) THEN
      INSERT INTO public.price_history (
        target_type, package_id, item_name, item_sku, price_field, previous_price, new_price, reason, changed_by, changed_by_system
      )
      VALUES (
        'package', NEW.id, NEW.name, NEW.slug, 'manual_price_override', OLD.manual_price_override, NEW.manual_price_override,
        CASE 
          WHEN NEW.manual_price_override IS NULL THEN 'Manual price override removed. Reverted to dynamic calculated component price.'
          WHEN OLD.manual_price_override IS NULL THEN 'Manual price override established.'
          ELSE 'Manual price override adjusted.'
        END || CASE WHEN v_changed_by IS NULL THEN ' (via service_role)' ELSE '' END,
        COALESCE(NEW.updated_by, v_changed_by), v_changed_system
      );
    END IF;

    -- Installation cost changed
    IF (OLD.installation_cost IS DISTINCT FROM NEW.installation_cost) THEN
      INSERT INTO public.price_history (
        target_type, package_id, item_name, item_sku, price_field, previous_price, new_price, reason, changed_by, changed_by_system
      )
      VALUES (
        'package', NEW.id, NEW.name, NEW.slug, 'installation_cost', OLD.installation_cost, NEW.installation_cost,
        'Package installation cost updated' || CASE WHEN v_changed_by IS NULL THEN ' (via service_role)' ELSE '' END,
        COALESCE(NEW.updated_by, v_changed_by), v_changed_system
      );
    END IF;

    -- Additional costs changed
    IF (OLD.additional_costs IS DISTINCT FROM NEW.additional_costs) THEN
      INSERT INTO public.price_history (
        target_type, package_id, item_name, item_sku, price_field, previous_price, new_price, reason, changed_by, changed_by_system
      )
      VALUES (
        'package', NEW.id, NEW.name, NEW.slug, 'additional_costs', OLD.additional_costs, NEW.additional_costs,
        'Package additional costs updated' || CASE WHEN v_changed_by IS NULL THEN ' (via service_role)' ELSE '' END,
        COALESCE(NEW.updated_by, v_changed_by), v_changed_system
      );
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;

DROP TRIGGER IF EXISTS trg_log_package_price_change ON public.packages;
CREATE TRIGGER trg_log_package_price_change
  AFTER INSERT OR UPDATE ON public.packages
  FOR EACH ROW
  EXECUTE FUNCTION public.log_package_price_change();

-- Automatic audit log when package bill-of-materials components are altered
CREATE OR REPLACE FUNCTION public.log_package_component_change()
RETURNS TRIGGER AS $$
DECLARE
  v_pkg_name TEXT;
  v_pkg_slug TEXT;
  v_prod_name TEXT;
  v_changed_by UUID;
  v_changed_system TEXT;
BEGIN
  v_changed_by := auth.uid();
  v_changed_system := CASE WHEN v_changed_by IS NULL THEN 'service_role' ELSE 'authenticated' END;

  IF TG_OP = 'INSERT' THEN
    SELECT name, slug INTO v_pkg_name, v_pkg_slug FROM public.packages WHERE id = NEW.package_id;
    SELECT name INTO v_prod_name FROM public.products WHERE id = NEW.product_id;

    INSERT INTO public.price_history (
      target_type, package_id, item_name, item_sku, price_field, previous_price, new_price, reason, changed_by, changed_by_system
    ) VALUES (
      'package', NEW.package_id, v_pkg_name, v_pkg_slug, 'component_change', NULL, NULL,
      'Component added: ' || v_prod_name || ' (Qty: ' || NEW.quantity || ')', v_changed_by, v_changed_system
    );
  ELSIF TG_OP = 'UPDATE' AND (OLD.quantity IS DISTINCT FROM NEW.quantity) THEN
    SELECT name, slug INTO v_pkg_name, v_pkg_slug FROM public.packages WHERE id = NEW.package_id;
    SELECT name INTO v_prod_name FROM public.products WHERE id = NEW.product_id;

    INSERT INTO public.price_history (
      target_type, package_id, item_name, item_sku, price_field, previous_price, new_price, reason, changed_by, changed_by_system
    ) VALUES (
      'package', NEW.package_id, v_pkg_name, v_pkg_slug, 'component_change', NULL, NULL,
      'Component quantity adjusted for ' || v_prod_name || ' from ' || OLD.quantity || ' to ' || NEW.quantity, v_changed_by, v_changed_system
    );
  ELSIF TG_OP = 'DELETE' THEN
    SELECT name, slug INTO v_pkg_name, v_pkg_slug FROM public.packages WHERE id = OLD.package_id;
    SELECT name INTO v_prod_name FROM public.products WHERE id = OLD.product_id;

    INSERT INTO public.price_history (
      target_type, package_id, item_name, item_sku, price_field, previous_price, new_price, reason, changed_by, changed_by_system
    ) VALUES (
      'package', OLD.package_id, v_pkg_name, v_pkg_slug, 'component_change', NULL, NULL,
      'Component removed: ' || v_prod_name || ' (Qty was ' || OLD.quantity || ')', v_changed_by, v_changed_system
    );
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;

DROP TRIGGER IF EXISTS trg_log_package_component_change ON public.package_items;
CREATE TRIGGER trg_log_package_component_change
  AFTER INSERT OR UPDATE OR DELETE ON public.package_items
  FOR EACH ROW
  EXECUTE FUNCTION public.log_package_component_change();

-- ------------------------------------------------------------------------------
-- 10. CUSTOMER ENQUIRIES
-- ------------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.inquiries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_name TEXT NOT NULL CHECK (length(trim(customer_name)) >= 2 AND length(customer_name) <= 100),
  phone TEXT NOT NULL CHECK (length(trim(phone)) >= 7 AND length(phone) <= 25),
  email TEXT CHECK (email IS NULL OR email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
  city TEXT CHECK (city IS NULL OR (length(trim(city)) >= 2 AND length(city) <= 100)),
  address TEXT CHECK (address IS NULL OR length(address) <= 300),
  message TEXT NOT NULL CHECK (length(trim(message)) >= 5 AND length(message) <= 2000),
  product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
  package_id UUID REFERENCES public.packages(id) ON DELETE SET NULL,
  status enquiry_status NOT NULL DEFAULT 'new',
  assigned_to UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  internal_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_inquiries_status ON public.inquiries(status);
CREATE INDEX IF NOT EXISTS idx_inquiries_assigned_to ON public.inquiries(assigned_to);
CREATE INDEX IF NOT EXISTS idx_inquiries_created_at ON public.inquiries(created_at DESC);

DROP TRIGGER IF EXISTS update_inquiries_updated_at ON public.inquiries;
CREATE TRIGGER update_inquiries_updated_at
  BEFORE UPDATE ON public.inquiries
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Hardened Sanitization trigger for Inquiries:
-- 1. Resets status := 'new', assigned_to := NULL, internal_notes := NULL for non-staff submissions.
-- 2. Sanitizes client-supplied ID and timestamps: forces server-side UUID generation and server timestamp.
-- 3. Verifies that public inquiries can ONLY reference published products and packages.
CREATE OR REPLACE FUNCTION public.sanitize_public_inquiry()
RETURNS TRIGGER AS $$
BEGIN
  IF NOT public.is_active_staff() THEN
    -- Enforce defaults and server-side generated fields
    NEW.id := gen_random_uuid();
    NEW.status := 'new';
    NEW.assigned_to := NULL;
    NEW.internal_notes := NULL;
    NEW.created_at := NOW();
    NEW.updated_at := NOW();

    -- Ensure product reference is published
    IF NEW.product_id IS NOT NULL THEN
      IF NOT EXISTS (
        SELECT 1 FROM public.products 
        WHERE id = NEW.product_id AND publication_status = 'published'
      ) THEN
        RAISE EXCEPTION 'Invalid enquiry: Referenced product does not exist or is not published.';
      END IF;
    END IF;

    -- Ensure package reference is published
    IF NEW.package_id IS NOT NULL THEN
      IF NOT EXISTS (
        SELECT 1 FROM public.packages 
        WHERE id = NEW.package_id AND publication_status = 'published'
      ) THEN
        RAISE EXCEPTION 'Invalid enquiry: Referenced solar package does not exist or is not published.';
      END IF;
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;

DROP TRIGGER IF EXISTS trg_sanitize_public_inquiry ON public.inquiries;
CREATE TRIGGER trg_sanitize_public_inquiry
  BEFORE INSERT ON public.inquiries
  FOR EACH ROW
  EXECUTE FUNCTION public.sanitize_public_inquiry();

-- Staff Update Restriction:
-- Non-admin staff can only update status and internal_notes.
-- They cannot modify customer name, phone, email, message, product/package link, or change enquiry IDs.
CREATE OR REPLACE FUNCTION public.restrict_inquiry_updates_by_staff()
RETURNS TRIGGER AS $$
BEGIN
  -- Prevent modifying primary key ID under any circumstance
  IF OLD.id IS DISTINCT FROM NEW.id THEN
    RAISE EXCEPTION 'Action rejected: Enquiry ID cannot be modified.';
  END IF;

  IF public.is_active_staff() AND NOT public.is_admin_or_owner() THEN
    IF (OLD.customer_name IS DISTINCT FROM NEW.customer_name OR
        OLD.phone IS DISTINCT FROM NEW.phone OR
        OLD.email IS DISTINCT FROM NEW.email OR
        OLD.city IS DISTINCT FROM NEW.city OR
        OLD.address IS DISTINCT FROM NEW.address OR
        OLD.message IS DISTINCT FROM NEW.message OR
        OLD.product_id IS DISTINCT FROM NEW.product_id OR
        OLD.package_id IS DISTINCT FROM NEW.package_id OR
        OLD.created_at IS DISTINCT FROM NEW.created_at) THEN
      RAISE EXCEPTION 'Staff restriction: Staff members cannot modify customer contact information or original request details.';
    END IF;

    -- Staff can only claim unassigned enquiries for themselves; cannot reassign to another user
    IF OLD.assigned_to IS DISTINCT FROM NEW.assigned_to THEN
      IF NOT (OLD.assigned_to IS NULL AND NEW.assigned_to = auth.uid()) THEN
        RAISE EXCEPTION 'Staff restriction: Only Admins and Owners can reassign enquiries.';
      END IF;
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;

DROP TRIGGER IF EXISTS trg_restrict_inquiry_updates_by_staff ON public.inquiries;
CREATE TRIGGER trg_restrict_inquiry_updates_by_staff
  BEFORE UPDATE ON public.inquiries
  FOR EACH ROW
  EXECUTE FUNCTION public.restrict_inquiry_updates_by_staff();

-- ------------------------------------------------------------------------------
-- 11. AUDIT LOGS
-- ------------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  action TEXT NOT NULL, -- e.g., 'CREATE', 'UPDATE', 'DELETE', 'PUBLISH', 'OVERRIDE_PRICE', 'ROLE_CHANGE'
  entity_type TEXT NOT NULL, -- e.g., 'product', 'package', 'offer', 'category', 'brand', 'inquiry', 'profile'
  entity_id UUID NOT NULL,
  old_data JSONB,
  new_data JSONB,
  ip_address INET,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_actor ON public.audit_logs(actor_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity ON public.audit_logs(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON public.audit_logs(created_at DESC);

-- Internal Security Definer audit log function for triggers:
-- Callable strictly from trusted database triggers and service_role.
CREATE OR REPLACE FUNCTION public.record_audit_log(
  p_action TEXT,
  p_entity_type TEXT,
  p_entity_id UUID,
  p_old_data JSONB DEFAULT NULL,
  p_new_data JSONB DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
  INSERT INTO public.audit_logs (
    actor_id,
    action,
    entity_type,
    entity_id,
    old_data,
    new_data
  )
  VALUES (
    auth.uid(),
    p_action,
    p_entity_type,
    p_entity_id,
    p_old_data,
    p_new_data
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;

-- Revoke execute on record_audit_log from PUBLIC, anon, authenticated; Grant only to service_role
REVOKE EXECUTE ON FUNCTION public.record_audit_log(TEXT, TEXT, UUID, JSONB, JSONB) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.record_audit_log(TEXT, TEXT, UUID, JSONB, JSONB) FROM anon;
REVOKE EXECUTE ON FUNCTION public.record_audit_log(TEXT, TEXT, UUID, JSONB, JSONB) FROM authenticated;
GRANT EXECUTE ON FUNCTION public.record_audit_log(TEXT, TEXT, UUID, JSONB, JSONB) TO service_role;

-- Automatic audit triggers for key administration events
-- 1. Profile role change and deactivation audit
CREATE OR REPLACE FUNCTION public.audit_profile_changes()
RETURNS TRIGGER AS $$
BEGIN
  IF (OLD.role IS DISTINCT FROM NEW.role OR OLD.is_active IS DISTINCT FROM NEW.is_active) THEN
    PERFORM public.record_audit_log(
      'ROLE_OR_STATUS_CHANGE',
      'profile',
      NEW.id,
      jsonb_build_object('role', OLD.role, 'is_active', OLD.is_active),
      jsonb_build_object('role', NEW.role, 'is_active', NEW.is_active)
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;

DROP TRIGGER IF EXISTS trg_audit_profile_changes ON public.profiles;
CREATE TRIGGER trg_audit_profile_changes
  AFTER UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.audit_profile_changes();

-- 2. Product publication and deletion audit
CREATE OR REPLACE FUNCTION public.audit_product_changes()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'UPDATE' AND (OLD.publication_status IS DISTINCT FROM NEW.publication_status) THEN
    PERFORM public.record_audit_log(
      'PUBLICATION_STATUS_CHANGE',
      'product',
      NEW.id,
      jsonb_build_object('status', OLD.publication_status),
      jsonb_build_object('status', NEW.publication_status)
    );
  ELSIF TG_OP = 'DELETE' THEN
    PERFORM public.record_audit_log(
      'DELETE',
      'product',
      OLD.id,
      jsonb_build_object('name', OLD.name, 'sku', OLD.sku, 'price', OLD.regular_price),
      NULL
    );
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;

DROP TRIGGER IF EXISTS trg_audit_product_changes ON public.products;
CREATE TRIGGER trg_audit_product_changes
  AFTER UPDATE OR DELETE ON public.products
  FOR EACH ROW
  EXECUTE FUNCTION public.audit_product_changes();

-- 3. Package publication and deletion audit
CREATE OR REPLACE FUNCTION public.audit_package_changes()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'UPDATE' AND (OLD.publication_status IS DISTINCT FROM NEW.publication_status) THEN
    PERFORM public.record_audit_log(
      'PUBLICATION_STATUS_CHANGE',
      'package',
      NEW.id,
      jsonb_build_object('status', OLD.publication_status),
      jsonb_build_object('status', NEW.publication_status)
    );
  ELSIF TG_OP = 'DELETE' THEN
    PERFORM public.record_audit_log(
      'DELETE',
      'package',
      OLD.id,
      jsonb_build_object('name', OLD.name, 'slug', OLD.slug),
      NULL
    );
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;

DROP TRIGGER IF EXISTS trg_audit_package_changes ON public.packages;
CREATE TRIGGER trg_audit_package_changes
  AFTER UPDATE OR DELETE ON public.packages
  FOR EACH ROW
  EXECUTE FUNCTION public.audit_package_changes();

-- 4. Offer status change and deletion audit
CREATE OR REPLACE FUNCTION public.audit_offer_changes()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'UPDATE' AND (OLD.is_enabled IS DISTINCT FROM NEW.is_enabled) THEN
    PERFORM public.record_audit_log(
      'OFFER_STATUS_TOGGLE',
      'offer',
      NEW.id,
      jsonb_build_object('is_enabled', OLD.is_enabled),
      jsonb_build_object('is_enabled', NEW.is_enabled)
    );
  ELSIF TG_OP = 'DELETE' THEN
    PERFORM public.record_audit_log(
      'DELETE',
      'offer',
      OLD.id,
      jsonb_build_object('title', OLD.title, 'discount_type', OLD.discount_type, 'discount_value', OLD.discount_value),
      NULL
    );
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;

DROP TRIGGER IF EXISTS trg_audit_offer_changes ON public.offers;
CREATE TRIGGER trg_audit_offer_changes
  AFTER UPDATE OR DELETE ON public.offers
  FOR EACH ROW
  EXECUTE FUNCTION public.audit_offer_changes();

-- ------------------------------------------------------------------------------
-- 12. EXPLICIT DATABASE GRANTS & PRIVILEGES
-- ------------------------------------------------------------------------------

-- Revoke all default table permissions from PUBLIC and anon
REVOKE ALL ON ALL TABLES IN SCHEMA public FROM PUBLIC, anon;
REVOKE ALL ON ALL TABLES IN SCHEMA public FROM authenticated;

-- 1. Catalogue & Public Read Tables:
GRANT SELECT ON public.categories, public.brands, public.products, 
                public.product_images, public.packages, public.package_items, 
                public.offers, public.offer_products, public.offer_packages,
                public.package_pricing_view 
      TO anon, authenticated;

-- 2. Staff & Admin Management on Catalogue:
GRANT INSERT, UPDATE, DELETE ON public.categories, public.brands, public.products,
                               public.product_images, public.packages, public.package_items,
                               public.offers, public.offer_products, public.offer_packages
      TO authenticated;

-- 3. Inquiries: Anonymous can INSERT; Authenticated staff can SELECT, INSERT, UPDATE, DELETE
GRANT INSERT ON public.inquiries TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.inquiries TO authenticated;

-- 4. Profiles:
GRANT SELECT, UPDATE ON public.profiles TO authenticated;

-- 5. Read-only History & Audits (NO write permissions granted to ordinary authenticated users):
GRANT SELECT ON public.price_history TO authenticated;
GRANT SELECT ON public.audit_logs TO authenticated;

-- 6. Service Role gets full access:
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;
GRANT ALL ON ALL ROUTINES IN SCHEMA public TO service_role;

-- ------------------------------------------------------------------------------
-- 13. ROW LEVEL SECURITY (RLS) POLICIES
-- ------------------------------------------------------------------------------

-- Enable RLS on all 13 tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.package_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.offer_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.offer_packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.price_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- PROFILES POLICIES
DROP POLICY IF EXISTS "Users can read their own profile" ON public.profiles;
CREATE POLICY "Users can read their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Owner and Admin can view all profiles" ON public.profiles;
CREATE POLICY "Owner and Admin can view all profiles"
  ON public.profiles FOR SELECT
  USING (public.is_admin_or_owner());

DROP POLICY IF EXISTS "Owner can update any profile" ON public.profiles;
CREATE POLICY "Owner can update any profile"
  ON public.profiles FOR UPDATE
  USING (public.is_owner());

DROP POLICY IF EXISTS "Users can update their personal details" ON public.profiles;
CREATE POLICY "Users can update their personal details"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- CATEGORIES POLICIES
DROP POLICY IF EXISTS "Public can view active categories" ON public.categories;
CREATE POLICY "Public can view active categories"
  ON public.categories FOR SELECT
  USING (is_active = true OR public.is_active_staff());

DROP POLICY IF EXISTS "Admin and Owner can manage categories" ON public.categories;
CREATE POLICY "Admin and Owner can manage categories"
  ON public.categories FOR ALL
  USING (public.is_admin_or_owner());

-- BRANDS POLICIES
DROP POLICY IF EXISTS "Public can view active brands" ON public.brands;
CREATE POLICY "Public can view active brands"
  ON public.brands FOR SELECT
  USING (is_active = true OR public.is_active_staff());

DROP POLICY IF EXISTS "Admin and Owner can manage brands" ON public.brands;
CREATE POLICY "Admin and Owner can manage brands"
  ON public.brands FOR ALL
  USING (public.is_admin_or_owner());

-- PRODUCTS POLICIES
DROP POLICY IF EXISTS "Public can view published products" ON public.products;
CREATE POLICY "Public can view published products"
  ON public.products FOR SELECT
  USING (publication_status = 'published' OR public.is_active_staff());

DROP POLICY IF EXISTS "Admin and Owner can manage products" ON public.products;
CREATE POLICY "Admin and Owner can manage products"
  ON public.products FOR ALL
  USING (public.is_admin_or_owner());

-- PRODUCT IMAGES POLICIES
DROP POLICY IF EXISTS "Public can view images of published products" ON public.product_images;
CREATE POLICY "Public can view images of published products"
  ON public.product_images FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.products p
      WHERE p.id = product_images.product_id
        AND (p.publication_status = 'published' OR public.is_active_staff())
    )
  );

DROP POLICY IF EXISTS "Admin and Owner can manage product images" ON public.product_images;
CREATE POLICY "Admin and Owner can manage product images"
  ON public.product_images FOR ALL
  USING (public.is_admin_or_owner());

-- PACKAGES POLICIES
DROP POLICY IF EXISTS "Public can view published packages" ON public.packages;
CREATE POLICY "Public can view published packages"
  ON public.packages FOR SELECT
  USING (publication_status = 'published' OR public.is_active_staff());

DROP POLICY IF EXISTS "Admin and Owner can manage packages" ON public.packages;
CREATE POLICY "Admin and Owner can manage packages"
  ON public.packages FOR ALL
  USING (public.is_admin_or_owner());

-- PACKAGE ITEMS POLICIES
DROP POLICY IF EXISTS "Public can view items of published packages" ON public.package_items;
CREATE POLICY "Public can view items of published packages"
  ON public.package_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.packages pkg
      WHERE pkg.id = package_items.package_id
        AND (pkg.publication_status = 'published' OR public.is_active_staff())
    )
  );

DROP POLICY IF EXISTS "Admin and Owner can manage package items" ON public.package_items;
CREATE POLICY "Admin and Owner can manage package items"
  ON public.package_items FOR ALL
  USING (public.is_admin_or_owner());

-- OFFERS POLICIES
DROP POLICY IF EXISTS "Public can view active valid offers" ON public.offers;
CREATE POLICY "Public can view active valid offers"
  ON public.offers FOR SELECT
  USING (
    (is_enabled = true AND NOW() >= start_time AND NOW() < end_time)
    OR public.is_active_staff()
  );

DROP POLICY IF EXISTS "Admin and Owner can manage offers" ON public.offers;
CREATE POLICY "Admin and Owner can manage offers"
  ON public.offers FOR ALL
  USING (public.is_admin_or_owner());

-- OFFER PRODUCTS & PACKAGES POLICIES
DROP POLICY IF EXISTS "Public can view mappings of active offers" ON public.offer_products;
CREATE POLICY "Public can view mappings of active offers"
  ON public.offer_products FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.offers o
      WHERE o.id = offer_products.offer_id
        AND ((o.is_enabled = true AND NOW() >= o.start_time AND NOW() < o.end_time) OR public.is_active_staff())
    )
  );

DROP POLICY IF EXISTS "Admin and Owner can manage offer products" ON public.offer_products;
CREATE POLICY "Admin and Owner can manage offer products"
  ON public.offer_products FOR ALL
  USING (public.is_admin_or_owner());

DROP POLICY IF EXISTS "Public can view package mappings of active offers" ON public.offer_packages;
CREATE POLICY "Public can view package mappings of active offers"
  ON public.offer_packages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.offers o
      WHERE o.id = offer_packages.offer_id
        AND ((o.is_enabled = true AND NOW() >= o.start_time AND NOW() < o.end_time) OR public.is_active_staff())
    )
  );

DROP POLICY IF EXISTS "Admin and Owner can manage offer packages" ON public.offer_packages;
CREATE POLICY "Admin and Owner can manage offer packages"
  ON public.offer_packages FOR ALL
  USING (public.is_admin_or_owner());

-- PRICE HISTORY POLICIES
DROP POLICY IF EXISTS "Staff, Admin and Owner can read price history" ON public.price_history;
CREATE POLICY "Staff, Admin and Owner can read price history"
  ON public.price_history FOR SELECT
  USING (public.is_active_staff());

-- Direct INSERT on price_history is restricted to service_role only (ordinary authenticated write denied)
DROP POLICY IF EXISTS "Service role can insert price history" ON public.price_history;
CREATE POLICY "Service role can insert price history"
  ON public.price_history FOR INSERT
  WITH CHECK (auth.jwt() ->> 'role' = 'service_role');

-- CUSTOMER ENQUIRIES POLICIES
-- Public submission: Anyone (including unauthenticated visitors) can submit an enquiry,
-- BUT they cannot assign it, set status to anything other than 'new', or inject internal notes.
DROP POLICY IF EXISTS "Public can insert inquiries with initial defaults" ON public.inquiries;
CREATE POLICY "Public can insert inquiries with initial defaults"
  ON public.inquiries FOR INSERT
  WITH CHECK (status = 'new' AND assigned_to IS NULL AND internal_notes IS NULL);

-- Staff can view inquiries assigned to them or unassigned inquiries
DROP POLICY IF EXISTS "Staff can view assigned or unassigned inquiries" ON public.inquiries;
CREATE POLICY "Staff can view assigned or unassigned inquiries"
  ON public.inquiries FOR SELECT
  USING (
    public.is_admin_or_owner() OR 
    (public.is_active_staff() AND (assigned_to = auth.uid() OR assigned_to IS NULL))
  );

-- Staff can update their assigned inquiries (or claim unassigned inquiries)
DROP POLICY IF EXISTS "Staff can update assigned inquiries" ON public.inquiries;
CREATE POLICY "Staff can update assigned inquiries"
  ON public.inquiries FOR UPDATE
  USING (
    public.is_admin_or_owner() OR 
    (public.is_active_staff() AND (assigned_to = auth.uid() OR assigned_to IS NULL))
  )
  WITH CHECK (
    public.is_admin_or_owner() OR 
    (public.is_active_staff() AND (assigned_to = auth.uid() OR assigned_to IS NULL))
  );

-- Admin and Owner can delete inquiries
DROP POLICY IF EXISTS "Admin and Owner can delete inquiries" ON public.inquiries;
CREATE POLICY "Admin and Owner can delete inquiries"
  ON public.inquiries FOR DELETE
  USING (public.is_admin_or_owner());

-- AUDIT LOGS POLICIES
DROP POLICY IF EXISTS "Owner and Admin can read audit logs" ON public.audit_logs;
CREATE POLICY "Owner and Admin can read audit logs"
  ON public.audit_logs FOR SELECT
  USING (public.is_admin_or_owner());

DROP POLICY IF EXISTS "Service role can insert audit logs" ON public.audit_logs;
CREATE POLICY "Service role can insert audit logs"
  ON public.audit_logs FOR INSERT
  WITH CHECK (auth.jwt() ->> 'role' = 'service_role');

-- ------------------------------------------------------------------------------
-- 14. STORAGE BUCKETS & POLICIES
-- ------------------------------------------------------------------------------
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('product-images', 'product-images', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/avif']),
  ('package-images', 'package-images', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/avif']),
  ('category-banners', 'category-banners', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/svg+xml']),
  ('documents', 'documents', false, 20971520, ARRAY['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'])
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Public read policies for public media buckets
DROP POLICY IF EXISTS "Public read for product-images" ON storage.objects;
CREATE POLICY "Public read for product-images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'product-images');

DROP POLICY IF EXISTS "Public read for package-images" ON storage.objects;
CREATE POLICY "Public read for package-images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'package-images');

DROP POLICY IF EXISTS "Public read for category-banners" ON storage.objects;
CREATE POLICY "Public read for category-banners"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'category-banners');

-- Private documents bucket: Accessible only to authenticated active staff, admins, and owners
DROP POLICY IF EXISTS "Staff can read private documents" ON storage.objects;
CREATE POLICY "Staff can read private documents"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'documents' AND public.is_active_staff());

DROP POLICY IF EXISTS "Admin and Owner can upload private documents" ON storage.objects;
CREATE POLICY "Admin and Owner can upload private documents"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'documents' AND public.is_admin_or_owner());

DROP POLICY IF EXISTS "Admin and Owner can update private documents" ON storage.objects;
CREATE POLICY "Admin and Owner can update private documents"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'documents' AND public.is_admin_or_owner());

DROP POLICY IF EXISTS "Admin and Owner can delete private documents" ON storage.objects;
CREATE POLICY "Admin and Owner can delete private documents"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'documents' AND public.is_admin_or_owner());

-- Write/update/delete for media buckets restricted to Owner and Admin
DROP POLICY IF EXISTS "Admin and Owner can upload product media" ON storage.objects;
CREATE POLICY "Admin and Owner can upload product media"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id IN ('product-images', 'package-images', 'category-banners')
    AND public.is_admin_or_owner()
  );

DROP POLICY IF EXISTS "Admin and Owner can update product media" ON storage.objects;
CREATE POLICY "Admin and Owner can update product media"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id IN ('product-images', 'package-images', 'category-banners')
    AND public.is_admin_or_owner()
  );

DROP POLICY IF EXISTS "Admin and Owner can delete product media" ON storage.objects;
CREATE POLICY "Admin and Owner can delete product media"
  ON storage.objects FOR DELETE
  USING (
    bucket_id IN ('product-images', 'package-images', 'category-banners')
    AND public.is_admin_or_owner()
  );
