import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, MapPin, Calendar, Wrench } from "lucide-react";
import { PublicLayout } from "@/components/site/PublicLayout";
import { projectBySlugQuery } from "@/lib/queries";

export const Route = createFileRoute("/portfolio/$slug")({
  head: ({ params }) => ({
    meta: [
      { title: `${params.slug} — PintarBH` },
      { property: "og:url", content: `/portfolio/${params.slug}` },
    ],
    links: [{ rel: "canonical", href: `/portfolio/${params.slug}` }],
  }),
  component: ProjectPage,
  notFoundComponent: () => (
    <PublicLayout>
      <div className="mx-auto max-w-3xl px-6 py-32 text-center">
        <h1 className="font-display text-4xl mb-4">Projeto não encontrado</h1>
        <Link to="/portfolio" className="underline">Voltar ao portfólio</Link>
      </div>
    </PublicLayout>
  ),
  errorComponent: () => (
    <PublicLayout>
      <div className="mx-auto max-w-3xl px-6 py-32 text-center">
        <h1 className="font-display text-4xl mb-4">Erro ao carregar projeto</h1>
      </div>
    </PublicLayout>
  ),
});

function ProjectPage() {
  const { slug } = Route.useParams();
  const { data: project } = useQuery(projectBySlugQuery(slug));
  if (!project) throw notFound();
  const images = project.project_images ?? [];
  return (
    <PublicLayout>
      <article className="py-16">
        <div className="mx-auto max-w-5xl px-6 lg:px-10">
          <Link to="/portfolio" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8">
            <ArrowLeft className="h-4 w-4" /> Voltar ao portfólio
          </Link>
          <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground mb-3">{project.category}</p>
          <h1 className="font-display text-5xl lg:text-6xl mb-6">{project.title}</h1>
          <p className="text-lg text-muted-foreground max-w-3xl leading-relaxed">{project.description}</p>
          <div className="mt-8 flex flex-wrap gap-6 text-sm text-muted-foreground">
            {project.location && <span className="inline-flex items-center gap-2"><MapPin className="h-4 w-4" />{project.location}</span>}
            {project.project_date && <span className="inline-flex items-center gap-2"><Calendar className="h-4 w-4" />{new Date(project.project_date).toLocaleDateString("pt-BR")}</span>}
            {project.services_done && <span className="inline-flex items-center gap-2"><Wrench className="h-4 w-4" />{project.services_done}</span>}
          </div>
        </div>
        {project.cover_image_url && (
          <div className="mx-auto max-w-6xl px-6 lg:px-10 mt-12">
            <div className="aspect-[16/9] rounded-3xl overflow-hidden ring-1 ring-border">
              <img src={project.cover_image_url} alt={project.title} className="h-full w-full object-cover" fetchPriority="high" decoding="async" />
            </div>
          </div>
        )}
        {images.length > 0 && (
          <div className="mx-auto max-w-6xl px-6 lg:px-10 mt-6 grid sm:grid-cols-2 gap-6">
            {images.map((img) => (
              <figure key={img.id} className="rounded-3xl overflow-hidden ring-1 ring-border">
                <img src={img.image_url} alt={img.caption ?? ""} className="w-full h-full object-cover aspect-[4/3]" loading="lazy" decoding="async" />
                {img.caption && <figcaption className="p-4 text-sm text-muted-foreground">{img.caption}</figcaption>}
              </figure>
            ))}
          </div>
        )}
        <div className="mx-auto max-w-3xl px-6 mt-16 text-center">
          <Link to="/contato" className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground hover:opacity-90">
            Quero um projeto assim
          </Link>
        </div>
      </article>
    </PublicLayout>
  );
}
