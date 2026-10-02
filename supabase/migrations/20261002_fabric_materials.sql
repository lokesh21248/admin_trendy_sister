-- Migration: Create fabric_materials table and seed data

-- 1. Create table
CREATE TABLE IF NOT EXISTS public.fabric_materials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    CONSTRAINT fabric_materials_name_key UNIQUE (name),
    CONSTRAINT fabric_materials_slug_key UNIQUE (slug)
);

-- 2. Add RLS
ALTER TABLE public.fabric_materials ENABLE ROW LEVEL SECURITY;

-- 3. RLS Policies
-- Allow public (anon) to read active fabric materials
CREATE POLICY "Public Read Active Fabric Materials" 
ON public.fabric_materials 
FOR SELECT 
TO public
USING (is_active = true);

-- Allow authenticated users to read all fabric materials
CREATE POLICY "Authenticated Read All Fabric Materials" 
ON public.fabric_materials 
FOR SELECT 
TO authenticated
USING (true);

-- Allow authenticated users to insert/update/delete (Admin operations)
CREATE POLICY "Authenticated Insert Fabric Materials" 
ON public.fabric_materials 
FOR INSERT 
TO authenticated
WITH CHECK (true);

CREATE POLICY "Authenticated Update Fabric Materials" 
ON public.fabric_materials 
FOR UPDATE 
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Authenticated Delete Fabric Materials" 
ON public.fabric_materials 
FOR DELETE 
TO authenticated
USING (true);

-- 4. Seed initial data
INSERT INTO public.fabric_materials (name, slug, sort_order)
VALUES 
    ('Pure Silk', 'pure-silk', 10),
    ('Banarasi Silk', 'banarasi-silk', 20),
    ('Kanjivaram Silk', 'kanjivaram-silk', 30),
    ('Chanderi Silk', 'chanderi-silk', 40),
    ('Sambalpuri Silk', 'sambalpuri-silk', 50),
    ('Pure Cotton', 'pure-cotton', 60),
    ('Linen Cotton', 'linen-cotton', 70),
    ('Georgette', 'georgette', 80),
    ('Organza', 'organza', 90),
    ('Tussar Silk', 'tussar-silk', 100),
    ('Chiffon', 'chiffon', 110),
    ('Bandhani Silk', 'bandhani-silk', 120),
    ('Paithani Silk', 'paithani-silk', 130)
ON CONFLICT (name) DO NOTHING;

-- 5. Add fabric_material_id to products
-- First add the column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'fabric_material_id') THEN
        ALTER TABLE public.products ADD COLUMN fabric_material_id UUID REFERENCES public.fabric_materials(id) ON DELETE RESTRICT;
    END IF;
END $$;

-- 6. Migrate existing products to use the new fabric_material_id
-- We assume the old column is named 'fabric' and is of type TEXT
UPDATE public.products p
SET fabric_material_id = f.id
FROM public.fabric_materials f
WHERE p.fabric = f.name 
AND p.fabric_material_id IS NULL;

-- Note: We are keeping the old 'fabric' column for now to prevent breaking the existing site during transition.
-- You can drop it later once you confirm everything works.
