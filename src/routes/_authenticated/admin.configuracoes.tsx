import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Save } from "lucide-react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { ImageUpload } from "@/components/admin/ImageUpload";
import { supabase } from "@/integrations/supabase/client";
import { settingsQuery } from "@/lib/queries";

export const Route = createFileRoute("/_authenticated/admin/configuracoes")({ component: AdminConfig });

function AdminConfig() {
  const qc = useQueryClient();
  const { data } = useQuery(settingsQuery);
  const [form, setForm] = useState<Record<string, string>>({});
  useEffect(() => { if (data) setForm(Object.fromEntries(Object.entries(data).map(([k, v]) => [k, v == null ? "" : String(v)]))); }, [data]);
  const save = useMutation({
    mutationFn: async () => {
      const payload = { ...form };
      delete payload.id; delete payload.updated_at;
      const cleaned = Object.fromEntries(Object.entries(payload).map(([k, v]) => [k, v === "" ? null : v]));
      const { error } = await supabase.from("site_settings").update(cleaned as never).eq("id", 1);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["site_settings"] }); toast.success("Configurações salvas!"); },
    onError: (e: Error) => toast.error(e.message),
  });

  const groups: { title: string; fields: { key: string; label: string; type?: string }[] }[] = [
    { title: "Identidade", fields: [
      { key: "company_name", label: "Nome da empresa" },
      { key: "slogan", label: "Slogan" },
      { key: "logo_url", label: "Logo principal", type: "image" },
      { key: "logo_secondary_url", label: "Logo secundária", type: "image" },
      { key: "favicon_url", label: "Favicon", type: "image" },
    ]},
    { title: "Contato", fields: [
      { key: "phone", label: "Telefone" },
      { key: "whatsapp", label: "WhatsApp (com DDI, ex: 5531...)" },
      { key: "email", label: "E-mail" },
      { key: "address", label: "Endereço" },
      { key: "business_hours", label: "Horário de funcionamento" },
      { key: "instagram_url", label: "Instagram URL" },
      { key: "facebook_url", label: "Facebook URL" },
    ]},
    { title: "Home", fields: [
      { key: "hero_title", label: "Título principal" },
      { key: "hero_subtitle", label: "Subtítulo", type: "textarea" },
      { key: "hero_image_url", label: "Imagem do banner", type: "image" },
    ]},
    { title: "Sobre", fields: [
      { key: "about_history", label: "História", type: "textarea" },
      { key: "about_mission", label: "Missão", type: "textarea" },
      { key: "about_vision", label: "Visão", type: "textarea" },
      { key: "about_values", label: "Valores", type: "textarea" },
    ]},
    { title: "SEO", fields: [
      { key: "seo_title", label: "Meta Title" },
      { key: "seo_description", label: "Meta Description", type: "textarea" },
      { key: "seo_keywords", label: "Keywords" },
      { key: "og_image_url", label: "Imagem Open Graph", type: "image" },
    ]},
    { title: "Rodapé / Cores", fields: [
      { key: "footer_text", label: "Texto do rodapé" },
      { key: "primary_color", label: "Cor primária (hex)" },
    ]},
  ];

  return (
    <AdminLayout title="Configurações gerais">
      <div className="space-y-8 max-w-3xl">
        {groups.map((g) => (
          <div key={g.title} className="rounded-3xl bg-background ring-1 ring-border p-8">
            <h2 className="font-display text-xl mb-6">{g.title}</h2>
            <div className="grid gap-4">
              {g.fields.map((f) => (
                <div key={f.key}>
                  <label className="text-xs uppercase tracking-widest text-muted-foreground mb-1.5 block">{f.label}</label>
                  {f.type === "image" ? (
                    <ImageUpload
                      value={form[f.key] ?? ""}
                      onChange={(url) => {
                        const next = { ...form, [f.key]: url };
                        setForm(next);
                        const payload: Record<string, string | null> = { [f.key]: url === "" ? null : url };
                        supabase.from("site_settings").update(payload as never).eq("id", 1).then(({ error }) => {
                          if (error) toast.error(error.message);
                          else qc.invalidateQueries({ queryKey: ["site_settings"] });
                        });
                      }}
                      folder={f.key}
                    />
                  ) : f.type === "textarea" ? (
                    <textarea rows={3} value={form[f.key] ?? ""} onChange={(e) => setForm({ ...form, [f.key]: e.target.value })} className="w-full rounded-xl border border-border px-4 py-3 text-sm" />
                  ) : (
                    <input value={form[f.key] ?? ""} onChange={(e) => setForm({ ...form, [f.key]: e.target.value })} className="w-full rounded-xl border border-border px-4 py-3 text-sm" />
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
        <button onClick={() => save.mutate()} disabled={save.isPending} className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground disabled:opacity-60">
          <Save className="h-4 w-4" /> {save.isPending ? "Salvando..." : "Salvar tudo"}
        </button>
      </div>
    </AdminLayout>
  );
}
