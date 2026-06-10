import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, Star, Check } from "lucide-react";
import { PublicLayout } from "@/components/site/PublicLayout";
import { WhatsAppFab } from "@/components/site/WhatsAppFab";
import { settingsQuery, servicesQuery, featuredProjectsQuery, testimonialsQuery } from "@/lib/queries";
import logoAsset from "@/assets/pintarbh-logo.png.asset.json";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "PintarBH — Pintura Profissional em Belo Horizonte" },
      { name: "description", content: "Pintura residencial, comercial e industrial em BH com acabamento premium." },
      { property: "og:title", content: "PintarBH" },
      { property: "og:description", content: "Cores que transformam ambientes." },
      { property: "og:url", content: "/" },
    ],
    links: [{ rel: "canonical", href: "/" }],
  }),
  component: Index,
});

function Index() {
  const { data: s } = useQuery(settingsQuery);
  const { data: services } = useQuery(servicesQuery);
  const { data: projects } = useQuery(featuredProjectsQuery);
  const { data: testimonials } = useQuery(testimonialsQuery);

  return (
    <PublicLayout>
      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="mx-auto max-w-7xl px-6 lg:px-10 pt-16 pb-24 lg:pt-24 lg:pb-32 grid lg:grid-cols-2 gap-12 items-center">
          <div className="animate-fade-up">
            <div className="inline-flex items-center gap-2 rounded-full border border-border px-3 py-1 text-xs text-muted-foreground mb-6">
              <span className="h-1.5 w-1.5 rounded-full bg-foreground" />
              Pintura profissional em Belo Horizonte
            </div>
            <h1 className="font-display text-5xl lg:text-7xl leading-[1.05] tracking-tight">
              {s?.hero_title || "Cores que transformam ambientes"}
            </h1>
            <p className="mt-6 text-lg text-muted-foreground max-w-xl leading-relaxed">
              {s?.hero_subtitle}
            </p>
            <div className="mt-10 flex flex-wrap gap-3">
              <Link
                to="/contato"
                className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground hover:opacity-90 transition"
              >
                Solicitar orçamento <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/portfolio"
                className="inline-flex items-center gap-2 rounded-full border border-border px-6 py-3 text-sm font-medium hover:bg-muted transition"
              >
                Ver trabalhos
              </Link>
            </div>
           <div className="mt-12 flex items-center gap-8 text-sm text-muted-foreground">
  <div>
    <div className="text-2xl text-foreground font-bold font-sans">
      +500
    </div>
    projetos entregues
  </div>

  <div className="h-10 w-px bg-border" />

  <div>
    <div className="text-2xl text-foreground">
      <span className="font-bold font-sans">15</span>
      <span className="font-display ml-1">anos</span>
    </div>
    de experiência
  </div>
</div>
          </div>
          <div className="relative">
            <div className="aspect-[4/5] rounded-3xl overflow-hidden ring-1 ring-border shadow-xl">
              <img
                src={s?.hero_image_url || "https://images.unsplash.com/photo-1562259949-e8e7689d7828?w=1200&q=80"}
                alt="Pintura profissional"
                className="h-full w-full object-cover"
              />
            </div>
            <div className="absolute -bottom-6 -left-6 bg-background rounded-2xl shadow-xl ring-1 ring-border p-5 max-w-xs hidden sm:block">
              <div className="flex items-center gap-1 text-yellow-500 mb-2">
                {Array.from({ length: 5 }).map((_, i) => <Star key={i} className="h-4 w-4 fill-current" />)}
              </div>
              <p className="text-sm text-foreground">"Resultado impecável e prazo cumprido."</p>
              <p className="text-xs text-muted-foreground mt-2">— Cliente residencial</p>
            </div>
            <img src={logoAsset.url} alt="" className="absolute -top-6 -right-6 h-24 w-24 rounded-full ring-4 ring-background shadow-lg" />
          </div>
        </div>
        <div aria-hidden className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
      </section>

      {/* SERVICES */}
      <section className="py-24 bg-muted/40">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <div className="flex items-end justify-between mb-14 flex-wrap gap-4">
            <div className="max-w-xl">
              <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground mb-3">Nossos serviços</p>
              <h2 className="font-display text-4xl lg:text-5xl">Soluções completas em pintura</h2>
            </div>
            <Link to="/servicos" className="text-sm font-medium underline underline-offset-4">Ver todos os serviços</Link>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {services?.slice(0, 6).map((srv) => (
              <div key={srv.id} className="group rounded-3xl bg-background ring-1 ring-border p-8 hover:shadow-lg transition">
                <div className="rainbow-strip mb-6 w-12" />
                <h3 className="font-display text-2xl mb-3">{srv.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{srv.short_description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* RECENT WORK */}
      <section className="py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <div className="flex items-end justify-between mb-14 flex-wrap gap-4">
            <div>
              <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground mb-3">Portfólio</p>
              <h2 className="font-display text-4xl lg:text-5xl">Trabalhos recentes</h2>
            </div>
            <Link to="/portfolio" className="text-sm font-medium underline underline-offset-4">Ver portfólio completo</Link>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {projects?.map((p) => (
              <Link
                key={p.id}
                to="/portfolio/$slug"
                params={{ slug: p.slug }}
                className="group rounded-3xl overflow-hidden ring-1 ring-border bg-background"
              >
                <div className="aspect-[4/3] overflow-hidden">
                  <img src={p.cover_image_url ?? ""} alt={p.title} className="h-full w-full object-cover group-hover:scale-105 transition duration-700" />
                </div>
                <div className="p-6">
                  <div className="text-xs uppercase tracking-widest text-muted-foreground mb-2">{p.category}</div>
                  <h3 className="font-display text-2xl mb-2">{p.title}</h3>
                  <p className="text-sm text-muted-foreground">{p.short_description}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="py-24 bg-muted/40">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground mb-3 text-center">Depoimentos</p>
          <h2 className="font-display text-4xl lg:text-5xl text-center mb-14">O que dizem nossos clientes</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials?.slice(0, 3).map((t) => (
              <div key={t.id} className="rounded-3xl bg-background ring-1 ring-border p-8">
                <div className="flex items-center gap-1 text-yellow-500 mb-4">
                  {Array.from({ length: t.rating }).map((_, i) => <Star key={i} className="h-4 w-4 fill-current" />)}
                </div>
                <p className="text-foreground leading-relaxed mb-6">"{t.comment}"</p>
                <div>
                  <div className="font-medium">{t.client_name}</div>
                  <div className="text-xs text-muted-foreground">{t.city}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24">
        <div className="mx-auto max-w-5xl px-6 lg:px-10">
          <div className="rounded-3xl bg-primary text-primary-foreground p-12 lg:p-16 relative overflow-hidden">
            <div className="rainbow-strip absolute top-0 left-0 right-0" />
            <h2 className="font-display text-4xl lg:text-5xl max-w-2xl">Pronto para transformar seu ambiente?</h2>
            <p className="mt-4 max-w-xl text-primary-foreground/80">Solicite um orçamento sem compromisso. Atendemos toda a região metropolitana de Belo Horizonte.</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/contato" className="inline-flex items-center gap-2 rounded-full bg-primary-foreground text-primary px-6 py-3 text-sm font-medium hover:opacity-90">
                Falar conosco <ArrowRight className="h-4 w-4" />
              </Link>
              <a href={`https://wa.me/${s?.whatsapp || "5531999999999"}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-full border border-primary-foreground/30 px-6 py-3 text-sm font-medium hover:bg-primary-foreground/10">
                <Check className="h-4 w-4" /> WhatsApp
              </a>
            </div>
          </div>
        </div>
      </section>
      <WhatsAppFab />
    </PublicLayout>
  );
}
