import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Plus, Trash2, Pencil, X, Save, Image as ImageIcon } from "lucide-react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { ImageUpload } from "@/components/admin/ImageUpload";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/admin/projetos")({ component: AdminProjetos });

type Project = {
  id?: string; title: string; slug: string; short_description: string | null; description: string | null;
  category: string; cover_image_url: string | null; location: string | null; project_date: string | null;
  services_done: string | null; is_featured: boolean; sort_order: number;
};
const empty: Project = { title: "", slug: "", short_description: "", description: "", category: "residencial", cover_image_url: "", location: "", project_date: null, services_done: "", is_featured: false, sort_order: 0 };

function AdminProjetos() {
  const qc = useQueryClient();
  const [editing, setEditing] = useState<Project | null>(null);
  const [imagesFor, setImagesFor] = useState<string | null>(null);

  const { data } = useQuery({
    queryKey: ["admin", "projects"],
    queryFn: async () => {
      const { data, error } = await supabase.from("projects").select("*").order("sort_order");
      if (error) throw error;
      return data ?? [];
    },
  });
  const save = useMutation({
    mutationFn: async (p: Project) => {
      const payload = { ...p };
      if (p.id) { const { error } = await supabase.from("projects").update(payload).eq("id", p.id); if (error) throw error; }
      else { const { error } = await supabase.from("projects").insert(payload); if (error) throw error; }
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin", "projects"] }); qc.invalidateQueries({ queryKey: ["projects"] }); toast.success("Salvo"); setEditing(null); },
    onError: (e: Error) => toast.error(e.message),
  });
  const del = useMutation({
    mutationFn: async (id: string) => { const { error } = await supabase.from("projects").delete().eq("id", id); if (error) throw error; },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin", "projects"] }); qc.invalidateQueries({ queryKey: ["projects"] }); toast.success("Removido"); },
  });

  return (
    <AdminLayout title="Projetos">
      <button onClick={() => setEditing({ ...empty })} className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm text-primary-foreground mb-6"><Plus className="h-4 w-4" /> Novo projeto</button>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {data?.map((p) => (
          <div key={p.id} className="rounded-3xl bg-background ring-1 ring-border overflow-hidden">
            <div className="aspect-[4/3] bg-muted overflow-hidden">{p.cover_image_url && <img src={p.cover_image_url} alt="" className="h-full w-full object-cover" />}</div>
            <div className="p-5">
              <div className="text-xs uppercase tracking-widest text-muted-foreground">{p.category}{p.is_featured && " · destaque"}</div>
              <h3 className="font-display text-lg mt-1">{p.title}</h3>
              <div className="flex items-center gap-1 mt-3">
                <button onClick={() => setEditing(p as Project)} className="p-2 hover:bg-muted rounded-lg"><Pencil className="h-4 w-4" /></button>
                <button onClick={() => setImagesFor(p.id)} className="p-2 hover:bg-muted rounded-lg"><ImageIcon className="h-4 w-4" /></button>
                <button onClick={() => { if (confirm("Excluir?")) del.mutate(p.id); }} className="p-2 hover:bg-muted rounded-lg ml-auto"><Trash2 className="h-4 w-4" /></button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {editing && <ProjectModal project={editing} onClose={() => setEditing(null)} onSave={(p) => save.mutate(p)} saving={save.isPending} />}
      {imagesFor && <ImagesModal projectId={imagesFor} onClose={() => setImagesFor(null)} />}
    </AdminLayout>
  );
}

function ProjectModal({ project, onClose, onSave, saving }: { project: Project; onClose: () => void; onSave: (p: Project) => void; saving: boolean }) {
  const [p, setP] = useState(project);
  return (
    <div className="fixed inset-0 bg-black/40 grid place-items-center p-4 z-50" onClick={onClose}>
      <div className="bg-background rounded-3xl p-6 sm:p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display text-2xl">{p.id ? "Editar" : "Novo"} projeto</h2>
          <button onClick={onClose}><X className="h-5 w-5" /></button>
        </div>
        <div className="grid gap-4">
          <Field label="Título" value={p.title} onChange={(v) => setP({ ...p, title: v, slug: p.slug || slugify(v) })} />
          <Field label="Slug" value={p.slug} onChange={(v) => setP({ ...p, slug: v })} />
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs uppercase tracking-widest text-muted-foreground mb-1.5 block">Categoria</label>
              <select value={p.category} onChange={(e) => setP({ ...p, category: e.target.value })} className="w-full rounded-xl border border-border px-4 py-3 text-sm">
                <option value="residencial">Residencial</option>
                <option value="comercial">Comercial</option>
                <option value="industrial">Industrial</option>
              </select>
            </div>
            <Field label="Local" value={p.location ?? ""} onChange={(v) => setP({ ...p, location: v })} />
          </div>
          <Field label="Descrição curta" value={p.short_description ?? ""} onChange={(v) => setP({ ...p, short_description: v })} />
          <div>
            <label className="text-xs uppercase tracking-widest text-muted-foreground mb-1.5 block">Descrição completa</label>
            <textarea rows={4} value={p.description ?? ""} onChange={(e) => setP({ ...p, description: e.target.value })} className="w-full rounded-xl border border-border px-4 py-3 text-sm" />
          </div>
          <div>
            <label className="text-xs uppercase tracking-widest text-muted-foreground mb-1.5 block">Imagem de capa</label>
            <ImageUpload value={p.cover_image_url ?? ""} onChange={(url) => setP({ ...p, cover_image_url: url })} folder="projects" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Data (YYYY-MM-DD)" value={p.project_date ?? ""} onChange={(v) => setP({ ...p, project_date: v || null })} />
            <Field label="Serviços executados" value={p.services_done ?? ""} onChange={(v) => setP({ ...p, services_done: v })} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Ordem" type="number" value={String(p.sort_order)} onChange={(v) => setP({ ...p, sort_order: Number(v) })} />
            <label className="flex items-center gap-2 mt-6"><input type="checkbox" checked={p.is_featured} onChange={(e) => setP({ ...p, is_featured: e.target.checked })} /> Destaque</label>
          </div>
          <button onClick={() => onSave(p)} disabled={saving} className="mt-2 inline-flex items-center justify-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground"><Save className="h-4 w-4" /> Salvar</button>
        </div>
      </div>
    </div>
  );
}

function ImagesModal({ projectId, onClose }: { projectId: string; onClose: () => void }) {
  const qc = useQueryClient();
  const [caption, setCaption] = useState("");
  const { data } = useQuery({
    queryKey: ["admin", "project_images", projectId],
    queryFn: async () => {
      const { data, error } = await supabase.from("project_images").select("*").eq("project_id", projectId).order("sort_order");
      if (error) throw error;
      return data ?? [];
    },
  });
  const add = useMutation({
    mutationFn: async (url: string) => { const { error } = await supabase.from("project_images").insert({ project_id: projectId, image_url: url, caption: caption || null }); if (error) throw error; },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin", "project_images", projectId] }); setCaption(""); toast.success("Imagem adicionada"); },
    onError: (e: Error) => toast.error(e.message),
  });
  const remove = useMutation({
    mutationFn: async (id: string) => { const { error } = await supabase.from("project_images").delete().eq("id", id); if (error) throw error; },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "project_images", projectId] }),
  });
  return (
    <div className="fixed inset-0 bg-black/40 grid place-items-center p-4 z-50" onClick={onClose}>
      <div className="bg-background rounded-3xl p-6 sm:p-8 w-full max-w-3xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display text-2xl">Galeria do projeto</h2>
          <button onClick={onClose}><X className="h-5 w-5" /></button>
        </div>
        <div className="space-y-3 mb-6 rounded-2xl bg-muted/40 p-4">
          <input
            placeholder="Legenda (opcional)"
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            className="w-full rounded-xl border border-border px-4 py-3 text-sm bg-background"
          />
          <ImageUpload value="" onChange={(url) => url && add.mutate(url)} folder={`projects/${projectId}`} />
          <p className="text-xs text-muted-foreground">A imagem é adicionada à galeria assim que o upload conclui.</p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {data?.map((img) => (
            <div key={img.id} className="relative rounded-2xl overflow-hidden ring-1 ring-border">
              <img src={img.image_url} className="aspect-square w-full object-cover" alt="" />
              <button onClick={() => remove.mutate(img.id)} className="absolute top-2 right-2 bg-background/90 rounded-full p-1.5"><Trash2 className="h-4 w-4" /></button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Field({ label, value, onChange, type = "text" }: { label: string; value: string; onChange: (v: string) => void; type?: string }) {
  return (
    <div>
      <label className="text-xs uppercase tracking-widest text-muted-foreground mb-1.5 block">{label}</label>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)} className="w-full rounded-xl border border-border px-4 py-3 text-sm" />
    </div>
  );
}
function slugify(s: string) { return s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""); }