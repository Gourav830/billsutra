import type { Request, Response } from "express";
import type { z } from "zod";
import prisma from "../config/db.config.js";
import { businessProfileUpsertSchema } from "../validations/apiValidations.js";

type BusinessProfileInput = z.infer<typeof businessProfileUpsertSchema>;

class BusinessProfileController {
  static async index(req: Request, res: Response) {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const profile = await prisma.businessProfile.findUnique({
      where: { user_id: userId },
    });

    return res.status(200).json({ data: profile });
  }

  static async store(req: Request, res: Response) {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const body: BusinessProfileInput = req.body;

    const profile = await prisma.businessProfile.upsert({
      where: { user_id: userId },
      update: {
        business_name: body.business_name,
        address: body.address,
        phone: body.phone,
        email: body.email,
        website: body.website,
        logo_url: body.logo_url,
        tax_id: body.tax_id,
        currency: body.currency,
        show_logo_on_invoice: body.show_logo_on_invoice,
        show_tax_number: body.show_tax_number,
        show_payment_qr: body.show_payment_qr,
      },
      create: {
        user_id: userId,
        business_name: body.business_name,
        address: body.address,
        phone: body.phone,
        email: body.email,
        website: body.website,
        logo_url: body.logo_url,
        tax_id: body.tax_id,
        currency: body.currency,
        show_logo_on_invoice: body.show_logo_on_invoice ?? true,
        show_tax_number: body.show_tax_number ?? true,
        show_payment_qr: body.show_payment_qr ?? false,
      },
    });

    return res.status(200).json({ message: "Profile saved", data: profile });
  }
}

export default BusinessProfileController;
