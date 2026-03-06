import type { Request, Response } from "express";
import prisma from "../config/db.config.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import crypto from "crypto";

interface OAuthLoginPayload {
  name?: string;
  email: string;
  provider?: string;
  oauth_id?: string;
  image?: string;
}

interface CredentialsPayload {
  name?: string;
  email: string;
  password: string;
  confirm_password?: string;
}

const signToken = (payload: { id: number; email: string; name: string }) => {
  return jwt.sign(payload, process.env.JWT_SECRET as string, {
    expiresIn: "365d",
  });
};

class AuthController {
  static async oauthLogin(req: Request, res: Response) {
    try {
      const body: OAuthLoginPayload = req.body;
      if (!body?.email) {
        return res.status(400).json({ message: "Email is required" });
      }

      const provider = body.provider || "google";
      const findUser = await prisma.user.upsert({
        where: { email: body.email },
        update: {
          name: body.name || "",
          provider,
          oauth_id: body.oauth_id,
          image: body.image,
          is_email_verified: true,
        },
        create: {
          name: body.name || "",
          email: body.email,
          provider,
          oauth_id: body.oauth_id,
          image: body.image,
          is_email_verified: true,
        },
      });

      const token = signToken({
        id: findUser.id,
        name: findUser.name,
        email: findUser.email,
      });

      return res.status(200).json({
        message: "Login successful",
        user: findUser,
        token: `Bearer ${token}`,
      });
    } catch (error) {
      return res.status(500).json({ message: "Internal Server Error" });
    }
  }

  static async register(req: Request, res: Response) {
    try {
      const body: CredentialsPayload = req.body;
      if (!body?.email || !body?.password || !body?.name) {
        return res.status(422).json({
          message: "Name, email, and password are required",
          errors: { email: "Required", password: "Required", name: "Required" },
        });
      }
      if (body.confirm_password && body.confirm_password !== body.password) {
        return res.status(422).json({
          message: "Passwords do not match",
          errors: { confirm_password: "Passwords do not match" },
        });
      }

      const existing = await prisma.user.findUnique({
        where: { email: body.email },
      });
      if (existing) {
        return res.status(422).json({
          message: "Email already registered",
          errors: { email: "Email already registered" },
        });
      }

      const password_hash = await bcrypt.hash(body.password, 12);
      const user = await prisma.user.create({
        data: {
          name: body.name,
          email: body.email,
          password_hash,
          provider: "credentials",
        },
      });

      return res.status(200).json({
        message: "Registration successful",
        user,
      });
    } catch (error) {
      return res.status(500).json({ message: "Internal Server Error" });
    }
  }

  static async loginCheck(req: Request, res: Response) {
    try {
      const body: CredentialsPayload = req.body;
      if (!body?.email || !body?.password) {
        return res.status(422).json({
          message: "Email and password are required",
          errors: { email: "Required", password: "Required" },
        });
      }

      const user = await prisma.user.findUnique({
        where: { email: body.email },
      });

      if (!user || !user.password_hash) {
        return res.status(422).json({
          message: "Invalid credentials",
          errors: { email: "Invalid credentials" },
        });
      }

      const valid = await bcrypt.compare(body.password, user.password_hash);
      if (!valid) {
        return res.status(422).json({
          message: "Invalid credentials",
          errors: { email: "Invalid credentials" },
        });
      }

      const token = signToken({
        id: user.id,
        email: user.email,
        name: user.name,
      });

      return res.status(200).json({
        message: "Login successful",
        user,
        token: `Bearer ${token}`,
      });
    } catch (error) {
      return res.status(500).json({ message: "Internal Server Error" });
    }
  }

  static async forgotPassword(req: Request, res: Response) {
    try {
      const email = req.body?.email as string | undefined;
      if (!email) {
        return res.status(422).json({
          message: "Email is required",
          errors: { email: "Required" },
        });
      }

      const user = await prisma.user.findUnique({ where: { email } });
      if (!user) {
        return res.status(422).json({
          message: "No account found for this email",
          errors: { email: "No account found" },
        });
      }

      const token = crypto.randomBytes(24).toString("hex");
      const expires = new Date(Date.now() + 1000 * 60 * 30);

      await prisma.passwordResetToken.create({
        data: {
          user_id: user.id,
          token,
          expires_at: expires,
        },
      });

      return res.status(200).json({
        message: "Reset link generated",
        token,
      });
    } catch (error) {
      return res.status(500).json({ message: "Internal Server Error" });
    }
  }

  static async resetPassword(req: Request, res: Response) {
    try {
      const { email, password, confirm_password, token } = req.body as {
        email?: string;
        password?: string;
        confirm_password?: string;
        token?: string;
      };

      if (!email || !password || !token) {
        return res.status(422).json({
          message: "Email, token, and password are required",
          errors: { email: "Required", password: "Required" },
        });
      }
      if (confirm_password && confirm_password !== password) {
        return res.status(422).json({
          message: "Passwords do not match",
          errors: { confirm_password: "Passwords do not match" },
        });
      }

      const user = await prisma.user.findUnique({ where: { email } });
      if (!user) {
        return res.status(422).json({
          message: "Invalid reset request",
          errors: { email: "Invalid reset request" },
        });
      }

      const reset = await prisma.passwordResetToken.findFirst({
        where: {
          user_id: user.id,
          token,
          used_at: null,
          expires_at: { gt: new Date() },
        },
      });

      if (!reset) {
        return res.status(422).json({
          message: "Invalid or expired reset token",
          errors: { token: "Invalid token" },
        });
      }

      const password_hash = await bcrypt.hash(password, 12);
      await prisma.user.update({
        where: { id: user.id },
        data: { password_hash },
      });
      await prisma.passwordResetToken.update({
        where: { id: reset.id },
        data: { used_at: new Date() },
      });

      return res.status(200).json({ message: "Password reset successful" });
    } catch (error) {
      return res.status(500).json({ message: "Internal Server Error" });
    }
  }
}

export default AuthController;
