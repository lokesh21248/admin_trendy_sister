-- ==============================================================================
-- TRENDY SISTERS - COUPONS & DISCOUNTS TABLE & RLS POLICIES
-- ==============================================================================

CREATE TABLE IF NOT EXISTS coupons (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  description TEXT,
  discount_type TEXT NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
  discount_value NUMERIC(10,2) NOT NULL,
  min_order_value NUMERIC(10,2) DEFAULT 0,
  max_discount_amount NUMERIC(10,2),
  usage_limit INT,
  times_used INT DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for instant coupon validation by code
CREATE INDEX IF NOT EXISTS idx_coupons_code ON coupons(UPPER(code));
CREATE INDEX IF NOT EXISTS idx_coupons_active ON coupons(is_active);

-- Enable RLS & Universal Policies
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "allow_all_coupons" ON coupons;
CREATE POLICY "allow_all_coupons" ON coupons FOR ALL USING (TRUE) WITH CHECK (TRUE);

-- Starter Promotional Vouchers
INSERT INTO coupons (code, description, discount_type, discount_value, min_order_value, max_discount_amount, is_active, times_used)
VALUES
  ('TRENDY40', 'Mega 40% Off on Heritage Silk & Festive Sarees', 'percentage', 40.00, 1999.00, 2000.00, true, 28),
  ('WELCOME15', 'Welcome Gift: 15% Off on Your First Saree Purchase', 'percentage', 15.00, 999.00, 750.00, true, 42),
  ('FESTIVE500', 'Flat ₹500 Off on Luxury Bridal Kanjivaram Collection', 'fixed', 500.00, 4999.00, 500.00, true, 15),
  ('SILK10', 'Special 10% Off on Pure Mulberry Silk Sarees', 'percentage', 10.00, 1499.00, 1000.00, true, 9)
ON CONFLICT (code) DO NOTHING;
