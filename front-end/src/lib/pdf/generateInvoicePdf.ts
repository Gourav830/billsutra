import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import type { InvoicePdfInput } from "@/types/invoice";

const formatCurrency = (value: number) => `₹${value.toFixed(2)}`;

const hexToRgb = (value?: string): [number, number, number] | null => {
  if (!value) return null;
  const cleaned = value.replace("#", "");
  if (cleaned.length !== 6) return null;
  const num = Number.parseInt(cleaned, 16);
  if (Number.isNaN(num)) return null;
  return [(num >> 16) & 255, (num >> 8) & 255, num & 255];
};

export const generateInvoicePdf = ({
  businessName,
  invoiceNumber,
  invoiceDate,
  customer,
  items,
  totals,
  taxMode,
  themeColor,
  fileName = "invoice.pdf",
}: InvoicePdfInput) => {
  const pdf = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const marginX = 12;
  const marginY = 12;
  const contentWidth = pageWidth - marginX * 2;
  const bottomSafeY = pageHeight - marginY - 8;

  const startX = marginX;
  let cursorY = marginY + 6;
  const accent = hexToRgb(themeColor) ?? [138, 109, 86];
  const text: [number, number, number] = [31, 27, 22];
  const soft: [number, number, number] = [249, 242, 234];
  const softAlt: [number, number, number] = [255, 250, 245];

  const drawPageFrame = () => {
    pdf.setDrawColor(224, 217, 209);
    pdf.setLineWidth(0.2);
    pdf.rect(marginX, marginY, contentWidth, pageHeight - marginY * 2);
  };

  const ensureSpace = (neededHeight: number) => {
    if (cursorY + neededHeight <= bottomSafeY) return;
    pdf.addPage();
    drawPageFrame();
    cursorY = marginY + 6;
  };

  drawPageFrame();

  pdf.setFontSize(16);
  pdf.setTextColor(...text);
  pdf.text(businessName, startX, cursorY);
  pdf.setFontSize(10);
  pdf.setTextColor(...accent);
  pdf.text(`Invoice No: ${invoiceNumber}`, startX, cursorY + 8);
  pdf.text(`Invoice Date: ${invoiceDate}`, startX, cursorY + 15);

  cursorY += 26;
  pdf.setFontSize(11);
  pdf.setTextColor(...accent);
  pdf.text("Bill To", startX, cursorY);
  pdf.setFontSize(10);
  pdf.setTextColor(...text);
  pdf.text(customer?.name ?? "Customer", startX, cursorY + 6);
  if (customer?.email) pdf.text(customer.email, startX, cursorY + 12);
  if (customer?.phone) pdf.text(customer.phone, startX, cursorY + 18);
  if (customer?.address) pdf.text(customer.address, startX, cursorY + 24);

  const tableStart = cursorY + 30;
  autoTable(pdf, {
    startY: tableStart,
    margin: { left: marginX, right: marginX },
    head: [["Item", "Qty", "Price", "GST %", "Line Total"]],
    body: items.map((item) => [
      item.name,
      String(item.quantity),
      formatCurrency(item.price),
      String(item.tax_rate ?? 0),
      formatCurrency(item.total),
    ]),
    styles: { fontSize: 9, textColor: text, cellPadding: 3 },
    headStyles: { fillColor: soft, textColor: accent, fontStyle: "bold" },
    alternateRowStyles: { fillColor: softAlt },
    showHead: "everyPage",
    pageBreak: "auto",
    rowPageBreak: "avoid",
    tableLineColor: [231, 220, 208],
    columnStyles: {
      1: { halign: "right" },
      2: { halign: "right" },
      3: { halign: "right" },
      4: { halign: "right" },
    },
  });

  const afterTable = pdf.lastAutoTable?.finalY;
  cursorY = (afterTable ?? tableStart) + 8;
  ensureSpace(44);
  const totalsY = cursorY;
  const labelX = pageWidth - marginX - 60;
  const valueX = pageWidth - marginX;

  pdf.setFontSize(10);
  pdf.setTextColor(...accent);
  pdf.text("Subtotal", labelX, totalsY, { align: "left" });
  pdf.setTextColor(...text);
  pdf.text(formatCurrency(totals.subtotal), valueX, totalsY, {
    align: "right",
  });

  let offset = 6;
  if (taxMode !== "NONE") {
    pdf.setTextColor(...accent);
    pdf.text("GST", labelX, totalsY + offset, { align: "left" });
    pdf.setTextColor(...text);
    pdf.text(formatCurrency(totals.tax), valueX, totalsY + offset, {
      align: "right",
    });
    offset += 6;
  }

  if (totals.discount) {
    pdf.setTextColor(...accent);
    pdf.text("Discount", labelX, totalsY + offset, { align: "left" });
    pdf.setTextColor(...text);
    pdf.text(`-${formatCurrency(totals.discount)}`, valueX, totalsY + offset, {
      align: "right",
    });
    offset += 6;
  }

  const totalY = totalsY + offset + 2;
  pdf.setDrawColor(231, 220, 208);
  pdf.setFillColor(...softAlt);
  pdf.roundedRect(labelX - 6, totalY - 5, 66, 10, 2, 2, "F");
  pdf.setFontSize(11);
  pdf.setTextColor(...text);
  pdf.text("Total", labelX, totalY, { align: "left" });
  pdf.text(formatCurrency(totals.total), valueX, totalY, {
    align: "right",
  });

  const pageCount = pdf.getNumberOfPages();
  for (let page = 1; page <= pageCount; page += 1) {
    pdf.setPage(page);
    drawPageFrame();
    pdf.setFontSize(9);
    pdf.setTextColor(120, 105, 90);
    pdf.text(
      `Page ${page} / ${pageCount}`,
      pageWidth - marginX,
      pageHeight - 6,
      {
        align: "right",
      },
    );
  }

  pdf.save(fileName);
};
