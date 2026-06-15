import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { LayoutDashboard, Settings, Wrench, Image as ImageIcon, MessageSquare, Star, LogOut, Menu, X, Users } from "lucide-react";
import { useState } from "react";
import { RainbowStrip } from "@/components/site/RainbowStrip";
import logoAsset from "@/assets/pintarbh-logo.png.asset.json";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type NavItem = { to: string; label: string; icon: typeof LayoutDashboard; exact?: boolean };
const nav: NavItem[] = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { to: "/admin/servicos", label: "Serviços", icon: Wrench },
  { to: "/admin/projetos", label: "Projetos", icon: ImageIcon },
  { to: "/admin/depoimentos", label: "Depoimentos", icon: Star },
  { to: "/admin/contatos", label: "Contatos", icon: MessageSquare },
  { to: "/admin/usuarios", label: "Usuários", icon: Users },
  { to: "/admin/configuracoes", label: "Configurações", icon: Settings },
];

export function AdminLayout({ children, title }: { children: ReactNode; title: string }) {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [menuOpen, setMenuOpen] = useState(false);

  async function handleLogout() {
    await qc.cancelQueries();
    qc.clear();
    await supabase.auth.signOut();
    toast.success("Sessão encerrada.");
    navigate({ to: "/auth", replace: true });
  }

  const NavLinks = ({ onNav }: { onNav?: () => void }) => (
    <>
      {nav.map((n) => {
        const active = n.exact ? pathname === n.to : pathname.startsWith(n.to);
        return (
          <Link
            key={n.to}
            to={n.to as "/admin"}
            onClick={onNav}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm mb-1 transition ${active ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}
          >
            <n.icon className="h-4 w-4" />
            {n.label}
          </Link>
        );
      })}
    </>
  );

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
        <nav className="flex-1 p-3 overflow-y-auto"><NavLinks /></nav>
        <div className="p-3 border-t border-border">
          <button onClick={handleLogout} className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm hover:bg-muted">
            <LogOut className="h-4 w-4" /> Sair
          </button>
        </div>
      </aside>
      <main className="flex-1 min-w-0">
        <header className="bg-background border-b border-border px-6 lg:px-10 py-5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <button onClick={() => setMenuOpen(true)} className="lg:hidden" aria-label="Abrir menu">
              <Menu className="h-6 w-6" />
            </button>
            <h1 className="font-display text-xl sm:text-2xl truncate">{title}</h1>
          </div>
          <Link to="/" className="text-sm text-muted-foreground hover:text-foreground whitespace-nowrap">
            Ver site →
          </Link>
        </header>

        {menuOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div className="absolute inset-0 bg-black/50" onClick={() => setMenuOpen(false)} />
            <div className="absolute left-0 top-0 h-full w-72 max-w-[85vw] bg-background border-r border-border flex flex-col">
              <div className="flex items-center justify-between p-4 border-b border-border">
                <span className="font-display text-lg">Administração</span>
                <button onClick={() => setMenuOpen(false)} aria-label="Fechar menu">
                  <X className="h-5 w-5" />
                </button>
              </div>
              <nav className="flex-1 p-3 overflow-y-auto">
                <NavLinks onNav={() => setMenuOpen(false)} />
              </nav>
              <div className="p-3 border-t border-border">
                <button onClick={handleLogout} className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm hover:bg-muted">
                  <LogOut className="h-4 w-4" /> Sair
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="p-4 sm:p-6 lg:p-10">{children}</div>
      </main>
    </div>
  );
}