import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { RainbowStrip } from "@/components/site/RainbowStrip";
import logoAsset from "@/assets/pintarbh-logo.png.asset.json";

export const Route = createFileRoute("/auth")({
  head: () => ({ meta: [{ title: "Acesso administrativo — PintarBH" }] }),
  component: AuthPage,
  ssr: false,
});

type Mode = "login" | "forgot" | "first-admin";

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [bootstrapping, setBootstrapping] = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        navigate({ to: "/admin", replace: true });
        return;
      }
      // Check if any admin exists; if not, show first-admin creation
      const { count } = await supabase
        .from("user_roles")
        .select("*", { count: "exact", head: true })
        .eq("role", "admin");
      if ((count ?? 0) === 0) setMode("first-admin");
      setBootstrapping(false);
    })();
  }, [navigate]);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      // Verify admin role
      const { data: isAdmin } = await supabase.rpc("has_role", {
        _user_id: data.user.id,
        _role: "admin",
      });
      if (!isAdmin) {
        await supabase.auth.signOut();
        toast.error("Esta conta não tem permissão administrativa.");
        return;
      }
      toast.success("Bem-vindo!");
      navigate({ to: "/admin", replace: true });
    } catch (err) {
      const msg = (err as Error).message;
      if (msg.toLowerCase().includes("invalid")) toast.error("E-mail ou senha inválidos.");
      else if (msg.toLowerCase().includes("confirm")) toast.error("E-mail ainda não confirmado.");
      else toast.error(msg);
    } finally {
      setLoading(false);
    }
  }

  async function handleForgot(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) throw error;
      toast.success("Verifique seu e-mail para redefinir a senha.");
      setMode("login");
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  async function handleFirstAdmin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: `${window.location.origin}/admin` },
      });
      if (error) throw error;
      if (!data.user) throw new Error("Falha ao criar usuário.");
      // Trigger handle_new_user grants admin to first user automatically.
      toast.success("Administrador criado! Fazendo login...");
      // If session exists (auto-confirm on), go straight in
      if (data.session) {
        navigate({ to: "/admin", replace: true });
      } else {
        const { error: loginErr } = await supabase.auth.signInWithPassword({ email, password });
        if (loginErr) throw loginErr;
        navigate({ to: "/admin", replace: true });
      }
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  if (bootstrapping) {
    return (
      <div className="min-h-screen grid place-items-center text-sm text-muted-foreground">
        Carregando...
      </div>
    );
  }

  const title =
    mode === "first-admin" ? "Criar primeiro administrador" :
    mode === "forgot" ? "Recuperar senha" : "Acessar painel";

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
            <h1 className="font-display text-3xl mb-2 text-center">{title}</h1>
            <p className="text-sm text-muted-foreground text-center mb-6">
              {mode === "first-admin"
                ? "Nenhum admin existe ainda. Crie a primeira conta."
                : mode === "forgot"
                ? "Digite seu e-mail para receber o link."
                : "Entre com e-mail e senha."}
            </p>
            <form
              onSubmit={
                mode === "first-admin" ? handleFirstAdmin :
                mode === "forgot" ? handleForgot : handleLogin
              }
              className="space-y-4"
            >
              <div>
                <label className="text-xs uppercase tracking-widest text-muted-foreground mb-1.5 block">E-mail</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              {mode !== "forgot" && (
                <div>
                  <label className="text-xs uppercase tracking-widest text-muted-foreground mb-1.5 block">Senha</label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
              )}
              <button
                disabled={loading}
                className="w-full rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-60"
              >
                {loading ? "Aguarde..." :
                  mode === "first-admin" ? "Criar admin e entrar" :
                  mode === "forgot" ? "Enviar link" : "Entrar"}
              </button>
            </form>
            {mode === "login" && (
              <div className="mt-4 text-center">
                <button
                  type="button"
                  onClick={() => setMode("forgot")}
                  className="text-sm text-muted-foreground hover:text-foreground"
                >
                  Esqueci minha senha
                </button>
              </div>
            )}
            {mode === "forgot" && (
              <div className="mt-4 text-center">
                <button
                  type="button"
                  onClick={() => setMode("login")}
                  className="text-sm text-muted-foreground hover:text-foreground"
                >
                  ← Voltar ao login
                </button>
              </div>
            )}
          </div>
          <div className="mt-6 text-center">
            <Link to="/" className="text-sm text-muted-foreground hover:text-foreground">
              ← Voltar ao site
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}