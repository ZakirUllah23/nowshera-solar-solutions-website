-- ==============================================================================
-- Migration: 0001_initial_schema.sql
-- Description: Hardened Enterprise PostgreSQL Schema for Nowshera Solar Solutions
-- ==============================================================================

-- 1. EXTENSIONS & ENUMS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "btree_gist";

DO $$ BEGIN CREATE TYPE user_role AS ENUM ('owner', 'admin', 'staff'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE stock_status AS ENUM ('in_stock', 'out_of_stock', 'available_on_order'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE publication_status AS ENUM ('draft', 'published', 'archived'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE discount_type AS ENUM ('percentage', 'fixed_amount', 'special_price'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE price_target_type AS ENUM ('product', 'package'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE enquiry_status AS ENUM ('new', 'contacted', 'in_progress', 'quoted', 'converted', 'cancelled'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- 2. CORE HELPERS (Timestamps & Actor Attribution)
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public, pg_temp;

CREATE OR REPLACE FUNCTION public.set_actor_attribution()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' AND auth.uid() IS NOT NULL THEN
    NEW.created_by := auth.uid();
  END IF;
  IF TG_OP IN ('INSERT', 'UPDATE') AND to_jsonb(NEW) ? 'updated_by' AND auth.uid() IS NOT NULL THEN
    NEW.updated_by := auth.uid();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;

-- True only when called via service_role JWT, service_role DB role, or direct SQL migration/editor without user JWT
CREATE OR REPLACE FUNCTION public.is_service_or_migration_caller()
RETURNS BOOLEAN AS $$
  SELECT (COALESCE(auth.jwt() ->> 'role', '') = 'service_role')
      OR (current_setting('role', true) = 'service_role')
      OR (session_user IN ('postgres', 'supabase_admin') AND auth.uid() IS NULL AND COALESCE(current_setting('role', true), 'postgres') IN ('postgres', 'supabase_admin', 'service_role'));
$$ LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public, pg_temp;

-- 3. PROFILES & OWNER SECURITY
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role user_role NOT NULL DEFAULT 'staff',
  full_name TEXT NOT NULL CHECK (length(trim(full_name)) BETWEEN 2 AND 100),
  phone TEXT CHECK (phone IS NULL OR length(trim(phone)) BETWEEN 7 AND 25),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_profiles_role_active ON public.profiles(role, is_active);

DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS user_role AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid() AND is_active = true;
$$ LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public, pg_temp;

CREATE OR REPLACE FUNCTION public.is_owner()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'owner' AND is_active = true);
$$ LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public, pg_temp;

CREATE OR REPLACE FUNCTION public.is_admin_or_owner()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('owner', 'admin') AND is_active = true);
$$ LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public, pg_temp;

CREATE OR REPLACE FUNCTION public.is_active_staff()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_active = true);
$$ LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public, pg_temp;

CREATE OR REPLACE FUNCTION public.prevent_profile_role_self_escalation()
RETURNS TRIGGER AS $$
DECLARE
  v_no_owner_exists BOOLEAN;
BEGIN
  -- Serialize & block demoting or deactivating the last active owner
  IF OLD.role = 'owner' AND OLD.is_active = true AND (NEW.role != 'owner' OR NEW.is_active = false) THEN
    PERFORM pg_advisory_xact_lock(hashtext('owner_count_lock'));
    IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE role = 'owner' AND is_active = true AND id != OLD.id) THEN
      RAISE EXCEPTION 'Action rejected: Cannot demote or deactivate the last remaining active owner.';
    END IF;
  END IF;

  -- Enforce strict role/status modification rules (Never use current_user = postgres in SECURITY DEFINER)
  IF (OLD.role IS DISTINCT FROM NEW.role OR OLD.is_active IS DISTINCT FROM NEW.is_active) THEN
    IF NOT public.is_owner() THEN
      PERFORM pg_advisory_xact_lock(hashtext('owner_count_lock'));
      SELECT NOT EXISTS (SELECT 1 FROM public.profiles WHERE role = 'owner' AND is_active = true) INTO v_no_owner_exists;

      IF NOT (v_no_owner_exists AND public.is_service_or_migration_caller()) THEN
        RAISE EXCEPTION 'Unauthorized: Only an active owner or service_role bootstrap can modify user roles or activation status.';
      END IF;
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;

DROP TRIGGER IF EXISTS trg_prevent_role_escalation ON public.profiles;
CREATE TRIGGER trg_prevent_role_escalation BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.prevent_profile_role_self_escalation();

CREATE OR REPLACE FUNCTION public.prevent_last_owner_deletion()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.role = 'owner' AND OLD.is_active = true THEN
    PERFORM pg_advisory_xact_lock(hashtext('owner_count_lock'));
    IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE role = 'owner' AND is_active = true AND id != OLD.id) THEN
      RAISE EXCEPTION 'Action rejected: Cannot delete the last remaining active owner account.';
    END IF;
  END IF;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;

DROP TRIGGER IF EXISTS trg_prevent_last_owner_deletion ON public.profiles;
CREATE TRIGGER trg_prevent_last_owner_deletion BEFORE DELETE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.prevent_last_owner_deletion();

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, phone, role, is_active)
  VALUES (
    NEW.id,
    COALESCE(NULLIF(trim(NEW.raw_user_meta_data->>'full_name'), ''), 'Staff Member'),
    NEW.raw_user_meta_data->>'phone',
    'staff',
    true
  ) ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE OR REPLACE FUNCTION public.bootstrap_owner(p_user_email TEXT)
RETURNS VOID AS $$
DECLARE
  v_target_id UUID;
BEGIN
  IF NOT public.is_service_or_migration_caller() THEN
    RAISE EXCEPTION 'Unauthorized: bootstrap_owner may only be executed by service_role.';
  END IF;

  PERFORM pg_advisory_xact_lock(hashtext('owner_count_lock'));

  IF EXISTS (SELECT 1 FROM public.profiles WHERE role = 'owner' AND is_active = true) THEN
    RAISE EXCEPTION 'Bootstrap denied: An active owner already exists in the system.';
  END IF;

  SELECT id INTO v_target_id FROM auth.users WHERE email = lower(trim(p_user_email));
  IF v_target_id IS NULL THEN
    RAISE EXCEPTION 'User not found in auth.users with email: %', p_user_email;
  END IF;

  UPDATE public.profiles SET role = 'owner', is_active = true WHERE id = v_target_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Profile record not found for user id: %', v_target_id;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, auth, pg_temp;

REVOKE EXECUTE ON FUNCTION public.bootstrap_owner(TEXT) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.bootstrap_owner(TEXT) TO service_role;

