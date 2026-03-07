import type { Request, Response } from "express";
import type { z } from "zod";
import { invoiceCreateSchema } from "../../validations/apiValidations.js";
import {
  createInvoice,
  deleteInvoice,
  getInvoice,
  listInvoices,
} from "./invoice.service.js";

type InvoiceCreateInput = z.infer<typeof invoiceCreateSchema>;

export const index = async (req: Request, res: Response) => {
  const userId = req.user?.id;
  if (!userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const invoices = await listInvoices(userId);
  return res.status(200).json({ data: invoices });
};

export const store = async (req: Request, res: Response) => {
  const userId = req.user?.id;
  if (!userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const body = req.body as InvoiceCreateInput;
    const invoice = await createInvoice(userId, body);
    return res.status(201).json({ message: "Invoice created", data: invoice });
  } catch (error) {
    const err = error as Error & {
      status?: number;
      errors?: Record<string, unknown>;
    };
    if (err.status) {
      return res.status(err.status).json({
        message: err.message,
        errors: err.errors,
      });
    }
    return res.status(500).json({ message: "Unable to create invoice" });
  }
};

export const show = async (req: Request, res: Response) => {
  const userId = req.user?.id;
  if (!userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const id = Number(req.params.id);
  const invoice = await getInvoice(userId, id);
  if (!invoice) {
    return res.status(404).json({ message: "Invoice not found" });
  }

  return res.status(200).json({ data: invoice });
};

export const destroy = async (req: Request, res: Response) => {
  const userId = req.user?.id;
  if (!userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const id = Number(req.params.id);
  const deleted = await deleteInvoice(userId, id);
  if (!deleted.count) {
    return res.status(404).json({ message: "Invoice not found" });
  }

  return res.status(200).json({ message: "Invoice removed" });
};
