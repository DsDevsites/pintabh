-- Orçamentos e pré-orçamentos da PintarBH
CREATE TYPE public.quote_status AS ENUM ('pre_orcamento', 'em_analise', 'finalizado');

CREATE TABLE public.quotes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_name TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  address TEXT,
  project_title TEXT,
  service_description TEXT,
  services JSONB NOT NULL DEFAULT '[]'::jsonb,
  materials JSONB NOT NULL DEFAULT '[]'::jsonb,
  labor_total NUMERIC(12,2) NOT NULL DEFAULT 0,
  material_total NUMERIC(12,2) NOT NULL DEFAULT 0,
  total NUMERIC(12,2) NOT NULL DEFAULT 0,
  payment_terms TEXT,
  notes TEXT,
  status public.quote_status NOT NULL DEFAULT 'pre_orcamento',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT ON public.quotes TO authenticated;
GRANT INSERT, UPDATE, DELETE ON public.quotes TO authenticated;
GRANT INSERT ON public.quotes TO anon;
GRANT ALL ON public.quotes TO service_role;

ALTER TABLE public.quotes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can create a pre-orcamento"
ON public.quotes FOR INSERT
TO anon, authenticated
WITH CHECK (status = 'pre_orcamento');

CREATE POLICY "Admins can view quotes"
ON public.quotes FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage quotes"
ON public.quotes FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete quotes"
ON public.quotes FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER quotes_updated_at
BEFORE UPDATE ON public.quotes
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

UPDATE public.site_settings
SET
  company_name = 'PintarBH',
  hero_title = 'PintarBH',
  hero_subtitle = 'Apês e apezinhos • Casas, casinhas • Paredes e paredinhas',
  footer_text = 'PintarBH — Pintura profissional em Belo Horizonte',
  primary_color = '#f68b63'
WHERE id = 1;
