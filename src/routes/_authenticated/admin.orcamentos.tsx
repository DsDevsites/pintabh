import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { FileText, Plus, Trash2, Printer, Save } from "lucide-react";
import { toast } from "sonner";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { settingsQuery } from "@/lib/queries";
import { supabase } from "@/integrations/supabase/client";
import { openQuotePrint, type QuoteItem, type QuotePdfData } from "@/lib/quote-pdf";

type Quote = {
  id: string;
  client_name: string;
  phone: string | null;
  email: string | null;
  address: string | null;
  project_title: string | null;
  service_description: string | null;
  services: unknown;
  materials: unknown;
  labor_total: number;
  material_total: number;
  total: number;
  payment_terms: string | null;
  notes: string | null;
  status: "pre_orcamento" | "em_analise" | "finalizado";
  created_at: string;
};

const emptyItem = (): QuoteItem => ({ description: "", quantity: 1, unit: "un.", unitPrice: 0, total: 0 });

function normalizeItems(value: unknown): QuoteItem[] {
  if (!Array.isArray(value)) return [];
  return value.map((item) => {
    const row = item as Partial<QuoteItem>;
    const quantity = Number(row.quantity) || 0;
    const unitPrice = Number(row.unitPrice) || 0;
    return {
      description: String(row.description || ""),
      quantity,
      unit: String(row.unit || "un."),
      unitPrice,
      total: Number(row.total) || quantity * unitPrice,
    };
  });
}

function calc(items: QuoteItem[]) {
  return items.reduce((sum, item) => sum + (Number(item.quantity) || 0) * (Number(item.unitPrice) || 0), 0);
}

export const Route = createFileRoute("/_authenticated/admin/orcamentos")({
  component: AdminOrcamentos,
});

