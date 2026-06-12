import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { RainbowStrip } from "@/components/site/RainbowStrip";
import logoAsset from "@/assets/pintarbh-logo.png.asset.json";

export const Route = createFileRoute("/auth")({
head: () => ({
meta: [{ title: "Acesso administrativo — PintarBH" }],
}),
component: AuthPage,
ssr: false,
});

function AuthPage() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const isAuth = localStorage.getItem("admin-auth");

    if (isAuth === "true") {
      navigate({ to: "/admin", replace: true });
    }
  }, [navigate]);

async function handleLogin(e: React.FormEvent) {
e.preventDefault();

setLoading(true);
try {
  if (
    user === "admin" &&
    password === "pintarbh26@"
  ) {
    localStorage.setItem("admin-auth", "true");
    toast.success("Bem-vindo!");
    navigate({
      to: "/admin",
      replace: true,
    });
    return;
  }
  toast.error("Usuário ou senha inválidos");
} finally {
  setLoading(false);
}

}

return (
  <div className="flex-1 grid place-items-center px-6 py-16">
    <div className="w-full max-w-md">
      <Link
        to="/"
        className="flex items-center gap-3 mb-8 justify-center"
      >
        <img
          src={logoAsset.url}
          alt=""
          className="h-12 w-12 rounded-full"
        />
        <span className="font-display text-xl">
          PintarBH
        </span>
      </Link>
      <div className="rounded-3xl bg-background ring-1 ring-border p-8 shadow-sm">
        <h1 className="font-display text-3xl mb-2 text-center">
          Acessar painel
        </h1>
        <p className="text-sm text-muted-foreground text-center mb-6">
          Entre com usuário e senha.
        </p>
        <form
          onSubmit={handleLogin}
          className="space-y-4"
        >
          <div>
            <label className="text-xs uppercase tracking-widest text-muted-foreground mb-1.5 block">
              Usuário
            </label>
            <input
              type="text"
              required
              value={user}
              onChange={(e) => setUser(e.target.value)}
              className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <div>
            <label className="text-xs uppercase tracking-widest text-muted-foreground mb-1.5 block">
              Senha
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <button
            disabled={loading}
            className="w-full rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-60"
          >
            {loading ? "Aguarde..." : "Entrar"}
          </button>
        </form>
      </div>
      <div className="mt-6 text-center">
        <Link
          to="/"
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          ← Voltar ao site
        </Link>
      </div>
    </div>
  </div>
</div>

);
}