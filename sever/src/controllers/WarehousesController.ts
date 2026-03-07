import type { Request, Response } from "express";
import prisma from "../config/db.config.js";
import type { z } from "zod";
import {
  warehouseCreateSchema,
  warehouseUpdateSchema,
} from "../validations/apiValidations.js";

type WarehouseCreateInput = z.infer<typeof warehouseCreateSchema>;
type WarehouseUpdateInput = z.infer<typeof warehouseUpdateSchema>;

class WarehousesController {
  static async index(req: Request, res: Response) {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const warehouses = await prisma.warehouse.findMany({
      where: { user_id: userId },
      orderBy: { created_at: "desc" },
    });

    return res.status(200).json({ data: warehouses });
  }

  static async store(req: Request, res: Response) {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const body: WarehouseCreateInput = req.body;
    const { name, location } = body;

    const warehouse = await prisma.warehouse.create({
      data: { user_id: userId, name, location },
    });

    return res
      .status(201)
      .json({ message: "Warehouse created", data: warehouse });
  }

  static async show(req: Request, res: Response) {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const id = Number(req.params.id);
    const warehouse = await prisma.warehouse.findFirst({
      where: { id, user_id: userId },
      include: { inventories: { include: { product: true } } },
    });

    if (!warehouse) {
      return res.status(404).json({ message: "Warehouse not found" });
    }

    return res.status(200).json({ data: warehouse });
  }

  static async update(req: Request, res: Response) {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const id = Number(req.params.id);
    const body: WarehouseUpdateInput = req.body;
    const { name, location } = body;

    const updated = await prisma.warehouse.updateMany({
      where: { id, user_id: userId },
      data: { name, location },
    });

    if (!updated.count) {
      return res.status(404).json({ message: "Warehouse not found" });
    }

    return res.status(200).json({ message: "Warehouse updated" });
  }

  static async destroy(req: Request, res: Response) {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const id = Number(req.params.id);
    const deleted = await prisma.warehouse.deleteMany({
      where: { id, user_id: userId },
    });

    if (!deleted.count) {
      return res.status(404).json({ message: "Warehouse not found" });
    }

    return res.status(200).json({ message: "Warehouse removed" });
  }
}

export default WarehousesController;

