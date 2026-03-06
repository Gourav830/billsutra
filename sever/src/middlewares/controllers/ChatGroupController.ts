import type { Request, Response } from "express";
import prisma from "../../config/db.config.js";
class ChatGroupController {
  static async store(req: Request, res: Response) {
    try {
      console.log(req);
      const body = req.body;
      const user = req.user || null;
      if (!user) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      await prisma.chatGroup.create({
        data: {
          title: body.title,
          passcode: body.passcode,
          user_id: user.id,
        },
      });
      return res
        .status(201)
        .json({ message: "Chat group created successfully." });
    } catch (error) {
      return res
        .status(500)
        .json({ message: "Internal Server Error Please try again later." });
    }
  }
}
export default ChatGroupController;
