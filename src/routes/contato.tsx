import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { Phone, Mail, MapPin, Clock, MessageCircle, Send } from "lucide-react";
import { z } from "zod";
import { toast } from "sonner";
import { PublicLayout } from "@/components/site/PublicLayout";
import { settingsQuery } from "@/lib/queries";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/contato")({
  head: () => ({
    meta: [
      { title: "Contato — PintarBH" },
      { name: "description", content: "Solicite seu orçamento. Atendemos toda BH e região." },
      { property: "og:url", content: "/contato" },
    ],
    links: [{ rel: "canonical", href: "/contato" }],
  }),
  component: ContatoPage,
});

const schema = z.object({
  name: z.string().trim().min(2, "Informe seu nome").max(120),
  phone: z.string().trim().min(6).max(30),
  email: z.string().trim().email("E-mail inválido").max(200).optional().or(z.literal("")),
  city: z.string().trim().max(120).optional(),
  service_type: z.string().trim().max(80).optional(),
  message: z.string().trim().min(5, "Conte um pouco sobre o projeto").max(4000),
});

function ContatoPage() {
  const { data: s } = useQuery(settingsQuery);
  const [form, setForm] = useState({ name: "", phone: "", email: "", city: "", service_type: "", message: "" });
  const mutation = useMutation({
    mutationFn: async (payload: typeof form) => {
      const parsed = schema.parse(payload);
      const { error } = await supabase.from("contact_messages").insert({
        name: parsed.name,
        phone: parsed.phone,
        email: parsed.email || null,
        city: parsed.city || null,
        service_type: parsed.service_type || null,
        message: parsed.message,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Mensagem enviada! Em breve entraremos em contato.");
      setForm({ name: "", phone: "", email: "", city: "", service_type: "", message: "" });
    },
    onError: (err: unknown) => {
      const msg = err instanceof z.ZodError ? err.issues[0]?.message : (err as Error).message;
      toast.error(msg || "Erro ao enviar mensagem.");
    },
  });

  return (
    <PublicLayout>
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-6 lg:px-10 grid lg:grid-cols-2 gap-16">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground mb-3">Vamos conversar</p>
            <h1 className="font-display text-5xl lg:text-6xl mb-6">Conte sobre seu projeto</h1>
            <p className="text-lg text-muted-foreground leading-relaxed max-w-lg mb-10">
              Nosso time atende com calma e atenção. Você receberá um orçamento detalhado, sem pressão e sem compromisso.
            </p>

            <a
              href={`https://wa.me/${s?.whatsapp || "5531999999999"}?text=${encodeURIComponent("Olá! Gostaria de um orçamento.")}`}
              target="_blank" rel="noreferrer"
              className="flex items-center gap-4 rounded-3xl bg-[#25D366] text-white p-5 mb-6 hover:opacity-90 transition"
            >
              <MessageCircle className="h-7 w-7" />
              <div>
                <div className="text-xs uppercase tracking-widest opacity-90">WhatsApp — resposta rápida</div>
                <div className="font-display text-xl">{s?.phone}</div>
              </div>
            </a>

            <ul className="space-y-4 text-sm">
              {s?.phone && <li className="flex items-start gap-3"><Phone className="h-5 w-5 mt-0.5 text-muted-foreground" /><span>{s.phone}</span></li>}
              {s?.email && <li className="flex items-start gap-3"><Mail className="h-5 w-5 mt-0.5 text-muted-foreground" /><span>{s.email}</span></li>}
              {s?.address && <li className="flex items-start gap-3"><MapPin className="h-5 w-5 mt-0.5 text-muted-foreground" /><span>{s.address}</span></li>}
              {s?.business_hours && <li className="flex items-start gap-3"><Clock className="h-5 w-5 mt-0.5 text-muted-foreground" /><span>{s.business_hours}</span></li>}
            </ul>

            <div className="mt-8 aspect-[16/10] rounded-3xl overflow-hidden ring-1 ring-border">
              <iframe
                title="Mapa"
                src={`https://www.google.com/maps?q=${encodeURIComponent(s?.address || "Belo Horizonte, MG")}&output=embed`}
                className="h-full w-full"
                loading="lazy"
              />
            </div>
          </div>

          <form
            onSubmit={(e) => { e.preventDefault(); mutation.mutate(form); }}
            className="rounded-3xl bg-background ring-1 ring-border p-8 lg:p-10 h-fit"
          >
            <div className="rainbow-strip w-12 mb-6" />
            <h2 className="font-display text-3xl mb-6">Envie sua mensagem</h2>
            <div className="grid gap-4">
              <Field label="Nome" value={form.name} onChange={(v) => setForm({ ...form, name: v })} required />
              <div className="grid sm:grid-cols-2 gap-4">
                <Field label="Telefone" value={form.phone} onChange={(v) => setForm({ ...form, phone: v })} required />
                <Field label="E-mail" type="email" value={form.email} onChange={(v) => setForm({ ...form, email: v })} />
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <Field label="Cidade" value={form.city} onChange={(v) => setForm({ ...form, city: v })} />
                <div>
                  <label className="text-xs uppercase tracking-widest text-muted-foreground mb-1.5 block">Tipo de serviço</label>
                  <select
                    value={form.service_type}
                    onChange={(e) => setForm({ ...form, service_type: e.target.value })}
                    className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    <option value="">Selecione...</option>
                    <option>Pintura Residencial</option>
                    <option>Pintura Comercial</option>
                    <option>Pintura Industrial</option>
                    <option>Textura / Grafiato</option>
                    <option>Pintura Epóxi</option>
                    <option>Outros</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="text-xs uppercase tracking-widest text-muted-foreground mb-1.5 block">Mensagem</label>
                <textarea
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  rows={5}
                  required
                  className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                />
              </div>
              <button
                type="submit"
                disabled={mutation.isPending}
                className="mt-2 inline-flex items-center justify-center gap-2 rounded-full bg-primary px-6 py-3.5 text-sm font-medium text-primary-foreground hover:opacity-90 transition disabled:opacity-60"
              >
                <Send className="h-4 w-4" />
                {mutation.isPending ? "Enviando..." : "Enviar mensagem"}
              </button>
            </div>
          </form>
        </div>
      </section>
    </PublicLayout>
  );
}

function Field({ label, value, onChange, type = "text", required }: { label: string; value: string; onChange: (v: string) => void; type?: string; required?: boolean }) {
  return (
    <div>
      <label className="text-xs uppercase tracking-widest text-muted-foreground mb-1.5 block">
        {label}{required && " *"}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
      />
    </div>
  );
}
