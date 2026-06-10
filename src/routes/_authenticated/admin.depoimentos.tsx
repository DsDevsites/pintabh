import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Plus, Trash2, Pencil, X, Save } from "lucide-react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/admin/depoimentos")({ component: AdminDepoimentos });

type T = { id?: string; client_name: string; city: string | null; rating: number; comment: string; photo_url: string | null; is_active: boolean; sort_order: number };
const empty: T = { client_name: "", city: "", rating: 5, comment: "", photo_url: "", is_active: true, sort_order: 0 };

function AdminDepoimentos() {
  const qc = useQueryClient();
  const [editing, setEditing] = useState<T | null>(null);
  const { data } = useQuery({
    queryKey: ["admin", "testimonials"],
    queryFn: async () => { const { data, error } = await supabase.from("testimonials").select("*").order("sort_order"); if (error) throw error; return data ?? []; },
  });
  const save = useMutation({
    mutationFn: async (t: T) => {
      const payload = { ...t, city: t.city || null, photo_url: t.photo_url || null };
      if (t.id) { const { error } = await supabase.from("testimonials").update(payload).eq("id", t.id); if (error) throw error; }
      else { const { error } = await supabase.from("testimonials").insert(payload); if (error) throw error; }
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin", "testimonials"] }); qc.invalidateQueries({ queryKey: ["testimonials"] }); toast.success("Salvo"); setEditing(null); },
  });
  const del = useMutation({
    mutationFn: async (id: string) => { const { error } = await supabase.from("testimonials").delete().eq("id", id); if (error) throw error; },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin", "testimonials"] }); qc.invalidateQueries({ queryKey: ["testimonials"] }); },
  });
  return (
    <AdminLayout title="Depoimentos">
      <button onClick={() => setEditing({ ...empty })} className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm text-primary-foreground mb-6"><Plus className="h-4 w-4" /> Novo</button>
      <div className="grid md:grid-cols-2 gap-6">
        {data?.map((t) => (
          <div key={t.id} className="rounded-3xl bg-background ring-1 ring-border p-6">
            <div className="text-yellow-500 mb-2">{"★".repeat(t.rating)}</div>
            <p className="text-sm mb-4">"{t.comment}"</p>
            <div className="flex items-end justify-between">
              <div><div className="font-medium">{t.client_name}</div><div className="text-xs text-muted-foreground">{t.city}</div></div>
              <div>
                <button onClick={() => setEditing(t as T)} className="p-2 hover:bg-muted rounded-lg"><Pencil className="h-4 w-4" /></button>
                <button onClick={() => { if (confirm("Excluir?")) del.mutate(t.id); }} className="p-2 hover:bg-muted rounded-lg"><Trash2 className="h-4 w-4" /></button>
              </div>
            </div>
          </div>
        ))}
      </div>
      {editing && (
        <div className="fixed inset-0 bg-black/40 grid place-items-center p-4 z-50" onClick={() => setEditing(null)}>
          <div className="bg-background rounded-3xl p-8 w-full max-w-xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6"><h2 className="font-display text-2xl">Depoimento</h2><button onClick={() => setEditing(null)}><X className="h-5 w-5" /></button></div>
            <div className="grid gap-4">
              <F label="Nome" value={editing.client_name} onChange={(v) => setEditing({ ...editing, client_name: v })} />
              <F label="Cidade" value={editing.city ?? ""} onChange={(v) => setEditing({ ...editing, city: v })} />
              <F label="Foto (URL)" value={editing.photo_url ?? ""} onChange={(v) => setEditing({ ...editing, photo_url: v })} />
              <div className="grid grid-cols-2 gap-4">
                <F label="Avaliação (1-5)" type="number" value={String(editing.rating)} onChange={(v) => setEditing({ ...editing, rating: Math.max(1, Math.min(5, Number(v))) })} />
                <F label="Ordem" type="number" value={String(editing.sort_order)} onChange={(v) => setEditing({ ...editing, sort_order: Number(v) })} />
              </div>
              <div>
                <label className="text-xs uppercase tracking-widest text-muted-foreground mb-1.5 block">Comentário</label>
                <textarea rows={4} value={editing.comment} onChange={(e) => setEditing({ ...editing, comment: e.target.value })} className="w-full rounded-xl border border-border px-4 py-3 text-sm" />
              </div>
              <button onClick={() => save.mutate(editing)} className="rounded-full bg-primary px-6 py-3 text-sm text-primary-foreground inline-flex items-center justify-center gap-2"><Save className="h-4 w-4" /> Salvar</button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
function F({ label, value, onChange, type = "text" }: { label: string; value: string; onChange: (v: string) => void; type?: string }) {
  return <div><label className="text-xs uppercase tracking-widest text-muted-foreground mb-1.5 block">{label}</label><input type={type} value={value} onChange={(e) => onChange(e.target.value)} className="w-full rounded-xl border border-border px-4 py-3 text-sm" /></div>;
}
