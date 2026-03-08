import type { Request, Response } from "express";
import prisma from "../config/db.config.js";

class TemplatesController {
  static async index(req: Request, res: Response) {
    const templates = await prisma.template.findMany({
      include: {
        sections: {
          orderBy: { section_order: "asc" },
        },
      },
      orderBy: { created_at: "desc" },
    });

    return res.status(200).json({ data: templates });
  }
}

export default TemplatesController;
