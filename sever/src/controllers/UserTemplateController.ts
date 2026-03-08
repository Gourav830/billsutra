import type { Request, Response } from "express";
import type { z } from "zod";
import prisma from "../config/db.config.js";
import { userTemplateUpsertSchema } from "../validations/apiValidations.js";

type UserTemplateInput = z.infer<typeof userTemplateUpsertSchema>;

class UserTemplateController {
  static async index(req: Request, res: Response) {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const templateId = req.query.template_id
      ? Number(req.query.template_id)
      : null;

    if (templateId) {
      const setting = await prisma.userTemplate.findUnique({
        where: { user_id_template_id: { user_id: userId, template_id: templateId } },
      });
      return res.status(200).json({ data: setting });
    }

    const settings = await prisma.userTemplate.findMany({
      where: { user_id: userId },
      orderBy: { updated_at: "desc" },
    });

    return res.status(200).json({ data: settings });
  }

  static async store(req: Request, res: Response) {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const body: UserTemplateInput = req.body;

    const templateSetting = await prisma.userTemplate.upsert({
      where: {
        user_id_template_id: { user_id: userId, template_id: body.template_id },
      },
      update: {
        enabled_sections: body.enabled_sections,
        theme_color: body.theme_color,
        section_order: body.section_order,
      },
      create: {
        user_id: userId,
        template_id: body.template_id,
        enabled_sections: body.enabled_sections,
        theme_color: body.theme_color,
        section_order: body.section_order,
      },
    });

    return res.status(200).json({
      message: "Template settings saved",
      data: templateSetting,
    });
  }
}

export default UserTemplateController;
