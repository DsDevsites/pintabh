import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";
import { RainbowStrip } from "@/components/site/RainbowStrip";
import logoAsset from "@/assets/pintarbh-logo.png.asset.json";
import { getBootstrapStatus, createFirstAdmin } from "@/lib/users.functions";

export const Route = createFileRoute("/auth")({
  head: () => ({ meta: [{ title: "Acesso administrativo — PintarBH" }] }),
  component: AuthPage,
  ssr: false,
});

type Mode = "login" | "reset" | "bootstrap";

function AuthPage() {
  const navigate = useNavigate();
  const bootstrapFn = useServerFn(getBootstrapStatus);
  const createFirstFn = useServerFn(createFirstAdmin);
  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [hasUsers, setHasUsers] = useState<boolean | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/admin", replace: true });
    });
    bootstrapFn()
      .then((s) => setHasUsers(s.hasUsers))
      .catch(() => setHasUsers(true));
  }, [navigate, bootstrapFn]);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      toast.success("Bem-vindo!");
      navigate({ to: "/admin", replace: true });
    } catch (err) {
      const msg = (err as Error).message;
      if (msg.toLowerCase().includes("invalid")) {
        toast.error("E-mail ou senha incorretos.");
      } else if (msg.toLowerCase().includes("not confirmed")) {
        toast.error("E-mail não confirmado. Contate o administrador.");
      } else {
        toast.error(msg);
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleReset(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) throw error;
      toast.success("Enviamos um link de recuperação para seu e-mail.");
      setMode("login");
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  async function handleBootstrap(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await createFirstFn({ data: { email, password } });
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      toast.success("Administrador criado com sucesso!");
      navigate({ to: "/admin", replace: true });
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  const showBootstrap = mode === "bootstrap" || (hasUsers === false && mode === "login");

  return (
    <div className="min-h-screen flex flex-col">
      <RainbowStrip />
      <div className="flex-1 grid place-items-center px-6 py-16">
        <div className="w-full max-w-md">
          <Link to="/" className="flex items-center gap-3 mb-8 justify-center">
            <img src={logoAsset.url} alt="" className="h-12 w-12 rounded-full" />
            <span className="font-display text-xl">PintarBH</span>
          </Link>
          <div className="rounded-3xl bg-background ring-1 ring-border p-8 shadow-sm">
            {showBootstrap ? (
              <>
                <h1 className="font-display text-3xl mb-2 text-center">Criar primeiro administrador</h1>
                <p className="text-sm text-muted-foreground text-center mb-6">
                  Nenhuma conta existe ainda. Crie o administrador inicial.
                </p>
                <form onSubmit={handleBootstrap} className="space-y-4">
                  <Field label="E-mail" type="email" value={email} onChange={setEmail} />
                  <Field label="Senha" type="password" value={password} onChange={setPassword} minLength={6} />
                  <SubmitButton loading={loading} label="Criar administrador" />
                </form>
              </>
            ) : mode === "reset" ? (
              <>
                <h1 className="font-display text-3xl mb-2 text-center">Recuperar senha</h1>
                <p className="text-sm text-muted-foreground text-center mb-6">
                  Enviaremos um link de redefinição para o seu e-mail.
                </p>
                <form onSubmit={handleReset} className="space-y-4">
                  <Field label="E-mail" type="email" value={email} onChange={setEmail} />
                  <SubmitButton loading={loading} label="Enviar link" />
                </form>
                <button onClick={() => setMode("login")} className="mt-4 w-full text-sm text-muted-foreground hover:text-foreground">
                  ← Voltar ao login
                </button>
              </>
            ) : (
              <>
                <h1 className="font-display text-3xl mb-2 text-center">Acessar painel</h1>
                <p className="text-sm text-muted-foreground text-center mb-6">Entre com seu e-mail e senha.</p>
                <form onSubmit={handleLogin} className="space-y-4">
                  <Field label="E-mail" type="email" value={email} onChange={setEmail} />
                  <Field label="Senha" type="password" value={password} onChange={setPassword} minLength={6} />
                  <SubmitButton loading={loading} label="Entrar" />
                </form>
                <button onClick={() => setMode("reset")} className="mt-4 w-full text-sm text-muted-foreground hover:text-foreground">
                  Esqueci minha senha
                </button>
              </>
            )}
          </div>
          <div className="mt-6 text-center">
            <Link to="/" className="text-sm text-muted-foreground hover:text-foreground">← Voltar ao site</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({ label, type, value, onChange, minLength }: { label: string; type: string; value: string; onChange: (v: string) => void; minLength?: number }) {
  return (
    <div>
      <label className="text-xs uppercase tracking-widest text-muted-foreground mb-1.5 block">{label}</label>
      <input
        type={type}
        required
        minLength={minLength}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
      />
    </div>
  );
}

function SubmitButton({ loading, label }: { loading: boolean; label: string }) {
  return (
    <button
      disabled={loading}
      className="w-full rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-60"
    >
      {loading ? "Aguarde..." : label}
    </button>
  );
}
