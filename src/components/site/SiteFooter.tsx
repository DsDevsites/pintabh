import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Instagram, Facebook, Mail, Phone, MapPin, Clock } from "lucide-react";
import { settingsQuery } from "@/lib/queries";
import { RainbowStrip } from "./RainbowStrip";
import logoAsset from "@/assets/pintarbh-logo.png.asset.json";

export function SiteFooter() {
  const { data: s } = useQuery(settingsQuery);
  const logo = s?.logo_url || logoAsset.url;
  const wpp = s?.whatsapp || "5531999999999";
  return (
    <footer className="mt-24 border-t border-border bg-background">
      <RainbowStrip />
      <div className="mx-auto max-w-7xl px-6 lg:px-10 py-16 grid gap-12 md:grid-cols-4">
        <div className="md:col-span-1">
          <div className="flex items-center gap-3 mb-4">
            <img src={logo} alt="" className="h-10 w-10 rounded-full ring-1 ring-border" />
            <span className="font-display text-lg">{s?.company_name || "PintarBH"}</span>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">{s?.slogan}</p>
        </div>
        <div>
          <h4 className="text-sm font-medium mb-4">Navegação</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><Link to="/" className="hover:text-foreground">Início</Link></li>
            <li><Link to="/sobre" className="hover:text-foreground">Sobre</Link></li>
            <li><Link to="/servicos" className="hover:text-foreground">Serviços</Link></li>
            <li><Link to="/portfolio" className="hover:text-foreground">Portfólio</Link></li>
            <li><Link to="/depoimentos" className="hover:text-foreground">Depoimentos</Link></li>
            <li><Link to="/contato" className="hover:text-foreground">Contato</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-sm font-medium mb-4">Contato</h4>
          <ul className="space-y-3 text-sm text-muted-foreground">
            {s?.phone && <li className="flex items-start gap-2"><Phone className="h-4 w-4 mt-0.5" />{s.phone}</li>}
            {s?.email && <li className="flex items-start gap-2"><Mail className="h-4 w-4 mt-0.5" />{s.email}</li>}
            {s?.address && <li className="flex items-start gap-2"><MapPin className="h-4 w-4 mt-0.5" />{s.address}</li>}
            {s?.business_hours && <li className="flex items-start gap-2"><Clock className="h-4 w-4 mt-0.5" />{s.business_hours}</li>}
          </ul>
        </div>
        <div>
          <h4 className="text-sm font-medium mb-4">Redes</h4>
          <div className="flex gap-3">
            {s?.instagram_url && (
              <a href={s.instagram_url} target="_blank" rel="noreferrer" className="p-2 rounded-full border border-border hover:bg-muted">
                <Instagram className="h-4 w-4" />
              </a>
            )}
            {s?.facebook_url && (
              <a href={s.facebook_url} target="_blank" rel="noreferrer" className="p-2 rounded-full border border-border hover:bg-muted">
                <Facebook className="h-4 w-4" />
              </a>
            )}
            <a href={`https://wa.me/${wpp}`} target="_blank" rel="noreferrer" className="p-2 rounded-full border border-border hover:bg-muted">
              <Phone className="h-4 w-4" />
            </a>
          </div>
        </div>
      </div>
      <div className="border-t border-border">
        <div className="mx-auto max-w-7xl px-6 lg:px-10 py-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted-foreground">
          <span>© {new Date().getFullYear()} {s?.company_name || "PintarBH"}. Todos os direitos reservados.</span>
          <Link to="/auth" className="hover:text-foreground">Área administrativa</Link>
        </div>
      </div>
    </footer>
  );
}
