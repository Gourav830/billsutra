import type { Request, Response } from "express";
import prisma from "../config/db.config.js";
import { StockReason } from "@prisma/client";

class StockController {
  static async adjust(req: Request, res: Response) {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { product_id, change, reason, note } = req.body as {
      product_id?: number;
      change?: number;
      reason?: StockReason;
      note?: string;
    };

    if (!product_id || change === undefined) {
      return res.status(422).json({
        message: "Product and change are required",
        errors: { product_id: "Required", change: "Required" },
      });
    }

    const product = await prisma.product.findFirst({
      where: { id: product_id, user_id: userId },
    });

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    const updated = await prisma.product.update({
      where: { id: product.id },
      data: {
        stock_on_hand: product.stock_on_hand + change,
      },
    });

    await prisma.stockMovement.create({
      data: {
        product_id: product.id,
        change,
        reason: reason ?? StockReason.ADJUSTMENT,
        note,
      },
    });

    return res.status(200).json({ message: "Stock updated", data: updated });
  }
}

export default StockController;
