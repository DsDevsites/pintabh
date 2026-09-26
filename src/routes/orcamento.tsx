import { createFileRoute } from "@tanstack/react-router";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { ArrowRight, Check } from "lucide-react";
import { toast } from "sonner";
import { PublicLayout } from "@/components/site/PublicLayout";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/orcamento")({
  head: () => ({
    meta: [
      { title: "Solicitar orçamento — PintarBH" },
      { name: "description", content: "Envie os dados do seu projeto para a PintarBH preparar seu orçamento." },
    ],
  }),
  component: OrcamentoPage,
});

function OrcamentoPage() {
  const [form, setForm] = useState({
    client_name: "",
    phone: "",
    email: "",
    address: "",
    project_title: "",
    service_description: "",
  });

  const mutation = useMutation({
    mutationFn: async () => {
      if (form.client_name.trim().length < 2) throw new Error("Informe seu nome.");
      if (form.phone.trim().length < 6) throw new Error("Informe seu telefone.");
      if (form.service_description.trim().length < 5) throw new Error("Conte um pouco sobre o serviço.");

      const { error } = await supabase.from("quotes").insert({
        ...form,
        client_name: form.client_name.trim(),
        phone: form.phone.trim(),
        email: form.email.trim() || null,
        address: form.address.trim() || null,
        project_title: form.project_title.trim() || "Novo orçamento",
        service_description: form.service_description.trim(),
        status: "pre_orcamento",
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Pré-orçamento enviado! A PintarBH recebeu seus dados.");
      setForm({ client_name: "", phone: "", email: "", address: "", project_title: "", service_description: "" });
    },
    onError: (error: Error) => toast.error(error.message),
  });

  return (
    <PublicLayout>
      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-6xl px-6 lg:px-10 grid lg:grid-cols-[.8fr_1.2fr] gap-12 items-start">
          <div>
            <div className="rainbow-strip w-16 mb-6" />
            <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground mb-3">PintarBH</p>
            <h1 className="font-display text-5xl lg:text-6xl leading-tight">Vamos preparar seu orçamento.</h1>
            <p className="mt-6 text-lg text-muted-foreground leading-relaxed">
              Envie os dados básicos do ambiente. Depois, nossa equipe pode complementar serviços, materiais, quantidades e valores no orçamento final.
            </p>
            <div className="mt-8 space-y-3 text-sm">
              {["Dados do cliente e do local", "Descrição do que será pintado", "Detalhamento de serviços e materiais", "Orçamento final organizado em 2 páginas"].map((item) => (
                <div key={item} className="flex items-center gap-3">
                  <span className="grid place-items-center h-6 w-6 rounded-full bg-secondary"><Check className="h-4 w-4" /></span>
                  {item}
                </div>
              ))}
            </div>
          </div>

          <form
            onSubmit={(event) => { event.preventDefault(); mutation.mutate(); }}
            className="rounded-3xl bg-background ring-1 ring-border p-7 sm:p-10 shadow-sm"
          >
            <h2 className="font-display text-3xl mb-7">Pré-orçamento</h2>
            <div className="grid gap-5">
              <Field label="Nome" value={form.client_name} required onChange={(value) => setForm({ ...form, client_name: value })} />
              <div className="grid sm:grid-cols-2 gap-4">
                <Field label="Telefone / WhatsApp" value={form.phone} required onChange={(value) => setForm({ ...form, phone: value })} />
                <Field label="E-mail" type="email" value={form.email} onChange={(value) => setForm({ ...form, email: value })} />
              </div>
              <Field label="Endereço do serviço" value={form.address} onChange={(value) => setForm({ ...form, address: value })} />
              <Field label="Nome do projeto" placeholder="Ex.: Pintura completa do apartamento" value={form.project_title} onChange={(value) => setForm({ ...form, project_title: value })} />
              <div>
                <label className="text-xs uppercase tracking-widest text-muted-foreground mb-1.5 block">O que você precisa pintar? *</label>
                <textarea
                  rows={6}
                  value={form.service_description}
                  onChange={(event) => setForm({ ...form, service_description: event.target.value })}
                  placeholder="Ex.: sala, quartos, teto, portas, fachada, paredes com massa, textura..."
                  required
                  className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                />
              </div>
              <button
                type="submit"
                disabled={mutation.isPending}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-6 py-3.5 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-60"
              >
                {mutation.isPending ? "Enviando..." : "Enviar pré-orçamento"}
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </form>
        </div>
      </section>
    </PublicLayout>
  );
}

function Field({ label, value, onChange, type = "text", required, placeholder }: { label: string; value: string; onChange: (value: string) => void; type?: string; required?: boolean; placeholder?: string }) {
  return (
    <div>
      <label className="text-xs uppercase tracking-widest text-muted-foreground mb-1.5 block">{label}{required ? " *" : ""}</label>
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        required={required}
        className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
      />
    </div>
  );
}