-- 4. CATALOGUE: CATEGORIES, BRANDS, PRODUCTS & IMAGES
CREATE TABLE IF NOT EXISTS public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL CHECK (length(trim(name)) BETWEEN 2 AND 100),
  slug TEXT NOT NULL UNIQUE CHECK (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  description TEXT,
  image_url TEXT,
  display_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_categories_order ON public.categories(display_order);
DROP TRIGGER IF EXISTS update_categories_updated_at ON public.categories;
CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON public.categories
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE IF NOT EXISTS public.brands (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL CHECK (length(trim(name)) BETWEEN 2 AND 100),
  slug TEXT NOT NULL UNIQUE CHECK (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  logo_url TEXT,
  website_url TEXT,
  description TEXT,
  tier_rating TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_brands_is_active ON public.brands(is_active);
DROP TRIGGER IF EXISTS update_brands_updated_at ON public.brands;
CREATE TRIGGER update_brands_updated_at BEFORE UPDATE ON public.brands
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE IF NOT EXISTS public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID NOT NULL REFERENCES public.categories(id) ON DELETE RESTRICT,
  brand_id UUID REFERENCES public.brands(id) ON DELETE SET NULL,
  name TEXT NOT NULL CHECK (length(trim(name)) BETWEEN 2 AND 150),
  slug TEXT NOT NULL UNIQUE CHECK (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  sku TEXT NOT NULL UNIQUE CHECK (sku ~ '^[A-Za-z0-9_-]{3,50}$'),
  short_description TEXT,
  description TEXT,
  specifications JSONB NOT NULL DEFAULT '{}'::jsonb,
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
CREATE INDEX IF NOT EXISTS idx_products_status ON public.products(publication_status, inventory_status);
CREATE INDEX IF NOT EXISTS idx_products_featured ON public.products(is_featured);
CREATE INDEX IF NOT EXISTS idx_products_specs_gin ON public.products USING GIN (specifications);

DROP TRIGGER IF EXISTS update_products_updated_at ON public.products;
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON public.products
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS trg_products_actor_attribution ON public.products;
CREATE TRIGGER trg_products_actor_attribution BEFORE INSERT OR UPDATE ON public.products
  FOR EACH ROW EXECUTE FUNCTION public.set_actor_attribution();

CREATE TABLE IF NOT EXISTS public.product_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  alt_text TEXT,
  display_order INTEGER NOT NULL DEFAULT 0,
  is_primary BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_product_images_sort ON public.product_images(product_id, display_order ASC);
CREATE UNIQUE INDEX IF NOT EXISTS idx_product_images_unique_primary ON public.product_images(product_id) WHERE is_primary = true;

-- 5. SOLAR PACKAGES, BILL OF MATERIALS & HYBRID PRICING
CREATE TABLE IF NOT EXISTS public.packages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL CHECK (length(trim(name)) BETWEEN 2 AND 150),
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

CREATE INDEX IF NOT EXISTS idx_packages_status ON public.packages(publication_status);
CREATE INDEX IF NOT EXISTS idx_packages_capacity ON public.packages(capacity_kw);

DROP TRIGGER IF EXISTS update_packages_updated_at ON public.packages;
CREATE TRIGGER update_packages_updated_at BEFORE UPDATE ON public.packages
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS trg_packages_actor_attribution ON public.packages;
CREATE TRIGGER trg_packages_actor_attribution BEFORE INSERT OR UPDATE ON public.packages
  FOR EACH ROW EXECUTE FUNCTION public.set_actor_attribution();

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

-- Elevated helper to inspect all package components without RLS hiding draft/archived products from anon users
CREATE OR REPLACE FUNCTION public.get_package_component_rollups(p_package_id UUID)
RETURNS TABLE (
  components_sum NUMERIC(12,2),
  has_unpublished_components BOOLEAN
) AS $$
  SELECT
    COALESCE(SUM(p.regular_price * pi.quantity), 0)::NUMERIC(12,2) AS components_sum,
    COALESCE(BOOL_OR(p.publication_status != 'published'), false) AS has_unpublished_components
  FROM public.package_items pi
  JOIN public.products p ON p.id = pi.product_id
  WHERE pi.package_id = p_package_id;
$$ LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public, pg_temp;

CREATE OR REPLACE FUNCTION public.package_is_publicly_visible(p_package_id UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.packages pkg
    CROSS JOIN LATERAL public.get_package_component_rollups(pkg.id) r
    WHERE pkg.id = p_package_id
      AND pkg.publication_status = 'published'
      AND r.has_unpublished_components = false
  );
$$ LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public, pg_temp;

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
  r.components_sum AS component_total,
  (r.components_sum + pkg.installation_cost + pkg.additional_costs)::NUMERIC(12,2) AS calculated_price,
  COALESCE(pkg.manual_price_override, (r.components_sum + pkg.installation_cost + pkg.additional_costs))::NUMERIC(12,2) AS final_selling_price,
  (pkg.manual_price_override IS NOT NULL) AS is_manually_overridden,
  pkg.inventory_status,
  pkg.publication_status,
  pkg.is_featured,
  pkg.featured_image_url,
  r.has_unpublished_components,
  pkg.created_at,
  pkg.updated_at
FROM public.packages pkg
CROSS JOIN LATERAL public.get_package_component_rollups(pkg.id) r
WHERE public.is_active_staff()
   OR (pkg.publication_status = 'published' AND r.has_unpublished_components = false);

CREATE OR REPLACE FUNCTION public.get_package_calculated_price(p_package_id UUID)
RETURNS TABLE (
  component_total NUMERIC(12,2),
  calculated_price NUMERIC(12,2),
  final_selling_price NUMERIC(12,2),
  is_overridden BOOLEAN
) AS $$
  SELECT v.component_total, v.calculated_price, v.final_selling_price, v.is_manually_overridden
  FROM public.package_pricing_view v
  WHERE v.package_id = p_package_id
    AND (public.is_active_staff() OR (v.publication_status = 'published' AND v.has_unpublished_components = false));
$$ LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public, pg_temp;

-- 6. OFFERS, DISCOUNTS & PRICE VALIDATION ACROSS ALL TABLES
CREATE TABLE IF NOT EXISTS public.offers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL CHECK (length(trim(title)) BETWEEN 2 AND 150),
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
CREATE TRIGGER update_offers_updated_at BEFORE UPDATE ON public.offers
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS trg_offers_actor_attribution ON public.offers;
CREATE TRIGGER trg_offers_actor_attribution BEFORE INSERT ON public.offers
  FOR EACH ROW EXECUTE FUNCTION public.set_actor_attribution();

CREATE TABLE IF NOT EXISTS public.offer_products (
  offer_id UUID NOT NULL REFERENCES public.offers(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  PRIMARY KEY (offer_id, product_id)
);
CREATE INDEX IF NOT EXISTS idx_offer_products_product ON public.offer_products(product_id);

CREATE TABLE IF NOT EXISTS public.offer_packages (
  offer_id UUID NOT NULL REFERENCES public.offers(id) ON DELETE CASCADE,
  package_id UUID NOT NULL REFERENCES public.packages(id) ON DELETE CASCADE,
  PRIMARY KEY (offer_id, package_id)
);
CREATE INDEX IF NOT EXISTS idx_offer_packages_package ON public.offer_packages(package_id);

-- Centralized validator: ensures a package's current final_selling_price stays strictly above any active/scheduled special_price offer
CREATE OR REPLACE FUNCTION public.assert_package_special_offers_valid(p_package_id UUID)
RETURNS VOID AS $$
DECLARE
  v_selling_price NUMERIC(12,2);
  v_bad_offer RECORD;
BEGIN
  PERFORM pg_advisory_xact_lock(hashtext('package_offer_' || p_package_id::text));

  SELECT COALESCE(pkg.manual_price_override, (r.components_sum + pkg.installation_cost + pkg.additional_costs))::NUMERIC(12,2)
  INTO v_selling_price
  FROM public.packages pkg
  CROSS JOIN LATERAL public.get_package_component_rollups(pkg.id) r
  WHERE pkg.id = p_package_id;

  IF v_selling_price IS NULL THEN RETURN; END IF;

  SELECT o.title, o.discount_value INTO v_bad_offer
  FROM public.offer_packages op
  JOIN public.offers o ON o.id = op.offer_id
  WHERE op.package_id = p_package_id
    AND o.is_enabled = true
    AND o.discount_type = 'special_price'
    AND o.end_time > NOW()
    AND o.discount_value >= v_selling_price
  LIMIT 1;

  IF FOUND THEN
    RAISE EXCEPTION 'Invalid price change: Package selling price (% PKR) must remain higher than active/scheduled special-price offer "%" (% PKR).',
      v_selling_price, v_bad_offer.title, v_bad_offer.discount_value;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;

CREATE OR REPLACE FUNCTION public.check_offer_product_overlap()
RETURNS TRIGGER AS $$
DECLARE
  v_offer public.offers%ROWTYPE;
  v_regular_price NUMERIC(12,2);
  v_conflict_title TEXT;
BEGIN
  PERFORM pg_advisory_xact_lock(hashtext('product_offer_' || NEW.product_id::text));
  SELECT * INTO v_offer FROM public.offers WHERE id = NEW.offer_id;

  IF v_offer.discount_type = 'special_price' THEN
    SELECT regular_price INTO v_regular_price FROM public.products WHERE id = NEW.product_id;
    IF v_offer.discount_value >= v_regular_price THEN
      RAISE EXCEPTION 'Invalid offer: Special selling price (% PKR) must be lower than product regular price (% PKR).',
        v_offer.discount_value, v_regular_price;
    END IF;
  END IF;

  IF v_offer.is_enabled THEN
    SELECT o.title INTO v_conflict_title
    FROM public.offer_products op
    JOIN public.offers o ON o.id = op.offer_id
    WHERE op.product_id = NEW.product_id AND op.offer_id != NEW.offer_id
      AND o.is_enabled = true
      AND tstzrange(o.start_time, o.end_time) && tstzrange(v_offer.start_time, v_offer.end_time)
    LIMIT 1;

    IF v_conflict_title IS NOT NULL THEN
      RAISE EXCEPTION 'Conflicting offer: Product is already assigned to active offer "%" during this timeframe.', v_conflict_title;
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;

DROP TRIGGER IF EXISTS trg_validate_offer_product_overlap ON public.offer_products;
CREATE TRIGGER trg_validate_offer_product_overlap BEFORE INSERT OR UPDATE ON public.offer_products
  FOR EACH ROW EXECUTE FUNCTION public.check_offer_product_overlap();

CREATE OR REPLACE FUNCTION public.check_offer_package_overlap()
RETURNS TRIGGER AS $$
DECLARE
  v_offer public.offers%ROWTYPE;
  v_selling_price NUMERIC(12,2);
  v_conflict_title TEXT;
BEGIN
  PERFORM pg_advisory_xact_lock(hashtext('package_offer_' || NEW.package_id::text));
  SELECT * INTO v_offer FROM public.offers WHERE id = NEW.offer_id;

  IF v_offer.discount_type = 'special_price' THEN
    SELECT COALESCE(pkg.manual_price_override, (r.components_sum + pkg.installation_cost + pkg.additional_costs))::NUMERIC(12,2)
    INTO v_selling_price
    FROM public.packages pkg
    CROSS JOIN LATERAL public.get_package_component_rollups(pkg.id) r
    WHERE pkg.id = NEW.package_id;

    IF v_selling_price IS NOT NULL AND v_offer.discount_value >= v_selling_price THEN
      RAISE EXCEPTION 'Invalid offer: Special selling price (% PKR) must be lower than package regular selling price (% PKR).',
        v_offer.discount_value, v_selling_price;
    END IF;
  END IF;

  IF v_offer.is_enabled THEN
    SELECT o.title INTO v_conflict_title
    FROM public.offer_packages op
    JOIN public.offers o ON o.id = op.offer_id
    WHERE op.package_id = NEW.package_id AND op.offer_id != NEW.offer_id
      AND o.is_enabled = true
      AND tstzrange(o.start_time, o.end_time) && tstzrange(v_offer.start_time, v_offer.end_time)
    LIMIT 1;

    IF v_conflict_title IS NOT NULL THEN
      RAISE EXCEPTION 'Conflicting offer: Package is already assigned to active offer "%" during this timeframe.', v_conflict_title;
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;

DROP TRIGGER IF EXISTS trg_validate_offer_package_overlap ON public.offer_packages;
CREATE TRIGGER trg_validate_offer_package_overlap BEFORE INSERT OR UPDATE ON public.offer_packages
  FOR EACH ROW EXECUTE FUNCTION public.check_offer_package_overlap();

-- Revalidate special prices & date overlaps on ANY relevant offer update (including re-enabling or extending dates)
CREATE OR REPLACE FUNCTION public.check_offer_dates_overlap_on_offer_update()
RETURNS TRIGGER AS $$
DECLARE
  r_prod RECORD;
  r_pkg RECORD;
BEGIN
  FOR r_prod IN SELECT product_id FROM public.offer_products WHERE offer_id = NEW.id LOOP
    PERFORM pg_advisory_xact_lock(hashtext('product_offer_' || r_prod.product_id::text));
  END LOOP;
  FOR r_pkg IN SELECT package_id FROM public.offer_packages WHERE offer_id = NEW.id LOOP
    PERFORM pg_advisory_xact_lock(hashtext('package_offer_' || r_pkg.package_id::text));
  END LOOP;

  IF NEW.discount_type = 'special_price' AND (
     NEW.is_enabled = true OR OLD.discount_type IS DISTINCT FROM NEW.discount_type OR OLD.discount_value IS DISTINCT FROM NEW.discount_value
  ) THEN
    IF EXISTS (
      SELECT 1 FROM public.offer_products op
      JOIN public.products p ON p.id = op.product_id
      WHERE op.offer_id = NEW.id AND NEW.discount_value >= p.regular_price
    ) THEN
      RAISE EXCEPTION 'Cannot update offer: Special selling price (% PKR) must be lower than the regular price of all assigned products.', NEW.discount_value;
    END IF;

    IF EXISTS (
      SELECT 1 FROM public.offer_packages op
      JOIN public.packages pkg ON pkg.id = op.package_id
      CROSS JOIN LATERAL public.get_package_component_rollups(pkg.id) r
      WHERE op.offer_id = NEW.id
        AND NEW.discount_value >= COALESCE(pkg.manual_price_override, (r.components_sum + pkg.installation_cost + pkg.additional_costs))
    ) THEN
      RAISE EXCEPTION 'Cannot update offer: Special selling price (% PKR) must be lower than the regular selling price of all assigned packages.', NEW.discount_value;
    END IF;
  END IF;

  IF NEW.is_enabled AND (
     OLD.start_time IS DISTINCT FROM NEW.start_time OR OLD.end_time IS DISTINCT FROM NEW.end_time OR OLD.is_enabled IS DISTINCT FROM NEW.is_enabled
  ) THEN
    IF EXISTS (
      SELECT 1 FROM public.offer_products op1
      JOIN public.offer_products op2 ON op2.product_id = op1.product_id AND op2.offer_id != op1.offer_id
      JOIN public.offers o2 ON o2.id = op2.offer_id AND o2.is_enabled = true
      WHERE op1.offer_id = NEW.id AND tstzrange(NEW.start_time, NEW.end_time) && tstzrange(o2.start_time, o2.end_time)
    ) THEN
      RAISE EXCEPTION 'Cannot update offer: One or more assigned products have conflicting active offers in the new date range.';
    END IF;

    IF EXISTS (
      SELECT 1 FROM public.offer_packages op1
      JOIN public.offer_packages op2 ON op2.package_id = op1.package_id AND op2.offer_id != op1.offer_id
      JOIN public.offers o2 ON o2.id = op2.offer_id AND o2.is_enabled = true
      WHERE op1.offer_id = NEW.id AND tstzrange(NEW.start_time, NEW.end_time) && tstzrange(o2.start_time, o2.end_time)
    ) THEN
      RAISE EXCEPTION 'Cannot update offer: One or more assigned packages have conflicting active offers in the new date range.';
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;

DROP TRIGGER IF EXISTS trg_validate_offer_dates_update ON public.offers;
CREATE TRIGGER trg_validate_offer_dates_update BEFORE UPDATE ON public.offers
  FOR EACH ROW EXECUTE FUNCTION public.check_offer_dates_overlap_on_offer_update();

-- Revalidate product offers AND cascading parent package offers when product regular_price changes
CREATE OR REPLACE FUNCTION public.check_product_price_against_active_offers()
RETURNS TRIGGER AS $$
DECLARE
  r_pkg RECORD;
BEGIN
  IF OLD.regular_price IS DISTINCT FROM NEW.regular_price THEN
    PERFORM pg_advisory_xact_lock(hashtext('product_offer_' || NEW.id::text));

    IF EXISTS (
      SELECT 1 FROM public.offer_products op
      JOIN public.offers o ON o.id = op.offer_id
      WHERE op.product_id = NEW.id AND o.is_enabled = true
        AND o.discount_type = 'special_price' AND o.discount_value >= NEW.regular_price AND o.end_time > NOW()
    ) THEN
      RAISE EXCEPTION 'Cannot lower product regular price to % PKR: An active or scheduled special-price offer has an equal or higher price.', NEW.regular_price;
    END IF;

    FOR r_pkg IN SELECT package_id FROM public.package_items WHERE product_id = NEW.id LOOP
      PERFORM public.assert_package_special_offers_valid(r_pkg.package_id);
    END LOOP;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;

DROP TRIGGER IF EXISTS trg_check_product_price_against_active_offers ON public.products;
CREATE TRIGGER trg_check_product_price_against_active_offers AFTER UPDATE OF regular_price ON public.products
  FOR EACH ROW EXECUTE FUNCTION public.check_product_price_against_active_offers();

-- Revalidate package offers when package cost/override columns change
CREATE OR REPLACE FUNCTION public.check_package_price_against_active_offers()
RETURNS TRIGGER AS $$
BEGIN
  IF (OLD.manual_price_override IS DISTINCT FROM NEW.manual_price_override OR
      OLD.installation_cost IS DISTINCT FROM NEW.installation_cost OR
      OLD.additional_costs IS DISTINCT FROM NEW.additional_costs) THEN
    PERFORM public.assert_package_special_offers_valid(NEW.id);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;

DROP TRIGGER IF EXISTS trg_check_package_price_against_active_offers ON public.packages;
CREATE TRIGGER trg_check_package_price_against_active_offers AFTER UPDATE ON public.packages
  FOR EACH ROW EXECUTE FUNCTION public.check_package_price_against_active_offers();

-- Revalidate package offers when package_items are added, modified, or deleted
CREATE OR REPLACE FUNCTION public.check_package_items_against_active_offers()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM public.assert_package_special_offers_valid(COALESCE(NEW.package_id, OLD.package_id));
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;

DROP TRIGGER IF EXISTS trg_check_package_items_against_active_offers ON public.package_items;
CREATE TRIGGER trg_check_package_items_against_active_offers AFTER INSERT OR UPDATE OR DELETE ON public.package_items
  FOR EACH ROW EXECUTE FUNCTION public.check_package_items_against_active_offers();

-- Real-time effective price resolvers
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
    WHERE op.product_id = p.id AND off.is_enabled = true AND p_at_time >= off.start_time AND p_at_time < off.end_time
    ORDER BY off.discount_value DESC, off.start_time ASC, off.id ASC
    LIMIT 1
  ) o ON true
  WHERE p.id = p_product_id AND (p.publication_status = 'published' OR public.is_active_staff());
$$ LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public, pg_temp;

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
    WHERE op.package_id = v.package_id AND off.is_enabled = true AND p_at_time >= off.start_time AND p_at_time < off.end_time
    ORDER BY off.discount_value DESC, off.start_time ASC, off.id ASC
    LIMIT 1
  ) o ON true
  WHERE v.package_id = p_package_id
    AND (public.is_active_staff() OR (v.publication_status = 'published' AND v.has_unpublished_components = false));
$$ LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public, pg_temp;

-- 7. PRICE HISTORY (Tamper-Proof Actor Attribution)
CREATE TABLE IF NOT EXISTS public.price_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  target_type price_target_type NOT NULL,
  product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
  package_id UUID REFERENCES public.packages(id) ON DELETE SET NULL,
  item_name TEXT NOT NULL,
  item_sku TEXT,
  price_field TEXT NOT NULL,
  previous_price NUMERIC(12,2),
  new_price NUMERIC(12,2) CHECK (new_price IS NULL OR new_price >= 0),
  reason TEXT,
  changed_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  changed_by_system TEXT NOT NULL DEFAULT 'authenticated',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT chk_price_history_target CHECK (
    (target_type = 'product' AND package_id IS NULL) OR
    (target_type = 'package' AND product_id IS NULL)
  )
);

CREATE INDEX IF NOT EXISTS idx_price_history_product ON public.price_history(product_id, created_at DESC) WHERE target_type = 'product';
CREATE INDEX IF NOT EXISTS idx_price_history_package ON public.price_history(package_id, created_at DESC) WHERE target_type = 'package';
CREATE INDEX IF NOT EXISTS idx_price_history_created_at ON public.price_history(created_at DESC);

CREATE OR REPLACE FUNCTION public.resolve_valid_profile_actor(p_fallback UUID DEFAULT NULL)
RETURNS UUID AS $$
  SELECT id FROM public.profiles WHERE id = COALESCE(auth.uid(), p_fallback);
$$ LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public, pg_temp;

CREATE OR REPLACE FUNCTION public.log_product_price_change()
RETURNS TRIGGER AS $$
DECLARE
  v_actor UUID := public.resolve_valid_profile_actor(CASE WHEN TG_OP = 'INSERT' THEN NEW.created_by ELSE NEW.updated_by END);
  v_sys TEXT := CASE WHEN auth.uid() IS NULL THEN 'service_role' ELSE 'authenticated' END;
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.price_history (target_type, product_id, item_name, item_sku, price_field, previous_price, new_price, reason, changed_by, changed_by_system)
    VALUES ('product', NEW.id, NEW.name, NEW.sku, 'regular_price', NULL, NEW.regular_price, 'Initial product regular price established', v_actor, v_sys);
  ELSIF TG_OP = 'UPDATE' AND OLD.regular_price IS DISTINCT FROM NEW.regular_price THEN
    INSERT INTO public.price_history (target_type, product_id, item_name, item_sku, price_field, previous_price, new_price, reason, changed_by, changed_by_system)
    VALUES ('product', NEW.id, NEW.name, NEW.sku, 'regular_price', OLD.regular_price, NEW.regular_price,
      'Product regular price updated' || CASE WHEN auth.uid() IS NULL THEN ' (via service_role)' ELSE '' END, v_actor, v_sys);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;

DROP TRIGGER IF EXISTS trg_log_product_price_change ON public.products;
CREATE TRIGGER trg_log_product_price_change AFTER INSERT OR UPDATE ON public.products
  FOR EACH ROW EXECUTE FUNCTION public.log_product_price_change();

CREATE OR REPLACE FUNCTION public.log_package_price_change()
RETURNS TRIGGER AS $$
DECLARE
  v_actor UUID := public.resolve_valid_profile_actor(CASE WHEN TG_OP = 'INSERT' THEN NEW.created_by ELSE NEW.updated_by END);
  v_sys TEXT := CASE WHEN auth.uid() IS NULL THEN 'service_role' ELSE 'authenticated' END;
  v_suffix TEXT := CASE WHEN auth.uid() IS NULL THEN ' (via service_role)' ELSE '' END;
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF NEW.manual_price_override IS NOT NULL THEN
      INSERT INTO public.price_history (target_type, package_id, item_name, item_sku, price_field, previous_price, new_price, reason, changed_by, changed_by_system)
      VALUES ('package', NEW.id, NEW.name, NEW.slug, 'manual_price_override', NULL, NEW.manual_price_override, 'Initial manual price override established', v_actor, v_sys);
    END IF;
    IF NEW.installation_cost > 0 THEN
      INSERT INTO public.price_history (target_type, package_id, item_name, item_sku, price_field, previous_price, new_price, reason, changed_by, changed_by_system)
      VALUES ('package', NEW.id, NEW.name, NEW.slug, 'installation_cost', NULL, NEW.installation_cost, 'Initial installation cost established', v_actor, v_sys);
    END IF;
    IF NEW.additional_costs > 0 THEN
      INSERT INTO public.price_history (target_type, package_id, item_name, item_sku, price_field, previous_price, new_price, reason, changed_by, changed_by_system)
      VALUES ('package', NEW.id, NEW.name, NEW.slug, 'additional_costs', NULL, NEW.additional_costs, 'Initial additional costs established', v_actor, v_sys);
    END IF;
  ELSIF TG_OP = 'UPDATE' THEN
    IF OLD.manual_price_override IS DISTINCT FROM NEW.manual_price_override THEN
      INSERT INTO public.price_history (target_type, package_id, item_name, item_sku, price_field, previous_price, new_price, reason, changed_by, changed_by_system)
      VALUES ('package', NEW.id, NEW.name, NEW.slug, 'manual_price_override', OLD.manual_price_override, NEW.manual_price_override,
        CASE
          WHEN NEW.manual_price_override IS NULL THEN 'Manual price override removed. Reverted to dynamic calculated component price.'
          WHEN OLD.manual_price_override IS NULL THEN 'Manual price override established.'
          ELSE 'Manual price override adjusted.'
        END || v_suffix, v_actor, v_sys);
    END IF;
    IF OLD.installation_cost IS DISTINCT FROM NEW.installation_cost THEN
      INSERT INTO public.price_history (target_type, package_id, item_name, item_sku, price_field, previous_price, new_price, reason, changed_by, changed_by_system)
      VALUES ('package', NEW.id, NEW.name, NEW.slug, 'installation_cost', OLD.installation_cost, NEW.installation_cost, 'Package installation cost updated' || v_suffix, v_actor, v_sys);
    END IF;
    IF OLD.additional_costs IS DISTINCT FROM NEW.additional_costs THEN
      INSERT INTO public.price_history (target_type, package_id, item_name, item_sku, price_field, previous_price, new_price, reason, changed_by, changed_by_system)
      VALUES ('package', NEW.id, NEW.name, NEW.slug, 'additional_costs', OLD.additional_costs, NEW.additional_costs, 'Package additional costs updated' || v_suffix, v_actor, v_sys);
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;

DROP TRIGGER IF EXISTS trg_log_package_price_change ON public.packages;
CREATE TRIGGER trg_log_package_price_change AFTER INSERT OR UPDATE ON public.packages
  FOR EACH ROW EXECUTE FUNCTION public.log_package_price_change();

CREATE OR REPLACE FUNCTION public.log_package_component_change()
RETURNS TRIGGER AS $$
DECLARE
  v_pkg_id UUID := COALESCE(NEW.package_id, OLD.package_id);
  v_prod_id UUID := COALESCE(NEW.product_id, OLD.product_id);
  v_pkg_name TEXT;
  v_pkg_slug TEXT;
  v_prod_name TEXT;
  v_actor UUID := public.resolve_valid_profile_actor();
  v_sys TEXT := CASE WHEN auth.uid() IS NULL THEN 'service_role' ELSE 'authenticated' END;
  v_reason TEXT;
BEGIN
  SELECT name, slug INTO v_pkg_name, v_pkg_slug FROM public.packages WHERE id = v_pkg_id;
  SELECT name INTO v_prod_name FROM public.products WHERE id = v_prod_id;

  IF TG_OP = 'INSERT' THEN
    v_reason := 'Component added: ' || v_prod_name || ' (Qty: ' || NEW.quantity || ')';
  ELSIF TG_OP = 'UPDATE' AND OLD.quantity IS DISTINCT FROM NEW.quantity THEN
    v_reason := 'Component quantity adjusted for ' || v_prod_name || ' from ' || OLD.quantity || ' to ' || NEW.quantity;
  ELSIF TG_OP = 'DELETE' THEN
    v_reason := 'Component removed: ' || v_prod_name || ' (Qty was ' || OLD.quantity || ')';
  ELSE
    RETURN NULL;
  END IF;

  INSERT INTO public.price_history (target_type, package_id, item_name, item_sku, price_field, previous_price, new_price, reason, changed_by, changed_by_system)
  VALUES ('package', v_pkg_id, v_pkg_name, v_pkg_slug, 'component_change', NULL, NULL, v_reason, v_actor, v_sys);
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;

DROP TRIGGER IF EXISTS trg_log_package_component_change ON public.package_items;
CREATE TRIGGER trg_log_package_component_change AFTER INSERT OR UPDATE OR DELETE ON public.package_items
  FOR EACH ROW EXECUTE FUNCTION public.log_package_component_change();

-- 8. CUSTOMER ENQUIRIES & STAFF PERMISSIONS
CREATE TABLE IF NOT EXISTS public.inquiries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_name TEXT NOT NULL CHECK (length(trim(customer_name)) BETWEEN 2 AND 100),
  phone TEXT NOT NULL CHECK (length(trim(phone)) BETWEEN 7 AND 25),
  email TEXT CHECK (email IS NULL OR email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
  city TEXT CHECK (city IS NULL OR length(trim(city)) BETWEEN 2 AND 100),
  address TEXT CHECK (address IS NULL OR length(address) <= 300),
  message TEXT NOT NULL CHECK (length(trim(message)) BETWEEN 5 AND 2000),
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
CREATE TRIGGER update_inquiries_updated_at BEFORE UPDATE ON public.inquiries
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Public & Staff Inquiry Insert Sanitization:
-- Public visitors (and even logged-in staff submitting via public flow) get sanitized IDs/timestamps,
-- cannot reference draft products or packages containing draft components, and non-admin staff cannot assign enquiries to others.
CREATE OR REPLACE FUNCTION public.sanitize_public_inquiry()
RETURNS TRIGGER AS $$
BEGIN
  NEW.id := gen_random_uuid();
  NEW.created_at := NOW();
  NEW.updated_at := NOW();

  IF NOT public.is_active_staff() THEN
    NEW.status := 'new';
    NEW.assigned_to := NULL;
    NEW.internal_notes := NULL;

    IF NEW.product_id IS NOT NULL AND NOT EXISTS (
      SELECT 1 FROM public.products WHERE id = NEW.product_id AND publication_status = 'published'
    ) THEN
      RAISE EXCEPTION 'Invalid enquiry: Referenced product does not exist or is not published.';
    END IF;

    IF NEW.package_id IS NOT NULL AND NOT public.package_is_publicly_visible(NEW.package_id) THEN
      RAISE EXCEPTION 'Invalid enquiry: Referenced solar package does not exist or contains unpublished components.';
    END IF;
  ELSIF NOT public.is_admin_or_owner() THEN
    IF NEW.assigned_to IS NOT NULL AND NEW.assigned_to != auth.uid() THEN
      RAISE EXCEPTION 'Staff restriction: Staff members can only assign enquiries to themselves or leave them unassigned.';
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;

DROP TRIGGER IF EXISTS trg_sanitize_public_inquiry ON public.inquiries;
CREATE TRIGGER trg_sanitize_public_inquiry BEFORE INSERT ON public.inquiries
  FOR EACH ROW EXECUTE FUNCTION public.sanitize_public_inquiry();

CREATE OR REPLACE FUNCTION public.restrict_inquiry_updates_by_staff()
RETURNS TRIGGER AS $$
BEGIN
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
CREATE TRIGGER trg_restrict_inquiry_updates_by_staff BEFORE UPDATE ON public.inquiries
  FOR EACH ROW EXECUTE FUNCTION public.restrict_inquiry_updates_by_staff();

-- 9. AUDIT LOGS
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID NOT NULL,
  old_data JSONB,
  new_data JSONB,
  ip_address INET,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_actor ON public.audit_logs(actor_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity ON public.audit_logs(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON public.audit_logs(created_at DESC);

CREATE OR REPLACE FUNCTION public.record_audit_log(
  p_action TEXT,
  p_entity_type TEXT,
  p_entity_id UUID,
  p_old_data JSONB DEFAULT NULL,
  p_new_data JSONB DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
  INSERT INTO public.audit_logs (actor_id, action, entity_type, entity_id, old_data, new_data)
  VALUES (public.resolve_valid_profile_actor(), p_action, p_entity_type, p_entity_id, p_old_data, p_new_data);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;

REVOKE EXECUTE ON FUNCTION public.record_audit_log(TEXT, TEXT, UUID, JSONB, JSONB) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.record_audit_log(TEXT, TEXT, UUID, JSONB, JSONB) TO service_role;

CREATE OR REPLACE FUNCTION public.audit_entity_changes()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_TABLE_NAME = 'profiles' AND TG_OP = 'UPDATE' THEN
    IF OLD.role IS DISTINCT FROM NEW.role OR OLD.is_active IS DISTINCT FROM NEW.is_active THEN
      PERFORM public.record_audit_log('ROLE_OR_STATUS_CHANGE', 'profile', NEW.id,
        jsonb_build_object('role', OLD.role, 'is_active', OLD.is_active),
        jsonb_build_object('role', NEW.role, 'is_active', NEW.is_active));
    END IF;
  ELSIF TG_TABLE_NAME = 'products' THEN
    IF TG_OP = 'UPDATE' AND OLD.publication_status IS DISTINCT FROM NEW.publication_status THEN
      PERFORM public.record_audit_log('PUBLICATION_STATUS_CHANGE', 'product', NEW.id,
        jsonb_build_object('status', OLD.publication_status), jsonb_build_object('status', NEW.publication_status));
    ELSIF TG_OP = 'DELETE' THEN
      PERFORM public.record_audit_log('DELETE', 'product', OLD.id,
        jsonb_build_object('name', OLD.name, 'sku', OLD.sku, 'price', OLD.regular_price), NULL);
    END IF;
  ELSIF TG_TABLE_NAME = 'packages' THEN
    IF TG_OP = 'UPDATE' AND OLD.publication_status IS DISTINCT FROM NEW.publication_status THEN
      PERFORM public.record_audit_log('PUBLICATION_STATUS_CHANGE', 'package', NEW.id,
        jsonb_build_object('status', OLD.publication_status), jsonb_build_object('status', NEW.publication_status));
    ELSIF TG_OP = 'UPDATE' AND OLD.manual_price_override IS DISTINCT FROM NEW.manual_price_override THEN
      PERFORM public.record_audit_log('OVERRIDE_PRICE', 'package', NEW.id,
        jsonb_build_object('manual_price_override', OLD.manual_price_override),
        jsonb_build_object('manual_price_override', NEW.manual_price_override));
    ELSIF TG_OP = 'DELETE' THEN
      PERFORM public.record_audit_log('DELETE', 'package', OLD.id,
        jsonb_build_object('name', OLD.name, 'slug', OLD.slug), NULL);
    END IF;
  ELSIF TG_TABLE_NAME = 'offers' THEN
    IF TG_OP = 'UPDATE' AND OLD.is_enabled IS DISTINCT FROM NEW.is_enabled THEN
      PERFORM public.record_audit_log('OFFER_STATUS_TOGGLE', 'offer', NEW.id,
        jsonb_build_object('is_enabled', OLD.is_enabled), jsonb_build_object('is_enabled', NEW.is_enabled));
    ELSIF TG_OP = 'DELETE' THEN
      PERFORM public.record_audit_log('DELETE', 'offer', OLD.id,
        jsonb_build_object('title', OLD.title, 'discount_type', OLD.discount_type, 'discount_value', OLD.discount_value), NULL);
    END IF;
  ELSIF TG_TABLE_NAME = 'inquiries' AND TG_OP = 'DELETE' THEN
    PERFORM public.record_audit_log('DELETE', 'inquiry', OLD.id,
      jsonb_build_object('customer_name', OLD.customer_name, 'phone', OLD.phone, 'status', OLD.status), NULL);
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;

DROP TRIGGER IF EXISTS trg_audit_profile_changes ON public.profiles;
CREATE TRIGGER trg_audit_profile_changes AFTER UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.audit_entity_changes();

DROP TRIGGER IF EXISTS trg_audit_product_changes ON public.products;
CREATE TRIGGER trg_audit_product_changes AFTER UPDATE OR DELETE ON public.products FOR EACH ROW EXECUTE FUNCTION public.audit_entity_changes();

DROP TRIGGER IF EXISTS trg_audit_package_changes ON public.packages;
CREATE TRIGGER trg_audit_package_changes AFTER UPDATE OR DELETE ON public.packages FOR EACH ROW EXECUTE FUNCTION public.audit_entity_changes();

DROP TRIGGER IF EXISTS trg_audit_offer_changes ON public.offers;
CREATE TRIGGER trg_audit_offer_changes AFTER UPDATE OR DELETE ON public.offers FOR EACH ROW EXECUTE FUNCTION public.audit_entity_changes();

DROP TRIGGER IF EXISTS trg_audit_inquiry_changes ON public.inquiries;
CREATE TRIGGER trg_audit_inquiry_changes AFTER DELETE ON public.inquiries FOR EACH ROW EXECUTE FUNCTION public.audit_entity_changes();

-- 10. EXPLICIT GRANTS & PRIVILEGES
REVOKE ALL ON ALL TABLES IN SCHEMA public FROM PUBLIC, anon, authenticated;

GRANT SELECT ON public.categories, public.brands, public.products, public.product_images,
                public.packages, public.package_items, public.offers, public.offer_products,
                public.offer_packages, public.package_pricing_view
      TO anon, authenticated;

GRANT INSERT, UPDATE, DELETE ON public.categories, public.brands, public.products, public.product_images,
                               public.packages, public.package_items, public.offers, public.offer_products,
                               public.offer_packages
      TO authenticated;

GRANT INSERT ON public.inquiries TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.inquiries TO authenticated;
GRANT SELECT, UPDATE ON public.profiles TO authenticated;
GRANT SELECT ON public.price_history, public.audit_logs TO authenticated;

GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;
GRANT ALL ON ALL ROUTINES IN SCHEMA public TO service_role;

-- 11. ROW LEVEL SECURITY (RLS) POLICIES
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

-- Profiles
CREATE POLICY "Users can read own profile or Admin/Owner all" ON public.profiles
  FOR SELECT USING (auth.uid() = id OR public.is_admin_or_owner());
CREATE POLICY "Owner can update any profile" ON public.profiles
  FOR UPDATE USING (public.is_owner()) WITH CHECK (public.is_owner());
CREATE POLICY "Users can update own personal details" ON public.profiles
  FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- Catalogue (Categories, Brands, Products, Product Images)
CREATE POLICY "Public read active categories" ON public.categories
  FOR SELECT USING (is_active = true OR public.is_active_staff());
CREATE POLICY "Admin/Owner manage categories" ON public.categories
  FOR ALL USING (public.is_admin_or_owner()) WITH CHECK (public.is_admin_or_owner());

CREATE POLICY "Public read active brands" ON public.brands
  FOR SELECT USING (is_active = true OR public.is_active_staff());
CREATE POLICY "Admin/Owner manage brands" ON public.brands
  FOR ALL USING (public.is_admin_or_owner()) WITH CHECK (public.is_admin_or_owner());

CREATE POLICY "Public read published products" ON public.products
  FOR SELECT USING (publication_status = 'published' OR public.is_active_staff());
CREATE POLICY "Admin/Owner manage products" ON public.products
  FOR ALL USING (public.is_admin_or_owner()) WITH CHECK (public.is_admin_or_owner());

CREATE POLICY "Public read images of published products" ON public.product_images
  FOR SELECT USING (
    public.is_active_staff() OR EXISTS (
      SELECT 1 FROM public.products p WHERE p.id = product_images.product_id AND p.publication_status = 'published'
    )
  );
CREATE POLICY "Admin/Owner manage product images" ON public.product_images
  FOR ALL USING (public.is_admin_or_owner()) WITH CHECK (public.is_admin_or_owner());

-- Packages & Items (Enforces draft component isolation at table level too)
CREATE POLICY "Public read valid published packages" ON public.packages
  FOR SELECT USING (public.is_active_staff() OR public.package_is_publicly_visible(id));
CREATE POLICY "Admin/Owner manage packages" ON public.packages
  FOR ALL USING (public.is_admin_or_owner()) WITH CHECK (public.is_admin_or_owner());

CREATE POLICY "Public read items of valid published packages" ON public.package_items
  FOR SELECT USING (public.is_active_staff() OR public.package_is_publicly_visible(package_id));
CREATE POLICY "Admin/Owner manage package items" ON public.package_items
  FOR ALL USING (public.is_admin_or_owner()) WITH CHECK (public.is_admin_or_owner());

-- Offers & Mappings
CREATE POLICY "Public read active offers" ON public.offers
  FOR SELECT USING ((is_enabled = true AND NOW() >= start_time AND NOW() < end_time) OR public.is_active_staff());
CREATE POLICY "Admin/Owner manage offers" ON public.offers
  FOR ALL USING (public.is_admin_or_owner()) WITH CHECK (public.is_admin_or_owner());

CREATE POLICY "Public read active offer products" ON public.offer_products
  FOR SELECT USING (
    public.is_active_staff() OR EXISTS (
      SELECT 1 FROM public.offers o
      JOIN public.products p ON p.id = offer_products.product_id
      WHERE o.id = offer_products.offer_id
        AND o.is_enabled = true AND NOW() >= o.start_time AND NOW() < o.end_time
        AND p.publication_status = 'published'
    )
  );
CREATE POLICY "Admin/Owner manage offer products" ON public.offer_products
  FOR ALL USING (public.is_admin_or_owner()) WITH CHECK (public.is_admin_or_owner());

CREATE POLICY "Public read active offer packages" ON public.offer_packages
  FOR SELECT USING (
    public.is_active_staff() OR EXISTS (
      SELECT 1 FROM public.offers o
      WHERE o.id = offer_packages.offer_id
        AND o.is_enabled = true AND NOW() >= o.start_time AND NOW() < o.end_time
        AND public.package_is_publicly_visible(offer_packages.package_id)
    )
  );
CREATE POLICY "Admin/Owner manage offer packages" ON public.offer_packages
  FOR ALL USING (public.is_admin_or_owner()) WITH CHECK (public.is_admin_or_owner());

-- Price History & Audit Logs
CREATE POLICY "Staff read price history" ON public.price_history
  FOR SELECT USING (public.is_active_staff());
CREATE POLICY "Service role insert price history" ON public.price_history
  FOR INSERT WITH CHECK (public.is_service_or_migration_caller());

CREATE POLICY "Admin/Owner read audit logs" ON public.audit_logs
  FOR SELECT USING (public.is_admin_or_owner());
CREATE POLICY "Service role insert audit logs" ON public.audit_logs
  FOR INSERT WITH CHECK (public.is_service_or_migration_caller());

-- Inquiries (Separated Public Submissions vs. Staff Operations)
CREATE POLICY "Public submit sanitized inquiries" ON public.inquiries
  FOR INSERT TO anon
  WITH CHECK (status = 'new' AND assigned_to IS NULL AND internal_notes IS NULL);

CREATE POLICY "Staff insert inquiries" ON public.inquiries
  FOR INSERT TO authenticated
  WITH CHECK (
    (NOT public.is_active_staff() AND status = 'new' AND assigned_to IS NULL AND internal_notes IS NULL)
    OR (public.is_active_staff() AND (public.is_admin_or_owner() OR assigned_to IS NULL OR assigned_to = auth.uid()))
  );

CREATE POLICY "Staff view assigned or unassigned inquiries" ON public.inquiries
  FOR SELECT TO authenticated
  USING (public.is_admin_or_owner() OR (public.is_active_staff() AND (assigned_to = auth.uid() OR assigned_to IS NULL)));

CREATE POLICY "Staff update assigned or unassigned inquiries" ON public.inquiries
  FOR UPDATE TO authenticated
  USING (public.is_admin_or_owner() OR (public.is_active_staff() AND (assigned_to = auth.uid() OR assigned_to IS NULL)))
  WITH CHECK (public.is_admin_or_owner() OR (public.is_active_staff() AND (assigned_to = auth.uid() OR assigned_to IS NULL)));

CREATE POLICY "Admin/Owner delete inquiries" ON public.inquiries
  FOR DELETE TO authenticated
  USING (public.is_admin_or_owner());

-- 12. STORAGE BUCKETS & MEDIA ACCESS POLICIES
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

CREATE POLICY "Public read public media buckets" ON storage.objects
  FOR SELECT USING (bucket_id IN ('product-images', 'package-images', 'category-banners'));

CREATE POLICY "Admin/Owner manage public media buckets" ON storage.objects
  FOR ALL TO authenticated
  USING (bucket_id IN ('product-images', 'package-images', 'category-banners') AND public.is_admin_or_owner())
  WITH CHECK (bucket_id IN ('product-images', 'package-images', 'category-banners') AND public.is_admin_or_owner());

CREATE POLICY "Staff read private documents" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'documents' AND public.is_active_staff());

CREATE POLICY "Admin/Owner manage private documents" ON storage.objects
  FOR ALL TO authenticated
  USING (bucket_id = 'documents' AND public.is_admin_or_owner())
  WITH CHECK (bucket_id = 'documents' AND public.is_admin_or_owner());
