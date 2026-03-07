import type { Request, Response } from "express";
import prisma from "../config/db.config.js";
import { InvoiceStatus, PaymentMethod } from "@prisma/client";
import type { z } from "zod";
import { paymentCreateSchema } from "../validations/apiValidations.js";

type PaymentCreateInput = z.infer<typeof paymentCreateSchema>;

class PaymentsController {
  static async index(req: Request, res: Response) {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const payments = await prisma.payment.findMany({
      where: { user_id: userId },
      include: { invoice: true },
      orderBy: { created_at: "desc" },
    });

    return res.status(200).json({ data: payments });
  }

  static async store(req: Request, res: Response) {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const body: PaymentCreateInput = req.body;

    const invoice = await prisma.invoice.findFirst({
      where: { id: body.invoice_id, user_id: userId },
    });

    if (!invoice) {
      return res.status(404).json({ message: "Invoice not found" });
    }

    const payment = await prisma.payment.create({
      data: {
        user_id: userId,
        invoice_id: body.invoice_id,
        amount: body.amount,
        method: body.method ?? PaymentMethod.CASH,
        reference: body.reference,
        paid_at: body.paid_at ?? undefined,
      },
    });

    const totals = await prisma.payment.aggregate({
      where: { invoice_id: body.invoice_id },
      _sum: { amount: true },
    });

    const paid = Number(totals._sum.amount ?? 0);
    const total = Number(invoice.total);
    let status: InvoiceStatus = InvoiceStatus.SENT;

    if (paid >= total) {
      status = InvoiceStatus.PAID;
    } else if (paid > 0) {
      status = InvoiceStatus.PARTIALLY_PAID;
    }

    await prisma.invoice.update({
      where: { id: invoice.id },
      data: { status },
    });

    return res.status(201).json({ message: "Payment recorded", data: payment });
  }
}

export default PaymentsController;

