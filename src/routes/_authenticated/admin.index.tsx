import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/admin/")({
  component: Dashboard,
});

function Dashboard() {
  const { data: stats } = useQuery({
    queryKey: ["admin", "stats"],
    queryFn: async () => {
      const [s, p, t, m] = await Promise.all([
        supabase.from("services").select("id", { count: "exact", head: true }),
        supabase.from("projects").select("id", { count: "exact", head: true }),
        supabase.from("testimonials").select("id", { count: "exact", head: true }),
        supabase.from("contact_messages").select("id", { count: "exact", head: true }).eq("status", "novo"),
      ]);
      return { services: s.count ?? 0, projects: p.count ?? 0, testimonials: t.count ?? 0, newMessages: m.count ?? 0 };
    },
  });
  const cards = [
    { label: "Serviços", value: stats?.services ?? 0 },
    { label: "Projetos", value: stats?.projects ?? 0 },
    { label: "Depoimentos", value: stats?.testimonials ?? 0 },
    { label: "Mensagens novas", value: stats?.newMessages ?? 0 },
  ];
  return (
    <AdminLayout title="Dashboard">
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((c) => (
          <div key={c.label} className="rounded-3xl bg-background ring-1 ring-border p-6">
            <div className="text-sm text-muted-foreground">{c.label}</div>
            <div className="font-display text-4xl mt-2">{c.value}</div>
          </div>
        ))}
      </div>
      <div className="mt-10 rounded-3xl bg-background ring-1 ring-border p-8">
        <h2 className="font-display text-2xl mb-3">Bem-vindo ao painel</h2>
        <p className="text-muted-foreground">Use o menu lateral para gerenciar serviços, projetos, depoimentos, mensagens e as configurações do site.</p>
      </div>
    </AdminLayout>
  );
}
