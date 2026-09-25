import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { PublicLayout } from "@/components/site/PublicLayout";
import { settingsQuery } from "@/lib/queries";
import { Award, Heart, Shield, Sparkles } from "lucide-react";

export const Route = createFileRoute("/sobre")({
  head: () => ({
    meta: [
      { title: "Sobre — PintarBH" },
      { name: "description", content: "Conheça a história, missão e valores da PintarBH." },
      { property: "og:title", content: "Sobre — PintarBH" },
      { property: "og:url", content: "/sobre" },
    ],
    links: [{ rel: "canonical", href: "/sobre" }],
  }),
  component: SobrePage,
});

function SobrePage() {
  const { data: s } = useQuery(settingsQuery);
  const values = [
    { icon: Award, title: "Qualidade", desc: "Materiais premium e mão de obra especializada em cada detalhe." },
    { icon: Shield, title: "Confiança", desc: "Transparência total no orçamento, prazo e execução." },
    { icon: Heart, title: "Cuidado", desc: "Tratamos seu ambiente com o respeito que merece." },
    { icon: Sparkles, title: "Acabamento", desc: "Entregamos resultados que encantam aos olhos." },
  ];
  return (
    <PublicLayout>
      <section className="py-24">
        <div className="mx-auto max-w-5xl px-6 lg:px-10">
          <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground mb-3">Sobre nós</p>
          <h1 className="font-display text-5xl lg:text-6xl mb-6">Pintura com alma e ofício</h1>
          <p className="text-lg text-muted-foreground leading-relaxed max-w-2xl">{s?.about_history}</p>
        </div>
      </section>
      <section className="py-16 bg-muted/40">
        <div className="mx-auto max-w-7xl px-6 lg:px-10 grid lg:grid-cols-3 gap-8">
          <div className="rounded-3xl bg-background ring-1 ring-border p-8">
            <div className="rainbow-strip w-12 mb-5" />
            <h3 className="font-display text-2xl mb-3">Missão</h3>
            <p className="text-muted-foreground leading-relaxed">{s?.about_mission}</p>
          </div>
          <div className="rounded-3xl bg-background ring-1 ring-border p-8">
            <div className="rainbow-strip w-12 mb-5" />
            <h3 className="font-display text-2xl mb-3">Visão</h3>
            <p className="text-muted-foreground leading-relaxed">{s?.about_vision}</p>
          </div>
          <div className="rounded-3xl bg-background ring-1 ring-border p-8">
            <div className="rainbow-strip w-12 mb-5" />
            <h3 className="font-display text-2xl mb-3">Valores</h3>
            <p className="text-muted-foreground leading-relaxed">{s?.about_values}</p>
          </div>
        </div>
      </section>
      <section className="py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <h2 className="font-display text-4xl mb-12">Nossos diferenciais</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((v) => (
              <div key={v.title} className="rounded-3xl ring-1 ring-border p-8">
                <v.icon className="h-6 w-6 mb-4" />
                <h3 className="font-display text-xl mb-2">{v.title}</h3>
                <p className="text-sm text-muted-foreground">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      <section className="py-16">
        <div className="mx-auto max-w-7xl px-6 lg:px-10 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {["1565182999561-18d7dc61c393","1604014237800-1c9102c219da","1505691938895-1758d7feb511"].map((id) => (
            <div key={id} className="aspect-square rounded-3xl overflow-hidden ring-1 ring-border">
              <img src={`https://images.unsplash.com/photo-${id}?w=800&q=80`} alt="" className="h-full w-full object-cover" loading="lazy" decoding="async" />
            </div>
          ))}
        </div>
      </section>
    </PublicLayout>
  );
}
