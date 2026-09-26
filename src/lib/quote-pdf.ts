export type QuoteItem = {
  description: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  total: number;
};

export type QuotePdfData = {
  clientName: string;
  phone?: string;
  email?: string;
  address?: string;
  projectTitle?: string;
  serviceDescription?: string;
  services: QuoteItem[];
  materials: QuoteItem[];
  laborTotal: number;
  materialTotal: number;
  total: number;
  paymentTerms?: string;
  notes?: string;
  createdAt?: string;
  logoUrl?: string;
};

const money = (value: number) =>
  value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

const esc = (value: string) =>
  value.replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  })[char] ?? char);

const rows = (items: QuoteItem[]) =>
  items.length
    ? items.map((item) => `
      <tr>
        <td>${esc(item.description)}</td>
        <td>${item.quantity}</td>
        <td>${esc(item.unit || "un.")}</td>
      </tr>`).join("")
    : `<tr><td colspan="3" class="empty">Nenhum item informado.</td></tr>`;

const valueRows = (items: QuoteItem[]) =>
  items.length
    ? items.map((item) => `
      <tr>
        <td>${esc(item.description)}</td>
        <td>${item.quantity} ${esc(item.unit || "un.")}</td>
        <td>${money(item.unitPrice)}</td>
        <td class="right">${money(item.total)}</td>
      </tr>`).join("")
    : `<tr><td colspan="4" class="empty">Nenhum item informado.</td></tr>`;

