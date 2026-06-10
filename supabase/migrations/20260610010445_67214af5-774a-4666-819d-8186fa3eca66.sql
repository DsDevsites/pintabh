
DROP POLICY "Anyone can submit contact" ON public.contact_messages;
CREATE POLICY "Anyone can submit contact" ON public.contact_messages
FOR INSERT WITH CHECK (
  length(name) BETWEEN 2 AND 120 AND
  length(phone) BETWEEN 6 AND 30 AND
  (email IS NULL OR length(email) <= 200) AND
  (city IS NULL OR length(city) <= 120) AND
  (service_type IS NULL OR length(service_type) <= 80) AND
  length(message) BETWEEN 5 AND 4000
);
