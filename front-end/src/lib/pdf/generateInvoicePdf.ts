import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import type { InvoicePdfInput } from "@/types/invoice";

const formatCurrency = (value: number) => `₹${value.toFixed(2)}`;

export const generateInvoicePdf = ({
  businessName,
  invoiceNumber,
  invoiceDate,
  customer,
  items,
  totals,
  taxMode,
  fileName = "invoice.pdf",
}: InvoicePdfInput) => {
  const pdf = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const startX = 14;
  let cursorY = 18;
  const accent: [number, number, number] = [138, 109, 86];
  const text: [number, number, number] = [31, 27, 22];
  const soft: [number, number, number] = [249, 242, 234];
  const softAlt: [number, number, number] = [255, 250, 245];

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
    tableLineColor: [231, 220, 208],
    columnStyles: {
      1: { halign: "right" },
      2: { halign: "right" },
      3: { halign: "right" },
      4: { halign: "right" },
    },
  });

  const afterTable = pdf.lastAutoTable?.finalY;
  const totalsY = (afterTable ?? tableStart) + 8;
  const labelX = 130;
  const valueX = 190;

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

  pdf.save(fileName);
};
