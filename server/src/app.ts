import express from "express";
import type { Application, NextFunction, Request, Response } from "express";
import cors from "cors";
import morgan from "morgan";
import AppError from "./utils/AppError.js";
import errorMiddleware from "./middlewares/error.middleware.js";

const app: Application = express();

// Logs: METHOD route status response-time (e.g. GET /invoices 200 45ms)
app.use(morgan(":method :url :status :response-time[0]ms"));
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.get("/", (_req: Request, res: Response) => {
  return res.send("It's working ....");
});

app.use("/api", (await import("./routes/index.js")).default);

app.use((req: Request, _res: Response, next: NextFunction) => {
  return next(new AppError("Route not found", 404));
});

app.use(errorMiddleware);

export default app;
