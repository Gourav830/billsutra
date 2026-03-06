import type { Request, Response } from "express";

class HealthController {
  static async status(req: Request, res: Response) {
    return res.status(200).json({ status: "ok" });
  }
}

export default HealthController;
