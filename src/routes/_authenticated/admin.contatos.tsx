import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Trash2 } from "lucide-react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/admin/contatos")({ component: AdminContatos });

const statusColors: Record<string, string> = {
  novo: "bg-blue-100 text-blue-800",
  em_andamento: "bg-yellow-100 text-yellow-800",
  finalizado: "bg-green-100 text-green-800",
};
const statusLabel: Record<string, string> = { novo: "Novo", em_andamento: "Em andamento", finalizado: "Finalizado" };

function AdminContatos() {
  const qc = useQueryClient();
  const { data } = useQuery({
    queryKey: ["admin", "contacts"],
    queryFn: async () => { const { data, error } = await supabase.from("contact_messages").select("*").order("created_at", { ascending: false }); if (error) throw error; return data ?? []; },
  });
  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: "novo" | "em_andamento" | "finalizado" }) => {
      const { error } = await supabase.from("contact_messages").update({ status }).eq("id", id); if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "contacts"] }),
  });
  const del = useMutation({
    mutationFn: async (id: string) => { const { error } = await supabase.from("contact_messages").delete().eq("id", id); if (error) throw error; },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin", "contacts"] }); toast.success("Removido"); },
  });

  return (
    <AdminLayout title="Mensagens recebidas">
      <div className="space-y-4">
        {data?.map((m) => (
          <div key={m.id} className="rounded-3xl bg-background ring-1 ring-border p-6">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <h3 className="font-display text-xl">{m.name}</h3>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${statusColors[m.status]}`}>{statusLabel[m.status]}</span>
                </div>
                <div className="text-sm text-muted-foreground">{m.phone}{m.email && ` · ${m.email}`}{m.city && ` · ${m.city}`}</div>
                {m.service_type && <div className="text-xs text-muted-foreground mt-1">Serviço: {m.service_type}</div>}
              </div>
              <div className="text-xs text-muted-foreground">{new Date(m.created_at).toLocaleString("pt-BR")}</div>
            </div>
            <p className="mt-4 text-sm leading-relaxed">{m.message}</p>
            <div className="mt-4 flex items-center gap-2 flex-wrap">
              <select value={m.status} onChange={(e) => updateStatus.mutate({ id: m.id, status: e.target.value as "novo" | "em_andamento" | "finalizado" })} className="rounded-full border border-border px-3 py-1.5 text-sm">
                <option value="novo">Novo</option>
                <option value="em_andamento">Em andamento</option>
                <option value="finalizado">Finalizado</option>
              </select>
              <a href={`https://wa.me/${m.phone.replace(/\D/g, "")}`} target="_blank" rel="noreferrer" className="text-sm rounded-full border border-border px-3 py-1.5 hover:bg-muted">WhatsApp</a>
              <button onClick={() => { if (confirm("Excluir mensagem?")) del.mutate(m.id); }} className="ml-auto p-2 hover:bg-muted rounded-lg"><Trash2 className="h-4 w-4" /></button>
            </div>
          </div>
        ))}
        {data && data.length === 0 && <div className="text-center text-muted-foreground py-12">Nenhuma mensagem ainda.</div>}
      </div>
    </AdminLayout>
  );
}
