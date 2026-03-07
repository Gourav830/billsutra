import prisma from "../../config/db.config.js";
import { InvoiceStatus, SaleStatus, StockReason } from "@prisma/client";
import { calculateTotals } from "../../utils/calculateTotals.js";
import type { InvoiceCalcItem } from "../../utils/calculateTotals.js";
import { generateInvoiceNumber } from "../../utils/generateInvoiceNumber.js";

export const listInvoices = async (userId: number) => {
  return prisma.invoice.findMany({
    where: { user_id: userId },
    include: { customer: true, items: true, payments: true },
    orderBy: { createdAt: "desc" },
  });
};

export const createInvoice = async (
  userId: number,
  payload: {
    customer_id: number;
    date?: Date | string | null;
    due_date?: Date | string | null;
    discount?: number | null;
    status?: InvoiceStatus;
    notes?: string | null;
    sync_sales?: boolean;
    warehouse_id?: number | null;
    items: InvoiceCalcItem[];
  },
) => {
  const latest = await prisma.invoice.findFirst({
    where: { user_id: userId },
    orderBy: { createdAt: "desc" },
    select: { invoice_number: true },
  });

  const invoiceNumber = generateInvoiceNumber(latest?.invoice_number);
  const totals = calculateTotals(payload.items, payload.discount ?? 0);

  const itemPayload = totals.items.map((item) => ({
    product_id: item.product_id ?? undefined,
    name: item.name,
    quantity: item.quantity,
    price: item.price,
    tax_rate: item.tax_rate ?? undefined,
    total: item.total,
  }));

  const syncSales = payload.sync_sales !== false;

  return prisma.$transaction(async (tx) => {
    if (syncSales) {
      const missingProduct = totals.items.some((item) => !item.product_id);
      if (missingProduct) {
        const error = new Error(
          "All items must have products to sync sales and inventory.",
        ) as Error & { status?: number };
        error.status = 400;
        throw error;
      }

      if (!payload.warehouse_id) {
        const error = new Error(
          "Select a warehouse to sync inventory.",
        ) as Error & { status?: number };
        error.status = 400;
        throw error;
      }

      const productIds = totals.items.map((item) => item.product_id as number);
      const products = await tx.product.findMany({
        where: { id: { in: productIds }, user_id: userId },
      });

      if (products.length !== productIds.length) {
        const error = new Error("Product not found.") as Error & {
          status?: number;
        };
        error.status = 404;
        throw error;
      }

      const productMap = new Map(products.map((p) => [p.id, p]));

      const warehouse = await tx.warehouse.findFirst({
        where: { id: payload.warehouse_id, user_id: userId },
      });

      if (!warehouse) {
        const error = new Error("Warehouse not found.") as Error & {
          status?: number;
        };
        error.status = 404;
        throw error;
      }

      const inventories = await tx.inventory.findMany({
        where: {
          warehouse_id: payload.warehouse_id,
          product_id: { in: productIds },
        },
      });

      const inventoryMap = new Map(
        inventories.map((inventory) => [inventory.product_id, inventory]),
      );

      for (const item of totals.items) {
        const product = productMap.get(item.product_id as number);
        if (!product || product.stock_on_hand < item.quantity) {
          const error = new Error("Insufficient stock.") as Error & {
            status?: number;
            errors?: Record<string, unknown>;
          };
          error.status = 409;
          error.errors = { product_id: item.product_id };
          throw error;
        }

        const inventory = inventoryMap.get(item.product_id as number);
        if (!inventory || inventory.quantity < item.quantity) {
          const error = new Error("Insufficient warehouse stock.") as Error & {
            status?: number;
            errors?: Record<string, unknown>;
          };
          error.status = 409;
          error.errors = { product_id: item.product_id };
          throw error;
        }
      }
    }

    const invoice = await tx.invoice.create({
      data: {
        user_id: userId,
        customer_id: payload.customer_id,
        invoice_number: invoiceNumber,
        date: payload.date ?? undefined,
        due_date: payload.due_date ?? undefined,
        status: payload.status ?? InvoiceStatus.DRAFT,
        subtotal: totals.subtotal,
        tax: totals.tax,
        discount: totals.discount,
        total: totals.total,
        notes: payload.notes ?? undefined,
        items: { create: itemPayload },
      },
      include: { items: true },
    });

    if (syncSales) {
      const saleItems = totals.items.map((item) => ({
        product_id: item.product_id ?? undefined,
        name: item.name,
        quantity: item.quantity,
        unit_price: item.price,
        tax_rate: item.tax_rate ?? undefined,
        line_total: item.total,
      }));

      await tx.sale.create({
        data: {
          user_id: userId,
          customer_id: payload.customer_id,
          sale_date: payload.date ?? undefined,
          status: SaleStatus.COMPLETED,
          subtotal: totals.subtotal,
          tax: totals.tax,
          total: totals.total,
          notes: payload.notes
            ? `${payload.notes} (Synced from invoice ${invoiceNumber})`
            : `Synced from invoice ${invoiceNumber}`,
          items: { create: saleItems },
        },
      });

      for (const item of totals.items) {
        await tx.product.update({
          where: { id: item.product_id as number },
          data: { stock_on_hand: { decrement: item.quantity } },
        });

        await tx.inventory.update({
          where: {
            warehouse_id_product_id: {
              warehouse_id: payload.warehouse_id as number,
              product_id: item.product_id as number,
            },
          },
          data: { quantity: { decrement: item.quantity } },
        });

        await tx.stockMovement.create({
          data: {
            product_id: item.product_id as number,
            change: -item.quantity,
            reason: StockReason.SALE,
            note: `Invoice ${invoiceNumber} (Warehouse ${payload.warehouse_id})`,
          },
        });
      }
    }

    return invoice;
  });
};

export const getInvoice = async (userId: number, id: number) => {
  return prisma.invoice.findFirst({
    where: { id, user_id: userId },
    include: { customer: true, items: true, payments: true },
  });
};

export const deleteInvoice = async (userId: number, id: number) => {
  return prisma.invoice.deleteMany({ where: { id, user_id: userId } });
};
