import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Plus, Trash2, Pencil, Save, X } from "lucide-react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { ImageUpload } from "@/components/admin/ImageUpload";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/admin/servicos")({ component: AdminServicos });

type Service = {
  id?: string; title: string; slug: string; short_description: string | null;
  description: string | null; image_url: string | null; sort_order: number; is_active: boolean;
};
const empty: Service = { title: "", slug: "", short_description: "", description: "", image_url: "", sort_order: 0, is_active: true };

function AdminServicos() {
  const qc = useQueryClient();
  const [editing, setEditing] = useState<Service | null>(null);
  const { data } = useQuery({
    queryKey: ["admin", "services"],
    queryFn: async () => {
      const { data, error } = await supabase.from("services").select("*").order("sort_order");
      if (error) throw error;
      return data ?? [];
    },
  });
  const save = useMutation({
    mutationFn: async (s: Service) => {
      const payload = { ...s, image_url: s.image_url || null, short_description: s.short_description || null, description: s.description || null };
      if (s.id) {
        const { error } = await supabase.from("services").update(payload).eq("id", s.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("services").insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin", "services"] }); qc.invalidateQueries({ queryKey: ["services"] }); toast.success("Salvo!"); setEditing(null); },
    onError: (e: Error) => toast.error(e.message),
  });
  const del = useMutation({
    mutationFn: async (id: string) => { const { error } = await supabase.from("services").delete().eq("id", id); if (error) throw error; },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin", "services"] }); qc.invalidateQueries({ queryKey: ["services"] }); toast.success("Removido"); },
  });

  return (
    <AdminLayout title="Serviços">
      <button onClick={() => setEditing({ ...empty })} className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm text-primary-foreground mb-6"><Plus className="h-4 w-4" /> Novo serviço</button>
      <div className="rounded-3xl bg-background ring-1 ring-border overflow-x-auto">
        <table className="w-full text-sm min-w-[600px]">
          <thead className="bg-muted/50 text-left">
            <tr><th className="p-4">Título</th><th className="p-4">Slug</th><th className="p-4">Ordem</th><th className="p-4">Ativo</th><th className="p-4"></th></tr>
          </thead>
          <tbody>
            {data?.map((s) => (
              <tr key={s.id} className="border-t border-border">
                <td className="p-4">{s.title}</td>
                <td className="p-4 text-muted-foreground">{s.slug}</td>
                <td className="p-4">{s.sort_order}</td>
                <td className="p-4">{s.is_active ? "Sim" : "Não"}</td>
                <td className="p-4 text-right whitespace-nowrap">
                  <button onClick={() => setEditing(s as Service)} className="p-2 hover:bg-muted rounded-lg"><Pencil className="h-4 w-4" /></button>
                  <button onClick={() => { if (confirm("Excluir?")) del.mutate(s.id!); }} className="p-2 hover:bg-muted rounded-lg ml-2"><Trash2 className="h-4 w-4" /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {editing && (
        <div className="fixed inset-0 bg-black/40 grid place-items-center p-4 z-50" onClick={() => setEditing(null)}>
          <div className="bg-background rounded-3xl p-6 sm:p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display text-2xl">{editing.id ? "Editar" : "Novo"} serviço</h2>
              <button onClick={() => setEditing(null)}><X className="h-5 w-5" /></button>
            </div>
            <div className="grid gap-4">
              <Input label="Título" value={editing.title} onChange={(v) => setEditing({ ...editing, title: v, slug: editing.slug || slugify(v) })} />
              <Input label="Slug" value={editing.slug} onChange={(v) => setEditing({ ...editing, slug: v })} />
              <Input label="Descrição curta" value={editing.short_description ?? ""} onChange={(v) => setEditing({ ...editing, short_description: v })} />
              <div>
                <label className="text-xs uppercase tracking-widest text-muted-foreground mb-1.5 block">Descrição completa</label>
                <textarea rows={4} value={editing.description ?? ""} onChange={(e) => setEditing({ ...editing, description: e.target.value })} className="w-full rounded-xl border border-border px-4 py-3 text-sm" />
              </div>
              <div>
                <label className="text-xs uppercase tracking-widest text-muted-foreground mb-1.5 block">Imagem</label>
                <ImageUpload value={editing.image_url ?? ""} onChange={(url) => setEditing({ ...editing, image_url: url })} folder="services" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Input label="Ordem" type="number" value={String(editing.sort_order)} onChange={(v) => setEditing({ ...editing, sort_order: Number(v) })} />
                <label className="flex items-center gap-2 mt-6"><input type="checkbox" checked={editing.is_active} onChange={(e) => setEditing({ ...editing, is_active: e.target.checked })} /> Ativo</label>
              </div>
              <button onClick={() => save.mutate(editing)} disabled={save.isPending} className="mt-2 inline-flex items-center justify-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground"><Save className="h-4 w-4" /> Salvar</button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}

function Input({ label, value, onChange, type = "text" }: { label: string; value: string; onChange: (v: string) => void; type?: string }) {
  return (
    <div>
      <label className="text-xs uppercase tracking-widest text-muted-foreground mb-1.5 block">{label}</label>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)} className="w-full rounded-xl border border-border px-4 py-3 text-sm" />
    </div>
  );
}

function slugify(s: string) {
  return s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}