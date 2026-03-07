import type { Request, Response } from "express";
import prisma from "../config/db.config.js";
import { StockReason } from "@prisma/client";
import type { z } from "zod";
import {
  inventoryAdjustSchema,
  inventoryQuerySchema,
} from "../validations/apiValidations.js";

type InventoryAdjustInput = z.infer<typeof inventoryAdjustSchema>;
type InventoryQueryInput = z.infer<typeof inventoryQuerySchema>;

class InventoriesController {
  static async index(req: Request, res: Response) {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const query: InventoryQueryInput = req.query;
    const { warehouse_id: warehouseId } = query;

    const inventories = await prisma.inventory.findMany({
      where: {
        warehouse: { user_id: userId },
        ...(warehouseId ? { warehouse_id: warehouseId } : {}),
      },
      include: { warehouse: true, product: true },
      orderBy: { id: "desc" },
    });

    return res.status(200).json({ data: inventories });
  }

  static async adjust(req: Request, res: Response) {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const body: InventoryAdjustInput = req.body;
    const { warehouse_id, product_id, change, reason, note } = body;

    const [warehouse, product] = await Promise.all([
      prisma.warehouse.findFirst({
        where: { id: warehouse_id, user_id: userId },
      }),
      prisma.product.findFirst({
        where: { id: product_id, user_id: userId },
      }),
    ]);

    if (!warehouse) {
      return res.status(404).json({ message: "Warehouse not found" });
    }

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    const updated = await prisma.$transaction(async (tx) => {
      const inventory = await tx.inventory.upsert({
        where: {
          warehouse_id_product_id: {
            warehouse_id,
            product_id,
          },
        },
        update: { quantity: { increment: change } },
        create: {
          warehouse_id,
          product_id,
          quantity: change,
        },
      });

      const productUpdated = await tx.product.update({
        where: { id: product_id },
        data: { stock_on_hand: { increment: change } },
      });

      await tx.stockMovement.create({
        data: {
          product_id,
          change,
          reason: reason ?? StockReason.ADJUSTMENT,
          note: note
            ? `${note} (Warehouse ${warehouse_id})`
            : `Warehouse ${warehouse_id}`,
        },
      });

      return { inventory, product: productUpdated };
    });

    return res.status(200).json({
      message: "Inventory updated",
      data: updated,
    });
  }
}

export default InventoriesController;

