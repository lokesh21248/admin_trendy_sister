-- Allow public (anon) full access to fabric_materials (since the admin dashboard uses anon key)

DROP POLICY IF EXISTS "Public Read Active Fabric Materials" ON public.fabric_materials;
DROP POLICY IF EXISTS "Authenticated Read All Fabric Materials" ON public.fabric_materials;
DROP POLICY IF EXISTS "Authenticated Insert Fabric Materials" ON public.fabric_materials;
DROP POLICY IF EXISTS "Authenticated Update Fabric Materials" ON public.fabric_materials;
DROP POLICY IF EXISTS "Authenticated Delete Fabric Materials" ON public.fabric_materials;

-- Create comprehensive anon policies
CREATE POLICY "Anon Read All Fabric Materials" 
ON public.fabric_materials 
FOR SELECT 
USING (true);

CREATE POLICY "Anon Insert Fabric Materials" 
ON public.fabric_materials 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Anon Update Fabric Materials" 
ON public.fabric_materials 
FOR UPDATE 
USING (true)
WITH CHECK (true);

CREATE POLICY "Anon Delete Fabric Materials" 
ON public.fabric_materials 
FOR DELETE 
USING (true);
