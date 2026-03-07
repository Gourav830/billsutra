import type { Request, Response } from "express";
import prisma from "../config/db.config.js";
import bcrypt from "bcryptjs";
import type { z } from "zod";
import {
  userPasswordUpdateSchema,
  userProfileUpdateSchema,
} from "../validations/apiValidations.js";

type UserProfileUpdateInput = z.infer<typeof userProfileUpdateSchema>;
type UserPasswordUpdateInput = z.infer<typeof userPasswordUpdateSchema>;

class UsersController {
  static async me(req: Request, res: Response) {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const user = await prisma.user.findFirst({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        provider: true,
        image: true,
        is_email_verified: true,
      },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({ data: user });
  }

  static async updateProfile(req: Request, res: Response) {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const body: UserProfileUpdateInput = req.body;
    const { name, email } = body;

    if (!name && !email) {
      return res.status(422).json({
        message: "No changes provided",
        errors: { name: "Provide a name or email" },
      });
    }

    if (email) {
      const existing = await prisma.user.findFirst({
        where: { email, NOT: { id: userId } },
      });
      if (existing) {
        return res.status(422).json({
          message: "Email already in use",
          errors: { email: "Email already in use" },
        });
      }
    }

    const updated = await prisma.user.update({
      where: { id: userId },
      data: {
        name: name ?? undefined,
        email: email ?? undefined,
      },
      select: {
        id: true,
        name: true,
        email: true,
        provider: true,
        image: true,
        is_email_verified: true,
      },
    });

    return res.status(200).json({
      message: "Profile updated",
      data: updated,
    });
  }

  static async updatePassword(req: Request, res: Response) {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const body: UserPasswordUpdateInput = req.body;
    const { current_password, password } = body;

    const user = await prisma.user.findFirst({
      where: { id: userId },
      select: { password_hash: true, provider: true },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.provider === "google") {
      return res.status(400).json({
        message: "Password updates are managed by Google for this account",
      });
    }

    if (!user.password_hash) {
      return res.status(400).json({
        message: "Password updates are not available for this account",
      });
    }

    const valid = await bcrypt.compare(current_password, user.password_hash);
    if (!valid) {
      return res.status(422).json({
        message: "Current password is incorrect",
        errors: { current_password: "Incorrect password" },
      });
    }

    const password_hash = await bcrypt.hash(password, 12);
    await prisma.user.update({
      where: { id: userId },
      data: { password_hash },
    });

    return res.status(200).json({ message: "Password updated" });
  }
}

export default UsersController;
