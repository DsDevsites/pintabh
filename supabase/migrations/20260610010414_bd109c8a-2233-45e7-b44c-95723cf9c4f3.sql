
-- Enum for roles (separate table approach prevents privilege escalation)
CREATE TYPE public.app_role AS ENUM ('admin', 'editor');

-- Profiles table (auto-created on signup)
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Profiles are viewable by authenticated users" ON public.profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id);

-- User roles
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer for role check
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

CREATE POLICY "Users can view own roles" ON public.user_roles FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Admins manage roles" ON public.user_roles FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- updated_at trigger
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

-- Handle new user (profile + first user becomes admin)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email));
  -- First user automatically becomes admin
  IF NOT EXISTS (SELECT 1 FROM public.user_roles WHERE role = 'admin') THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'admin');
  END IF;
  RETURN NEW;
END; $$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Site settings (singleton)
CREATE TABLE public.site_settings (
  id INT PRIMARY KEY DEFAULT 1,
  company_name TEXT NOT NULL DEFAULT 'PintarBH',
  slogan TEXT DEFAULT 'Pintura profissional que transforma seus espaços',
  logo_url TEXT,
  logo_secondary_url TEXT,
  favicon_url TEXT,
  phone TEXT DEFAULT '(31) 99999-9999',
  whatsapp TEXT DEFAULT '5531999999999',
  email TEXT DEFAULT 'contato@pintarbh.com.br',
  address TEXT DEFAULT 'Belo Horizonte, MG',
  business_hours TEXT DEFAULT 'Seg a Sex: 8h às 18h | Sáb: 8h às 12h',
  instagram_url TEXT,
  facebook_url TEXT,
  hero_title TEXT DEFAULT 'Cores que transformam ambientes',
  hero_subtitle TEXT DEFAULT 'Pintura residencial, comercial e industrial em Belo Horizonte com acabamento premium e atenção a cada detalhe.',
  hero_image_url TEXT,
  about_history TEXT DEFAULT 'A PintarBH nasceu da paixão por transformar ambientes através das cores.',
  about_mission TEXT DEFAULT 'Entregar serviços de pintura com excelência, valorizando o tempo e o espaço de cada cliente.',
  about_vision TEXT DEFAULT 'Ser referência em pintura profissional na grande BH.',
  about_values TEXT DEFAULT 'Qualidade, pontualidade, transparência e respeito ao cliente.',
  footer_text TEXT DEFAULT 'PintarBH — Pintura profissional em Belo Horizonte',
  primary_color TEXT DEFAULT '#111111',
  seo_title TEXT DEFAULT 'PintarBH — Pintura Profissional em Belo Horizonte',
  seo_description TEXT DEFAULT 'Empresa especializada em pintura residencial, comercial e industrial em BH. Orçamento sem compromisso.',
  seo_keywords TEXT DEFAULT 'pintura, pintor, belo horizonte, pintarbh, pintura residencial, pintura comercial',
  og_image_url TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.site_settings TO anon, authenticated;
GRANT UPDATE ON public.site_settings TO authenticated;
GRANT ALL ON public.site_settings TO service_role;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read site settings" ON public.site_settings FOR SELECT USING (true);
CREATE POLICY "Admins can update settings" ON public.site_settings FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

INSERT INTO public.site_settings (id) VALUES (1);

-- Services
CREATE TABLE public.services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  short_description TEXT,
  description TEXT,
  image_url TEXT,
  icon TEXT,
  sort_order INT NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.services TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.services TO authenticated;
GRANT ALL ON public.services TO service_role;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view active services" ON public.services FOR SELECT USING (true);
CREATE POLICY "Admins manage services" ON public.services FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER services_updated_at BEFORE UPDATE ON public.services FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

INSERT INTO public.services (title, slug, short_description, description, icon, sort_order) VALUES
('Pintura Residencial', 'pintura-residencial', 'Transforme sua casa com cores e acabamento impecável.', 'Atendemos casas e apartamentos com pintura interna e externa, preparo completo das superfícies, proteção de móveis e limpeza ao final do serviço. Trabalhamos com tintas premium e garantia de acabamento.', 'Home', 1),
('Pintura Comercial', 'pintura-comercial', 'Ambientes profissionais com mínima interrupção da rotina.', 'Lojas, escritórios, restaurantes e clínicas. Planejamos cronogramas flexíveis (noites e finais de semana) para não impactar sua operação.', 'Building2', 2),
('Pintura Industrial', 'pintura-industrial', 'Soluções técnicas para galpões e estruturas metálicas.', 'Pintura de pisos industriais, estruturas metálicas, fachadas e sinalização horizontal com tintas técnicas de alta durabilidade.', 'Factory', 3),
('Textura e Grafiato', 'textura-grafiato', 'Acabamentos diferenciados para destacar paredes.', 'Aplicação de texturas decorativas, grafiato, marmorato e efeitos especiais sob medida para seu ambiente.', 'Brush', 4),
('Pintura Epóxi', 'pintura-epoxi', 'Pisos resistentes para garagens, cozinhas e indústrias.', 'Pintura epóxi de alto desempenho com tratamento de trincas, primer adequado e acabamento liso ou antiderrapante.', 'Layers', 5),
('Reformas e Reparos', 'reformas-reparos', 'Pequenos reparos antes da pintura: tudo no mesmo serviço.', 'Massa corrida, gesso, pequenos reparos de alvenaria e elétrica para deixar tudo perfeito antes da pintura final.', 'Wrench', 6);

-- Projects (portfolio)
CREATE TABLE public.projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  short_description TEXT,
  description TEXT,
  category TEXT NOT NULL DEFAULT 'residencial',
  cover_image_url TEXT,
  location TEXT,
  project_date DATE,
  services_done TEXT,
  is_featured BOOLEAN NOT NULL DEFAULT false,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.projects TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.projects TO authenticated;
GRANT ALL ON public.projects TO service_role;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view projects" ON public.projects FOR SELECT USING (true);
CREATE POLICY "Admins manage projects" ON public.projects FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER projects_updated_at BEFORE UPDATE ON public.projects FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

INSERT INTO public.projects (title, slug, short_description, description, category, location, project_date, services_done, is_featured, sort_order, cover_image_url) VALUES
('Apartamento Belvedere', 'apartamento-belvedere', 'Reforma completa com tons neutros e sofisticados.', 'Pintura interna completa de apartamento de 220m² no bairro Belvedere. Tons off-white nas áreas sociais, com paredes de destaque em verde sálvia nos quartos.', 'residencial', 'Belo Horizonte, MG', '2025-03-12', 'Pintura interna, massa corrida, reparos', true, 1, 'https://images.unsplash.com/photo-1505691938895-1758d7feb511?w=1200&q=80'),
('Loja Savassi', 'loja-savassi', 'Identidade visual elegante para varejo de moda.', 'Pintura de loja de roupas com paredes em preto fosco, detalhes em dourado e acabamento perolado no teto.', 'comercial', 'Savassi, BH', '2025-04-20', 'Pintura comercial, textura, acabamento especial', true, 2, 'https://images.unsplash.com/photo-1604014237800-1c9102c219da?w=1200&q=80'),
('Galpão Industrial Contagem', 'galpao-industrial-contagem', 'Pintura técnica de galpão de 3.000m² com piso epóxi.', 'Pintura completa de galpão industrial com estrutura metálica, piso epóxi antiderrapante e sinalização horizontal.', 'industrial', 'Contagem, MG', '2025-02-05', 'Pintura industrial, epóxi, estrutura metálica', false, 3, 'https://images.unsplash.com/photo-1565182999561-18d7dc61c393?w=1200&q=80'),
('Casa Lourdes', 'casa-lourdes', 'Fachada renovada com pintura externa premium.', 'Pintura completa de fachada com preparo, impermeabilização e acabamento acetinado em tons terrosos.', 'residencial', 'Lourdes, BH', '2025-05-10', 'Pintura externa, impermeabilização', true, 4, 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&q=80');

CREATE TABLE public.project_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  caption TEXT,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.project_images TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.project_images TO authenticated;
GRANT ALL ON public.project_images TO service_role;
ALTER TABLE public.project_images ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view project images" ON public.project_images FOR SELECT USING (true);
CREATE POLICY "Admins manage project images" ON public.project_images FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Testimonials
CREATE TABLE public.testimonials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_name TEXT NOT NULL,
  city TEXT,
  rating INT NOT NULL DEFAULT 5 CHECK (rating BETWEEN 1 AND 5),
  comment TEXT NOT NULL,
  photo_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.testimonials TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.testimonials TO authenticated;
GRANT ALL ON public.testimonials TO service_role;
ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view testimonials" ON public.testimonials FOR SELECT USING (true);
CREATE POLICY "Admins manage testimonials" ON public.testimonials FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER testimonials_updated_at BEFORE UPDATE ON public.testimonials FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

INSERT INTO public.testimonials (client_name, city, rating, comment, sort_order) VALUES
('Mariana Costa', 'Belo Horizonte, MG', 5, 'Equipe extremamente profissional. Cumpriram o prazo e o resultado ficou impecável. Recomendo demais!', 1),
('Rodrigo Almeida', 'Nova Lima, MG', 5, 'Pintaram toda a fachada da minha casa em 4 dias. Limpeza e organização excepcionais.', 2),
('Juliana Pereira', 'Contagem, MG', 5, 'Atendimento sensacional desde o orçamento. Profissionais educados e caprichosos.', 3),
('Fernando Lima', 'Belo Horizonte, MG', 5, 'A loja ficou linda. Trabalharam à noite para não atrapalhar o movimento. Top!', 4);

-- Contact messages
CREATE TYPE public.contact_status AS ENUM ('novo', 'em_andamento', 'finalizado');

CREATE TABLE public.contact_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  city TEXT,
  service_type TEXT,
  message TEXT NOT NULL,
  status public.contact_status NOT NULL DEFAULT 'novo',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT INSERT ON public.contact_messages TO anon, authenticated;
GRANT SELECT, UPDATE, DELETE ON public.contact_messages TO authenticated;
GRANT ALL ON public.contact_messages TO service_role;
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can submit contact" ON public.contact_messages FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins view messages" ON public.contact_messages FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins update messages" ON public.contact_messages FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins delete messages" ON public.contact_messages FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER contact_messages_updated_at BEFORE UPDATE ON public.contact_messages FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
