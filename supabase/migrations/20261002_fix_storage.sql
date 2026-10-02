-- Ensure buckets exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('category-images', 'category-images', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public)
VALUES ('banner-images', 'banner-images', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO NOTHING;

-- Policies for category-images
CREATE POLICY "Public Access category-images" ON storage.objects
FOR SELECT USING (bucket_id = 'category-images');

CREATE POLICY "Anon Insert category-images" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'category-images');

CREATE POLICY "Anon Update category-images" ON storage.objects
FOR UPDATE USING (bucket_id = 'category-images');

CREATE POLICY "Anon Delete category-images" ON storage.objects
FOR DELETE USING (bucket_id = 'category-images');

-- Policies for banner-images
CREATE POLICY "Public Access banner-images" ON storage.objects
FOR SELECT USING (bucket_id = 'banner-images');

CREATE POLICY "Anon Insert banner-images" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'banner-images');

CREATE POLICY "Anon Update banner-images" ON storage.objects
FOR UPDATE USING (bucket_id = 'banner-images');

CREATE POLICY "Anon Delete banner-images" ON storage.objects
FOR DELETE USING (bucket_id = 'banner-images');

-- Policies for product-images
CREATE POLICY "Public Access product-images" ON storage.objects
FOR SELECT USING (bucket_id = 'product-images');

CREATE POLICY "Anon Insert product-images" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'product-images');

CREATE POLICY "Anon Update product-images" ON storage.objects
FOR UPDATE USING (bucket_id = 'product-images');

CREATE POLICY "Anon Delete product-images" ON storage.objects
FOR DELETE USING (bucket_id = 'product-images');
