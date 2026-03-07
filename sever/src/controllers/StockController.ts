import type { Request, Response } from "express";
import prisma from "../config/db.config.js";
import { StockReason } from "@prisma/client";
import type { z } from "zod";
import { stockAdjustSchema } from "../validations/apiValidations.js";

type StockAdjustInput = z.infer<typeof stockAdjustSchema>;

class StockController {
  static async adjust(req: Request, res: Response) {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const body: StockAdjustInput = req.body;
    const { product_id, warehouse_id, change, reason, note } = body;

    const product = await prisma.product.findFirst({
      where: { id: product_id, user_id: userId },
    });

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    if (warehouse_id) {
      const warehouse = await prisma.warehouse.findFirst({
        where: { id: warehouse_id, user_id: userId },
      });

      if (!warehouse) {
        return res.status(404).json({ message: "Warehouse not found" });
      }
    }

    const updated = await prisma.$transaction(async (tx) => {
      const updatedProduct = await tx.product.update({
        where: { id: product.id },
        data: {
          stock_on_hand: product.stock_on_hand + change,
        },
      });

      if (warehouse_id) {
        await tx.inventory.upsert({
          where: {
            warehouse_id_product_id: {
              warehouse_id,
              product_id: product.id,
            },
          },
          update: { quantity: { increment: change } },
          create: {
            warehouse_id,
            product_id: product.id,
            quantity: change,
          },
        });
      }

      await tx.stockMovement.create({
        data: {
          product_id: product.id,
          change,
          reason: reason ?? StockReason.ADJUSTMENT,
          note: warehouse_id
            ? `${note ?? "Adjustment"} (Warehouse ${warehouse_id})`
            : note,
        },
      });

      return updatedProduct;
    });

    return res.status(200).json({ message: "Stock updated", data: updated });
  }
}

export default StockController;

