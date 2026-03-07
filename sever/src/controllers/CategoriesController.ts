import type { Request, Response } from "express";
import prisma from "../config/db.config.js";
import type { z } from "zod";
import {
  categoryCreateSchema,
  categoryUpdateSchema,
} from "../validations/apiValidations.js";

type CategoryCreateInput = z.infer<typeof categoryCreateSchema>;
type CategoryUpdateInput = z.infer<typeof categoryUpdateSchema>;

class CategoriesController {
  static async index(req: Request, res: Response) {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const categories = await prisma.category.findMany({
      where: { user_id: userId },
      orderBy: { created_at: "desc" },
    });

    return res.status(200).json({ data: categories });
  }

  static async store(req: Request, res: Response) {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const body: CategoryCreateInput = req.body;
    const { name } = body;

    const category = await prisma.category.create({
      data: { user_id: userId, name },
    });

    return res
      .status(201)
      .json({ message: "Category created", data: category });
  }

  static async show(req: Request, res: Response) {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const id = Number(req.params.id);
    const category = await prisma.category.findFirst({
      where: { id, user_id: userId },
    });

    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    return res.status(200).json({ data: category });
  }

  static async update(req: Request, res: Response) {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const id = Number(req.params.id);
    const body: CategoryUpdateInput = req.body;
    const { name } = body;

    const updated = await prisma.category.updateMany({
      where: { id, user_id: userId },
      data: { name },
    });

    if (!updated.count) {
      return res.status(404).json({ message: "Category not found" });
    }

    return res.status(200).json({ message: "Category updated" });
  }

  static async destroy(req: Request, res: Response) {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const id = Number(req.params.id);
    const deleted = await prisma.category.deleteMany({
      where: { id, user_id: userId },
    });

    if (!deleted.count) {
      return res.status(404).json({ message: "Category not found" });
    }

    return res.status(200).json({ message: "Category removed" });
  }
}

export default CategoriesController;

