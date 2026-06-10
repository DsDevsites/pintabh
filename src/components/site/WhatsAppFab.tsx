import { useQuery } from "@tanstack/react-query";
import { MessageCircle } from "lucide-react";
import { settingsQuery } from "@/lib/queries";

export function WhatsAppFab() {
  const { data: s } = useQuery(settingsQuery);
  const wpp = s?.whatsapp || "5531999999999";
  return (
    <a
      href={`https://wa.me/${wpp}?text=${encodeURIComponent("Olá, gostaria de um orçamento.")}`}
      target="_blank"
      rel="noreferrer"
      className="fixed bottom-6 right-6 z-40 rounded-full bg-[#25D366] text-white p-4 shadow-lg hover:scale-105 transition"
      aria-label="WhatsApp"
    >
      <MessageCircle className="h-6 w-6" />
    </a>
  );
}
