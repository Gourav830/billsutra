import type { Request, Response } from "express";
import prisma from "../config/db.config.js";
import type { z } from "zod";
import {
  productCreateSchema,
  productUpdateSchema,
} from "../validations/apiValidations.js";

type ProductCreateInput = z.infer<typeof productCreateSchema>;
type ProductUpdateInput = z.infer<typeof productUpdateSchema>;

class ProductsController {
  static async index(req: Request, res: Response) {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const products = await prisma.product.findMany({
      where: { user_id: userId },
      include: { category: true },
      orderBy: { created_at: "desc" },
    });

    return res.status(200).json({ data: products });
  }

  static async store(req: Request, res: Response) {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const body: ProductCreateInput = req.body;
    const {
      name,
      sku,
      price,
      barcode,
      gst_rate,
      cost,
      stock_on_hand,
      reorder_level,
      category_id,
    } = body;

    if (category_id) {
      const category = await prisma.category.findFirst({
        where: { id: category_id, user_id: userId },
      });

      if (!category) {
        return res.status(404).json({ message: "Category not found" });
      }
    }

    if (barcode) {
      const existingBarcode = await prisma.product.findFirst({
        where: { barcode },
      });

      if (existingBarcode) {
        return res.status(409).json({ message: "Barcode already in use" });
      }
    }

    const product = await prisma.product.create({
      data: {
        user_id: userId,
        category_id,
        name,
        sku,
        barcode,
        gst_rate,
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
      include: { category: true },
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
    const body: ProductUpdateInput = req.body;
    const {
      name,
      sku,
      price,
      barcode,
      gst_rate,
      cost,
      stock_on_hand,
      reorder_level,
      category_id,
    } = body;

    if (category_id) {
      const category = await prisma.category.findFirst({
        where: { id: category_id, user_id: userId },
      });

      if (!category) {
        return res.status(404).json({ message: "Category not found" });
      }
    }

    if (barcode) {
      const existingBarcode = await prisma.product.findFirst({
        where: { barcode, NOT: { id } },
      });

      if (existingBarcode) {
        return res.status(409).json({ message: "Barcode already in use" });
      }
    }

    const updated = await prisma.product.updateMany({
      where: { id, user_id: userId },
      data: {
        name,
        sku,
        barcode,
        gst_rate,
        price,
        cost,
        stock_on_hand,
        reorder_level,
        category_id,
      },
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

