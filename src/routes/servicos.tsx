import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { PublicLayout } from "@/components/site/PublicLayout";
import { servicesQuery } from "@/lib/queries";
import { ArrowRight } from "lucide-react";

export const Route = createFileRoute("/servicos")({
  head: () => ({
    meta: [
      { title: "Serviços — PintarBH" },
      { name: "description", content: "Pintura residencial, comercial, industrial, textura, epóxi e mais." },
      { property: "og:title", content: "Serviços — PintarBH" },
      { property: "og:url", content: "/servicos" },
    ],
    links: [{ rel: "canonical", href: "/servicos" }],
  }),
  component: ServicosPage,
});

function ServicosPage() {
  const { data: services } = useQuery(servicesQuery);
  return (
    <PublicLayout>
      <section className="py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground mb-3">Serviços</p>
          <h1 className="font-display text-5xl lg:text-6xl mb-6">Tudo em pintura, com excelência</h1>
          <p className="text-lg text-muted-foreground max-w-2xl">Soluções para residências, comércios e indústrias com atendimento personalizado.</p>
          <div className="mt-16 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {services?.map((s) => (
              <article key={s.id} className="rounded-3xl bg-background ring-1 ring-border overflow-hidden flex flex-col">
                <div className="aspect-[16/10] overflow-hidden bg-muted">
                  {s.image_url ? (
                    <img src={s.image_url} alt={s.title} className="h-full w-full object-cover" loading="lazy" decoding="async" />
                  ) : (
                    <div className="h-full w-full" style={{ background: "linear-gradient(135deg, oklch(0.97 0 0), oklch(0.92 0 0))" }} />
                  )}
                </div>
                <div className="p-8 flex-1 flex flex-col">
                  <div className="rainbow-strip w-10 mb-4" />
                  <h3 className="font-display text-2xl mb-3">{s.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed flex-1">{s.short_description}</p>
                  <Link to="/contato" className="mt-6 inline-flex items-center gap-2 text-sm font-medium hover:underline">
                    Solicitar este serviço <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