function AdminOrcamentos() {
  const qc = useQueryClient();
  const { data: settings } = useQuery(settingsQuery);
  const { data: quotes = [] } = useQuery({
    queryKey: ["quotes"],
    queryFn: async () => {
      const { data, error } = await supabase.from("quotes").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = useMemo(() => quotes.find((quote) => quote.id === selectedId) ?? null, [quotes, selectedId]);

  const [form, setForm] = useState<QuotePdfData>({
    clientName: "",
    phone: "",
    email: "",
    address: "",
    projectTitle: "Orçamento de pintura",
    serviceDescription: "",
    services: [emptyItem()],
    materials: [emptyItem()],
    laborTotal: 0,
    materialTotal: 0,
    total: 0,
    paymentTerms: "50% no início do serviço e 50% na conclusão.",
    notes: "",
    logoUrl: settings?.logo_url || undefined,
  });

  useEffect(() => {
    if (!selected) return;
    const services = normalizeItems(selected.services);
    const materials = normalizeItems(selected.materials);
    const laborTotal = Number(selected.labor_total) || calc(services);
    const materialTotal = Number(selected.material_total) || calc(materials);
    setForm({
      clientName: selected.client_name,
      phone: selected.phone || "",
      email: selected.email || "",
      address: selected.address || "",
      projectTitle: selected.project_title || "Orçamento de pintura",
      serviceDescription: selected.service_description || "",
      services: services.length ? services : [emptyItem()],
      materials: materials.length ? materials : [emptyItem()],
      laborTotal,
      materialTotal,
      total: Number(selected.total) || laborTotal + materialTotal,
      paymentTerms: selected.payment_terms || "",
      notes: selected.notes || "",
      createdAt: selected.created_at,
      logoUrl: settings?.logo_url || undefined,
    });
  }, [selected, settings?.logo_url]);

  const save = useMutation({
    mutationFn: async () => {
      if (!form.clientName.trim()) throw new Error("Informe o cliente.");
      const services = form.services.filter((item) => item.description.trim());
      const materials = form.materials.filter((item) => item.description.trim());
      const laborTotal = calc(services);
      const materialTotal = calc(materials);
      const total = laborTotal + materialTotal;
      const payload = {
        client_name: form.clientName.trim(),
        phone: form.phone || null,
        email: form.email || null,
        address: form.address || null,
        project_title: form.projectTitle || "Orçamento de pintura",
        service_description: form.serviceDescription || null,
        services,
        materials,
        labor_total: laborTotal,
        material_total: materialTotal,
        total,
        payment_terms: form.paymentTerms || null,
        notes: form.notes || null,
        status: "finalizado" as const,
      };

      if (selectedId) {
        const { error } = await supabase.from("quotes").update(payload).eq("id", selectedId);
        if (error) throw error;
      } else {
        const { data, error } = await supabase.from("quotes").insert(payload).select("id").single();
        if (error) throw error;
        setSelectedId(data.id);
      }
      return { laborTotal, materialTotal, total };
    },
    onSuccess: ({ laborTotal, materialTotal, total }) => {
      setForm((current) => ({ ...current, laborTotal, materialTotal, total }));
      qc.invalidateQueries({ queryKey: ["quotes"] });
      toast.success("Orçamento salvo.");
    },
    onError: (error: Error) => toast.error(error.message),
  });

  function newQuote() {
    setSelectedId(null);
    setForm({
      clientName: "",
      phone: "",
      email: "",
      address: "",
      projectTitle: "Orçamento de pintura",
      serviceDescription: "",
      services: [emptyItem()],
      materials: [emptyItem()],
      laborTotal: 0,
      materialTotal: 0,
      total: 0,
      paymentTerms: "50% no início do serviço e 50% na conclusão.",
      notes: "",
      logoUrl: settings?.logo_url || undefined,
    });
  }

  function updateItem(kind: "services" | "materials", index: number, field: keyof QuoteItem, value: string) {
    setForm((current) => {
      const next = [...current[kind]];
      const item = { ...next[index], [field]: field === "description" || field === "unit" ? value : Number(value) || 0 };
      item.total = (Number(item.quantity) || 0) * (Number(item.unitPrice) || 0);
      next[index] = item;
      return { ...current, [kind]: next };
    });
  }

  function removeItem(kind: "services" | "materials", index: number) {
    setForm((current) => {
      const next = current[kind].filter((_, itemIndex) => itemIndex !== index);
      return { ...current, [kind]: next.length ? next : [emptyItem()] };
    });
  }

  return (
    <AdminLayout title="Orçamentos">
      <div className="grid xl:grid-cols-[320px_1fr] gap-6">
        <aside className="rounded-3xl bg-background ring-1 ring-border p-5 h-fit">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-xl">Pré-orçamentos</h2>
            <button onClick={newQuote} className="rounded-full p-2 bg-primary text-primary-foreground" title="Novo orçamento"><Plus className="h-4 w-4" /></button>
          </div>
          <div className="space-y-2">
            {quotes.length === 0 && <p className="text-sm text-muted-foreground">Nenhum orçamento recebido.</p>}
            {quotes.map((quote) => (
              <button key={quote.id} onClick={() => setSelectedId(quote.id)} className={`w-full text-left rounded-2xl border p-3 ${selectedId === quote.id ? "border-primary bg-secondary/40" : "border-border hover:bg-muted"}`}>
                <div className="font-medium truncate">{quote.client_name}</div>
                <div className="text-xs text-muted-foreground truncate">{quote.project_title || "Orçamento"}</div>
                <div className="text-[10px] uppercase tracking-widest mt-2">{quote.status.replace("_", " ")}</div>
              </button>
            ))}
          </div>
        </aside>

        <section className="rounded-3xl bg-background ring-1 ring-border p-5 sm:p-8">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-7">
            <div>
              <p className="text-xs uppercase tracking-widest text-muted-foreground">PintarBH</p>
              <h2 className="font-display text-3xl">Concluir orçamento</h2>
            </div>
            <div className="flex gap-2">
              <button onClick={() => save.mutate()} disabled={save.isPending} className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2.5 text-sm text-primary-foreground disabled:opacity-60"><Save className="h-4 w-4" />Salvar</button>
              <button onClick={() => openQuotePrint(form)} className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2.5 text-sm hover:bg-muted"><Printer className="h-4 w-4" />Gerar PDF</button>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <Input label="Cliente" value={form.clientName} onChange={(value) => setForm({ ...form, clientName: value })} />
            <Input label="Telefone" value={form.phone || ""} onChange={(value) => setForm({ ...form, phone: value })} />
            <Input label="E-mail" value={form.email || ""} onChange={(value) => setForm({ ...form, email: value })} />
            <Input label="Local" value={form.address || ""} onChange={(value) => setForm({ ...form, address: value })} />
            <Input label="Projeto" value={form.projectTitle || ""} onChange={(value) => setForm({ ...form, projectTitle: value })} />
          </div>
          <div className="mt-4">
            <label className="text-xs uppercase tracking-widest text-muted-foreground">Descrição do serviço</label>
            <textarea rows={3} value={form.serviceDescription || ""} onChange={(e) => setForm({ ...form, serviceDescription: e.target.value })} className="mt-1.5 w-full rounded-xl border border-border px-4 py-3 text-sm" />
          </div>

          <ItemEditor title="Serviços / execução" items={form.services} onAdd={() => setForm({ ...form, services: [...form.services, emptyItem()] })} onChange={(i, field, value) => updateItem("services", i, field, value)} onRemove={(i) => removeItem("services", i)} />
          <ItemEditor title="Materiais" items={form.materials} onAdd={() => setForm({ ...form, materials: [...form.materials, emptyItem()] })} onChange={(i, field, value) => updateItem("materials", i, field, value)} onRemove={(i) => removeItem("materials", i)} />

          <div className="grid md:grid-cols-3 gap-4 mt-6">
            <Money label="Mão de obra" value={form.laborTotal} />
            <Money label="Materiais" value={form.materialTotal} />
            <Money label="Total" value={form.total} />
          </div>
          <div className="mt-4 grid gap-4">
            <Input label="Forma de pagamento" value={form.paymentTerms || ""} onChange={(value) => setForm({ ...form, paymentTerms: value })} />
            <div>
              <label className="text-xs uppercase tracking-widest text-muted-foreground">Observações</label>
              <textarea rows={3} value={form.notes || ""} onChange={(e) => setForm({ ...form, notes: e.target.value })} className="mt-1.5 w-full rounded-xl border border-border px-4 py-3 text-sm" />
            </div>
          </div>

          <div className="mt-7 rounded-2xl bg-secondary/40 p-4 text-sm flex gap-3">
            <FileText className="h-5 w-5 shrink-0" />
            <span>O PDF segue o modelo enviado: página 1 com descrição, serviços e lista de materiais; página 2 com valores separados por item, mão de obra, materiais e total.</span>
          </div>
        </section>
      </div>
    </AdminLayout>
  );
}

function ItemEditor({ title, items, onAdd, onChange, onRemove }: { title: string; items: QuoteItem[]; onAdd: () => void; onChange: (index: number, field: keyof QuoteItem, value: string) => void; onRemove: (index: number) => void }) {
  return (
    <div className="mt-7">
      <div className="flex items-center justify-between mb-3"><h3 className="font-display text-xl">{title}</h3><button onClick={onAdd} className="text-sm underline">Adicionar item</button></div>
      <div className="space-y-3">
        {items.map((item, index) => (
          <div key={index} className="grid grid-cols-[1fr_80px_80px_120px_40px] gap-2 items-end">
            <Input label="Descrição" value={item.description} onChange={(value) => onChange(index, "description", value)} />
            <Input label="Qtd." type="number" value={String(item.quantity)} onChange={(value) => onChange(index, "quantity", value)} />
            <Input label="Un." value={item.unit} onChange={(value) => onChange(index, "unit", value)} />
            <Input label="Valor unit." type="number" value={String(item.unitPrice)} onChange={(value) => onChange(index, "unitPrice", value)} />
            <button onClick={() => onRemove(index)} className="h-11 rounded-xl border border-border hover:bg-muted grid place-items-center" aria-label="Excluir item"><Trash2 className="h-4 w-4" /></button>
          </div>
        ))}
      </div>
    </div>
  );
}

function Input({ label, value, onChange, type = "text" }: { label: string; value: string; onChange: (value: string) => void; type?: string }) {
  return <div><label className="text-[10px] uppercase tracking-widest text-muted-foreground block mb-1">{label}</label><input type={type} value={value} onChange={(e) => onChange(e.target.value)} className="w-full rounded-xl border border-border px-3 py-2.5 text-sm bg-background" /></div>;
}

function Money({ label, value }: { label: string; value: number }) {
  return <div className="rounded-2xl bg-muted/50 p-4"><div className="text-xs text-muted-foreground">{label}</div><div className="font-display text-2xl mt-1">{value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</div></div>;
}
