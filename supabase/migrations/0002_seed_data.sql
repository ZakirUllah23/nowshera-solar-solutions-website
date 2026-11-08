-- ==============================================================================
-- Migration: 0002_seed_data.sql
-- Description: Initial Categories, Brands, Sample Products & Package for Testing
-- ==============================================================================

-- 1. Insert Solar Categories
INSERT INTO public.categories (name, slug, description, display_order, is_active)
VALUES
  ('Solar Panels', 'solar-panels', 'High-efficiency monocrystalline and N-Type bifacial solar panels.', 1, true),
  ('Solar Inverters', 'solar-inverters', 'Hybrid, on-grid, and off-grid solar inverters.', 2, true),
  ('Lithium Batteries', 'lithium-batteries', 'LiFePO4 deep-cycle energy storage batteries.', 3, true),
  ('Mounting Structures', 'mounting-structures', 'Galvanized iron and aluminum solar mounting frames.', 4, true),
  ('Solar Accessories', 'solar-accessories', 'DC cables, circuit breakers, SPD, and installation accessories.', 5, true)
ON CONFLICT (slug) DO NOTHING;

-- 2. Insert Major Brands
INSERT INTO public.brands (name, slug, tier_rating, description, is_active)
VALUES
  ('LONGi Solar', 'longi-solar', 'Tier 1', 'Global leader in high-efficiency monocrystalline solar cells and modules.', true),
  ('Jinko Solar', 'jinko-solar', 'Tier 1', 'N-Type Tiger Neo series solar panel manufacturer.', true),
  ('Inverex', 'inverex', 'Tier 1', 'Leading solar inverter and lithium battery brand in Pakistan.', true),
  ('Growatt', 'growatt', 'Tier 1', 'Global residential and commercial smart energy inverter specialist.', true),
  ('Pylontech', 'pylontech', 'Tier 1', 'Dedicated lithium iron phosphate (LiFePO4) battery storage system manufacturer.', true)
ON CONFLICT (slug) DO NOTHING;

-- 3. Insert Sample Products
INSERT INTO public.products (
  category_id, brand_id, name, slug, sku, short_description, description, specifications, regular_price, inventory_status, publication_status, is_featured
)
VALUES
  (
    (SELECT id FROM public.categories WHERE slug = 'solar-panels'),
    (SELECT id FROM public.brands WHERE slug = 'longi-solar'),
    'LONGi Hi-MO 6 580W Mono PERC Solar Panel',
    'longi-himo-6-580w-solar-panel',
    'PNL-LONGI-580W',
    '580W high-efficiency monocrystalline solar module.',
    'Designed for maximum energy yield in high-temperature environments like KPK.',
    '{"wattage": "580W", "cell_type": "Mono PERC", "efficiency": "22.5%", "warranty_years": 25}'::jsonb,
    29500.00,
    'in_stock',
    'published',
    true
  ),
  (
    (SELECT id FROM public.categories WHERE slug = 'solar-inverters'),
    (SELECT id FROM public.brands WHERE slug = 'inverex'),
    'Inverex Nitrox 6kW Hybrid Solar Inverter (IP65)',
    'inverex-nitrox-6kw-hybrid-inverter',
    'INV-NITROX-6KW',
    'Single-phase IP65 waterproof 6kW hybrid solar inverter with dual MPPT.',
    'Supports net metering, battery-less operation, and parallel connection.',
    '{"capacity": "6kW", "phase": "Single Phase", "ip_rating": "IP65", "mppt_count": 2, "warranty_years": 5}'::jsonb,
    365000.00,
    'in_stock',
    'published',
    true
  ),
  (
    (SELECT id FROM public.categories WHERE slug = 'lithium-batteries'),
    (SELECT id FROM public.brands WHERE slug = 'inverex'),
    'Inverex PowerWall 5.12kWh 48V Lithium Battery',
    'inverex-powerwall-5kwh-lithium-battery',
    'BAT-INV-5120WH',
    '48V 100Ah LiFePO4 wall-mounted lithium battery with 6000+ life cycles.',
    'Smart BMS communication compatible with Inverex, Growatt, and Solis inverters.',
    '{"capacity_kwh": "5.12kWh", "voltage": "51.2V", "Ah": "100Ah", "cycle_life": "6000+"}'::jsonb,
    310000.00,
    'in_stock',
    'published',
    true
  )
ON CONFLICT (sku) DO NOTHING;

-- 4. Insert a Sample 6kW Hybrid Solar Package & Components
INSERT INTO public.packages (
  name, slug, description, capacity_kw, installation_cost, additional_costs, manual_price_override, inventory_status, publication_status, is_featured
)
VALUES (
  '6kW Complete Hybrid Residential Solar System',
  '6kw-hybrid-residential-solar-package',
  'Complete turnkey 6kW solar system for a standard home running 2 Inverter ACs, fridge, water pump, and lights.',
  6.00,
  45000.00,
  35000.00,
  NULL,
  'in_stock',
  'published',
  true
)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.package_items (package_id, product_id, quantity, notes)
VALUES
  (
    (SELECT id FROM public.packages WHERE slug = '6kw-hybrid-residential-solar-package'),
    (SELECT id FROM public.products WHERE sku = 'PNL-LONGI-580W'),
    10,
    '10 x 580W Panels (5.8kW PV Array)'
  ),
  (
    (SELECT id FROM public.packages WHERE slug = '6kw-hybrid-residential-solar-package'),
    (SELECT id FROM public.products WHERE sku = 'INV-NITROX-6KW'),
    1,
    'Main Hybrid Inverter'
  ),
  (
    (SELECT id FROM public.packages WHERE slug = '6kw-hybrid-residential-solar-package'),
    (SELECT id FROM public.products WHERE sku = 'BAT-INV-5120WH'),
    1,
    '5.12kWh Lithium Backup'
  )
ON CONFLICT (package_id, product_id) DO NOTHING;