export function openQuotePrint(data: QuotePdfData) {
  const printWindow = window.open("", "_blank", "width=900,height=1200");
  if (!printWindow) {
    throw new Error("Não foi possível abrir a janela do orçamento. Verifique o bloqueador de pop-ups.");
  }

  const services = data.services.filter((item) => item.description.trim());
  const materials = data.materials.filter((item) => item.description.trim());
  const date = data.createdAt
    ? new Date(data.createdAt).toLocaleDateString("pt-BR")
    : new Date().toLocaleDateString("pt-BR");

  printWindow.document.write(`<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<title>Orçamento — PintarBH</title>
<style>
  @page { size: A4; margin: 12mm; }
  * { box-sizing: border-box; }
  body { margin: 0; font-family: Arial, Helvetica, sans-serif; color: #27313a; background: white; }
  .page { width: 100%; min-height: 273mm; position: relative; padding: 4mm 3mm 12mm; }
  .page + .page { page-break-before: always; }
  .header { display: flex; align-items: center; justify-content: space-between; gap: 20px; margin-bottom: 16px; }
  .brand { display: flex; align-items: center; gap: 12px; }
  .brand img { width: 64px; height: 64px; object-fit: contain; }
  .brand-name { font-size: 26px; font-weight: 800; color: #f68b63; }
  .client { text-align: right; font-size: 11px; line-height: 1.55; color: #56616b; }
  .bar { background: #f68b63; color: white; border-radius: 999px; padding: 9px 18px; text-align: center; font-weight: 800; font-size: 18px; letter-spacing: .04em; margin: 12px 0; }
  .soft { background: #fdbed6; color: #3b2f38; }
  h1 { font-size: 28px; margin: 10px 0 4px; }
  h2 { font-size: 15px; margin: 16px 0 8px; color: #4d5963; text-transform: uppercase; letter-spacing: .08em; }
  p { margin: 5px 0; line-height: 1.5; }
  .info { display: grid; grid-template-columns: 1fr 1fr; gap: 8px 18px; font-size: 12px; margin-bottom: 10px; }
  .info div { border-bottom: 1px solid #ca9fdb; padding-bottom: 5px; }
  table { width: 100%; border-collapse: collapse; font-size: 11px; margin-bottom: 12px; }
  th { text-align: left; background: #ca9fdb; color: #2e2631; padding: 7px; }
  td { padding: 7px; border-bottom: 1px solid #eadff0; vertical-align: top; }
  .right { text-align: right; }
  .empty { text-align: center; color: #7a7a7a; padding: 14px; }
  .note { background: #82d1eb; color: #17323c; padding: 10px 12px; border-radius: 12px; font-size: 11px; margin-top: 10px; }
  .total-card { border: 2px solid #f68b63; border-radius: 18px; padding: 18px; margin-top: 14px; }
  .total-line { display: flex; justify-content: space-between; gap: 12px; padding: 8px 0; border-bottom: 1px solid #f2d2c7; font-size: 14px; }
  .total-line:last-child { border-bottom: 0; font-size: 22px; font-weight: 800; color: #f68b63; }
  .payment { background: #f68b63; color: white; border-radius: 16px; padding: 14px; margin-top: 16px; }
  .footer { position: absolute; bottom: 3mm; left: 3mm; right: 3mm; display: flex; justify-content: space-between; color: #68737c; font-size: 9px; border-top: 1px solid #ca9fdb; padding-top: 6px; }
  .small { font-size: 10px; color: #68737c; }
  @media print {
    body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  }
</style>
</head>
<body>
<section class="page">
  <div class="header">
    <div class="brand">
      ${data.logoUrl ? `<img src="${esc(data.logoUrl)}" alt="PintarBH">` : ""}
      <div class="brand-name">PintarBH</div>
    </div>
    <div class="client">
      <strong>ORÇAMENTO</strong><br>
      Data: ${date}
    </div>
  </div>

  <div class="bar">PINTURA E ACABAMENTOS</div>
  <h1>${esc(data.projectTitle || "Orçamento de pintura")}</h1>
  <div class="info">
    <div><strong>Cliente:</strong> ${esc(data.clientName || "—")}</div>
    <div><strong>Telefone:</strong> ${esc(data.phone || "—")}</div>
    <div><strong>E-mail:</strong> ${esc(data.email || "—")}</div>
    <div><strong>Local:</strong> ${esc(data.address || "—")}</div>
  </div>

  <h2>Descrição do serviço</h2>
  <p>${esc(data.serviceDescription || "Serviço de pintura e acabamento conforme levantamento realizado.")}</p>

  <div class="bar soft">SERVIÇOS / EXECUÇÃO</div>
  <table>
    <thead><tr><th>Serviço</th><th>Qtd.</th><th>Un.</th></tr></thead>
    <tbody>${rows(services)}</tbody>
  </table>

  <div class="bar soft">LISTA DE MATERIAL</div>
  <table>
    <thead><tr><th>Material</th><th>Qtd.</th><th>Un.</th></tr></thead>
    <tbody>${rows(materials)}</tbody>
  </table>

  ${data.notes ? `<div class="note"><strong>Observações:</strong> ${esc(data.notes)}</div>` : ""}

  <div class="footer"><span>PintarBH — Pintura profissional</span><span>Página 1/2</span></div>
</section>

<section class="page">
  <div class="header">
    <div class="brand"><div class="brand-name">PintarBH</div></div>
    <div class="client"><strong>ORÇAMENTO</strong><br>${esc(data.clientName || "Cliente")}</div>
  </div>

  <div class="bar">VALORES DO ORÇAMENTO</div>

  <h2>Serviços</h2>
  <table>
    <thead><tr><th>Item</th><th>Qtd.</th><th>Valor unit.</th><th class="right">Total</th></tr></thead>
    <tbody>${valueRows(services)}</tbody>
  </table>

  <h2>Materiais</h2>
  <table>
    <thead><tr><th>Item</th><th>Qtd.</th><th>Valor unit.</th><th class="right">Total</th></tr></thead>
    <tbody>${valueRows(materials)}</tbody>
  </table>

  <div class="total-card">
    <div class="total-line"><span>Mão de obra</span><strong>${money(data.laborTotal)}</strong></div>
    <div class="total-line"><span>Materiais</span><strong>${money(data.materialTotal)}</strong></div>
    <div class="total-line"><span>VALOR TOTAL</span><strong>${money(data.total)}</strong></div>
  </div>

  ${data.paymentTerms ? `<div class="payment"><strong>PAGAMENTO</strong><p>${esc(data.paymentTerms)}</p></div>` : ""}

  <div style="margin-top:18px">
    <h2>Considerações</h2>
    <p class="small">Liberar o espaço para execução da pintura, disponibilizar água potável e banheiro funcional para a equipe e deixar o ambiente livre de entulho ou mudança. Materiais de limpeza necessários para a execução devem estar disponíveis quando combinados.</p>
  </div>

  <div class="footer"><span>PintarBH — Pintura profissional</span><span>Página 2/2</span></div>
</section>
</body>
</html>`);

  printWindow.document.close();
  printWindow.focus();
  window.setTimeout(() => printWindow.print(), 350);
}
