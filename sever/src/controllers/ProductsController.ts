import type { Request, Response } from "express";
import prisma from "../config/db.config.js";

class ProductsController {
  static async index(req: Request, res: Response) {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const products = await prisma.product.findMany({
      where: { user_id: userId },
      orderBy: { created_at: "desc" },
    });

    return res.status(200).json({ data: products });
  }

  static async store(req: Request, res: Response) {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { name, sku, price, cost, stock_on_hand, reorder_level } =
      req.body as {
        name?: string;
        sku?: string;
        price?: number;
        cost?: number;
        stock_on_hand?: number;
        reorder_level?: number;
      };

    if (!name || !sku || price === undefined) {
      return res.status(422).json({
        message: "Name, SKU, and price are required",
        errors: { name: "Required", sku: "Required", price: "Required" },
      });
    }

    const product = await prisma.product.create({
      data: {
        user_id: userId,
        name,
        sku,
        price,
        cost,
        stock_on_hand: stock_on_hand ?? 0,
        reorder_level: reorder_level ?? 0,
      },
    });

    return res.status(201).json({ message: "Product created", data: product });
  }

  static async show(req: Request, res: Response) {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const id = Number(req.params.id);
    const product = await prisma.product.findFirst({
      where: { id, user_id: userId },
    });

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    return res.status(200).json({ data: product });
  }

  static async update(req: Request, res: Response) {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const id = Number(req.params.id);
    const { name, sku, price, cost, stock_on_hand, reorder_level } =
      req.body as {
        name?: string;
        sku?: string;
        price?: number;
        cost?: number;
        stock_on_hand?: number;
        reorder_level?: number;
      };

    const updated = await prisma.product.updateMany({
      where: { id, user_id: userId },
      data: { name, sku, price, cost, stock_on_hand, reorder_level },
    });

    if (!updated.count) {
      return res.status(404).json({ message: "Product not found" });
    }

    return res.status(200).json({ message: "Product updated" });
  }

  static async destroy(req: Request, res: Response) {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const id = Number(req.params.id);
    const deleted = await prisma.product.deleteMany({
      where: { id, user_id: userId },
    });

    if (!deleted.count) {
      return res.status(404).json({ message: "Product not found" });
    }

    return res.status(200).json({ message: "Product removed" });
  }
}

export default ProductsController;
