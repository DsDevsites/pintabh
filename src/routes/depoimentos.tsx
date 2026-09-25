import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Star } from "lucide-react";
import { PublicLayout } from "@/components/site/PublicLayout";
import { testimonialsQuery } from "@/lib/queries";

export const Route = createFileRoute("/depoimentos")({
  head: () => ({
    meta: [
      { title: "Depoimentos — PintarBH" },
      { name: "description", content: "Veja o que dizem nossos clientes." },
      { property: "og:url", content: "/depoimentos" },
    ],
    links: [{ rel: "canonical", href: "/depoimentos" }],
  }),
  component: DepoimentosPage,
});

function DepoimentosPage() {
  const { data: testimonials } = useQuery(testimonialsQuery);
  return (
    <PublicLayout>
      <section className="py-24">
        <div className="mx-auto max-w-6xl px-6 lg:px-10">
          <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground mb-3">Depoimentos</p>
          <h1 className="font-display text-5xl lg:text-6xl mb-12">A confiança de quem já contratou</h1>
          <div className="grid md:grid-cols-2 gap-6">
            {testimonials?.map((t) => (
              <div key={t.id} className="rounded-3xl bg-background ring-1 ring-border p-8">
                <div className="flex items-center gap-1 text-yellow-500 mb-4">
                  {Array.from({ length: t.rating }).map((_, i) => <Star key={i} className="h-4 w-4 fill-current" />)}
                </div>
                <p className="text-foreground leading-relaxed mb-6 text-lg">"{t.comment}"</p>
                <div className="flex items-center gap-3">
                  {t.photo_url ? (
                    <img src={t.photo_url} alt="" className="h-10 w-10 rounded-full object-cover" loading="lazy" decoding="async" />
                  ) : (
                    <div className="h-10 w-10 rounded-full bg-muted grid place-items-center text-sm font-medium">
                      {t.client_name.charAt(0)}
                    </div>
                  )}
                  <div>
                    <div className="font-medium">{t.client_name}</div>
                    <div className="text-xs text-muted-foreground">{t.city}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
