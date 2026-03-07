import type { Request, Response } from "express";
import prisma from "../config/db.config.js";
import { InvoiceStatus } from "@prisma/client";
import type { z } from "zod";
import {
  invoiceCreateSchema,
  invoiceUpdateSchema,
} from "../validations/apiValidations.js";
import { calculateInvoiceTotals } from "../utils/invoiceCalculations.js";

type InvoiceCreateInput = z.infer<typeof invoiceCreateSchema>;
type InvoiceUpdateInput = z.infer<typeof invoiceUpdateSchema>;
type InvoiceItemInput = InvoiceCreateInput["items"][number];

class InvoicesController {
  static async nextInvoiceNumber(userId: number) {
    const latest = await prisma.invoice.findFirst({
      where: { user_id: userId },
      orderBy: { createdAt: "desc" },
      select: { invoice_number: true },
    });

    const match = latest?.invoice_number?.match(/INV-(\d+)/i);
    const next = match ? Number(match[1]) + 1 : 1;
    return `INV-${String(next).padStart(4, "0")}`;
  }

  static async index(req: Request, res: Response) {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const invoices = await prisma.invoice.findMany({
      where: { user_id: userId },
      include: { customer: true, items: true, payments: true },
      orderBy: { createdAt: "desc" },
    });

    return res.status(200).json({ data: invoices });
  }

  static async store(req: Request, res: Response) {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const body: InvoiceCreateInput = req.body;

    const { subtotal, tax, discount, total, items } = calculateInvoiceTotals(
      body.items,
      body.discount ?? 0,
    );

    const invoiceNumber = await InvoicesController.nextInvoiceNumber(userId);

    const invoice = await prisma.invoice.create({
      data: {
        user_id: userId,
        customer_id: body.customer_id,
        invoice_number: invoiceNumber,
        date: body.date ?? undefined,
        due_date: body.due_date ?? undefined,
        status: body.status ?? InvoiceStatus.DRAFT,
        subtotal,
        tax,
        discount,
        total,
        notes: body.notes,
        items: { create: items },
      },
      include: { items: true },
    });

    return res.status(201).json({ message: "Invoice created", data: invoice });
  }

  static async show(req: Request, res: Response) {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const id = Number(req.params.id);
    const invoice = await prisma.invoice.findFirst({
      where: { id, user_id: userId },
      include: { customer: true, items: true, payments: true },
    });

    if (!invoice) {
      return res.status(404).json({ message: "Invoice not found" });
    }

    return res.status(200).json({ data: invoice });
  }

  static async update(req: Request, res: Response) {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const id = Number(req.params.id);
    const body: InvoiceUpdateInput = req.body;
    const { status, due_date, notes } = body;

    const updated = await prisma.invoice.updateMany({
      where: { id, user_id: userId },
      data: {
        status,
        due_date: due_date ?? undefined,
        notes,
      },
    });

    if (!updated.count) {
      return res.status(404).json({ message: "Invoice not found" });
    }

    return res.status(200).json({ message: "Invoice updated" });
  }

  static async destroy(req: Request, res: Response) {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const id = Number(req.params.id);
    const deleted = await prisma.invoice.deleteMany({
      where: { id, user_id: userId },
    });

    if (!deleted.count) {
      return res.status(404).json({ message: "Invoice not found" });
    }

    return res.status(200).json({ message: "Invoice removed" });
  }
}

export default InvoicesController;
