import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { LayoutDashboard, Settings, Wrench, Image as ImageIcon, MessageSquare, Star, LogOut } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { RainbowStrip } from "@/components/site/RainbowStrip";
import logoAsset from "@/assets/pintarbh-logo.png.asset.json";
import { useQueryClient } from "@tanstack/react-query";

const nav = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { to: "/admin/servicos", label: "Serviços", icon: Wrench },
  { to: "/admin/projetos", label: "Projetos", icon: ImageIcon },
  { to: "/admin/depoimentos", label: "Depoimentos", icon: Star },
  { to: "/admin/contatos", label: "Contatos", icon: MessageSquare },
  { to: "/admin/configuracoes", label: "Configurações", icon: Settings },
] as const;

export function AdminLayout({ children, title }: { children: ReactNode; title: string }) {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  async function handleLogout() {
    await qc.cancelQueries();
    qc.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  return (
    <div className="min-h-screen flex bg-muted/30">
      <aside className="hidden lg:flex w-64 flex-col bg-background border-r border-border">
        <RainbowStrip />
        <div className="p-6 border-b border-border">
          <Link to="/" className="flex items-center gap-3">
            <img src={logoAsset.url} className="h-9 w-9 rounded-full" alt="" />
            <span className="font-display text-lg">PintarBH</span>
          </Link>
          <div className="text-xs text-muted-foreground mt-1">Painel administrativo</div>
        </div>
        <nav className="flex-1 p-3">
          {nav.map((n) => {
            const active = n.exact ? pathname === n.to : pathname.startsWith(n.to);
            return (
              <Link
                key={n.to}
                to={n.to}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm mb-1 transition ${active ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}
              >
                <n.icon className="h-4 w-4" />
                {n.label}
              </Link>
            );
          })}
        </nav>
        <div className="p-3 border-t border-border">
          <button onClick={handleLogout} className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm hover:bg-muted">
            <LogOut className="h-4 w-4" /> Sair
          </button>
        </div>
      </aside>
      <main className="flex-1 min-w-0">
        <header className="bg-background border-b border-border px-6 lg:px-10 py-5 flex items-center justify-between">
          <h1 className="font-display text-2xl">{title}</h1>
          <Link to="/" className="text-sm text-muted-foreground hover:text-foreground">Ver site →</Link>
        </header>
        <div className="p-6 lg:p-10">{children}</div>
      </main>
    </div>
  );
}
