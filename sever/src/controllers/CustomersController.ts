import type { Request, Response } from "express";
import prisma from "../config/db.config.js";

class CustomersController {
  static async index(req: Request, res: Response) {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const customers = await prisma.customer.findMany({
      where: { user_id: userId },
      orderBy: { created_at: "desc" },
    });

    return res.status(200).json({ data: customers });
  }

  static async store(req: Request, res: Response) {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { name, email, phone, address } = req.body as {
      name?: string;
      email?: string;
      phone?: string;
      address?: string;
    };

    if (!name) {
      return res.status(422).json({
        message: "Customer name is required",
        errors: { name: "Required" },
      });
    }

    const customer = await prisma.customer.create({
      data: {
        user_id: userId,
        name,
        email,
        phone,
        address,
      },
    });

    return res
      .status(201)
      .json({ message: "Customer created", data: customer });
  }

  static async show(req: Request, res: Response) {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const id = Number(req.params.id);
    const customer = await prisma.customer.findFirst({
      where: { id, user_id: userId },
    });

    if (!customer) {
      return res.status(404).json({ message: "Customer not found" });
    }

    return res.status(200).json({ data: customer });
  }

  static async update(req: Request, res: Response) {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const id = Number(req.params.id);
    const { name, email, phone, address } = req.body as {
      name?: string;
      email?: string;
      phone?: string;
      address?: string;
    };

    const updated = await prisma.customer.updateMany({
      where: { id, user_id: userId },
      data: { name, email, phone, address },
    });

    if (!updated.count) {
      return res.status(404).json({ message: "Customer not found" });
    }

    return res.status(200).json({ message: "Customer updated" });
  }

  static async destroy(req: Request, res: Response) {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const id = Number(req.params.id);
    const deleted = await prisma.customer.deleteMany({
      where: { id, user_id: userId },
    });

    if (!deleted.count) {
      return res.status(404).json({ message: "Customer not found" });
    }

    return res.status(200).json({ message: "Customer removed" });
  }
}

export default CustomersController;
