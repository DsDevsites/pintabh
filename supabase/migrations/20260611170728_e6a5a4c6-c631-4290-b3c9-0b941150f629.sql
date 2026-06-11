
CREATE POLICY "Authenticated can upload site-images" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'site-images');
CREATE POLICY "Authenticated can update site-images" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'site-images');
CREATE POLICY "Authenticated can delete site-images" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'site-images');
CREATE POLICY "Authenticated can read site-images" ON storage.objects FOR SELECT TO authenticated USING (bucket_id = 'site-images');
