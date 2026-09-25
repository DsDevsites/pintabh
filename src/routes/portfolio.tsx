import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState, useMemo } from "react";
import { PublicLayout } from "@/components/site/PublicLayout";
import { projectsQuery } from "@/lib/queries";

export const Route = createFileRoute("/portfolio")({
  head: () => ({
    meta: [
      { title: "Portfólio — PintarBH" },
      { name: "description", content: "Galeria de projetos de pintura entregues pela PintarBH." },
      { property: "og:title", content: "Portfólio — PintarBH" },
      { property: "og:url", content: "/portfolio" },
    ],
    links: [{ rel: "canonical", href: "/portfolio" }],
  }),
  component: PortfolioPage,
});

function PortfolioPage() {
  const { data: projects } = useQuery(projectsQuery);
  const [filter, setFilter] = useState<string>("todos");
  const categories = useMemo(() => {
    const set = new Set(projects?.map((p) => p.category) ?? []);
    return ["todos", ...Array.from(set)];
  }, [projects]);
  const filtered = filter === "todos" ? projects : projects?.filter((p) => p.category === filter);
  return (
    <PublicLayout>
      <section className="py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground mb-3">Portfólio</p>
          <h1 className="font-display text-5xl lg:text-6xl mb-10">Trabalhos que falam por si</h1>
          <div className="flex flex-wrap gap-2 mb-10">
            {categories.map((c) => (
              <button
                key={c}
                onClick={() => setFilter(c)}
                className={`px-4 py-2 rounded-full text-sm capitalize border transition ${filter === c ? "bg-primary text-primary-foreground border-primary" : "border-border hover:bg-muted"}`}
              >
                {c}
              </button>
            ))}
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered?.map((p) => (
              <Link key={p.id} to="/portfolio/$slug" params={{ slug: p.slug }} className="group rounded-3xl overflow-hidden ring-1 ring-border bg-background">
                <div className="aspect-[4/3] overflow-hidden">
                  <img src={p.cover_image_url ?? ""} alt={p.title} className="h-full w-full object-cover group-hover:scale-105 transition duration-700" loading="lazy" decoding="async" />
                </div>
                <div className="p-6">
                  <div className="text-xs uppercase tracking-widest text-muted-foreground mb-2">{p.category}</div>
                  <h3 className="font-display text-xl mb-1">{p.title}</h3>
                  <p className="text-sm text-muted-foreground line-clamp-2">{p.short_description}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
