-- ==============================================================================
-- TRENDY SISTERS - ENABLE SUPABASE REALTIME FOR ORDERS & ORDER ITEMS
-- Run this in your Supabase SQL Editor to enable instant live push notifications 
-- to the admin panel when a customer books an order on the storefront.
-- ==============================================================================

-- 1. Enable replication on orders and order_items
ALTER TABLE public.orders REPLICA IDENTITY FULL;
ALTER TABLE public.order_items REPLICA IDENTITY FULL;

-- 2. Add orders and order_items to the supabase_realtime publication
DO $$
BEGIN
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;
  EXCEPTION
    WHEN duplicate_object THEN
      NULL; -- Table already in publication
  END;

  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.order_items;
  EXCEPTION
    WHEN duplicate_object THEN
      NULL; -- Table already in publication
  END;
END $$;

-- 3. Verify public read & write access policies
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "allow_all_orders" ON public.orders;
CREATE POLICY "allow_all_orders" ON public.orders FOR ALL USING (TRUE) WITH CHECK (TRUE);

ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "allow_all_order_items" ON public.order_items;
CREATE POLICY "allow_all_order_items" ON public.order_items FOR ALL USING (TRUE) WITH CHECK (TRUE);
