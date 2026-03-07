import { Router } from "express";
import AuthMiddleware from "../../middlewares/AuthMIddleware.js";
import validate from "../../middlewares/validate.js";
import {
  idParamSchema,
  invoiceCreateSchema,
} from "../../validations/apiValidations.js";
import { destroy, index, show, store } from "./invoice.controller.js";

const router = Router();

router.get("/", AuthMiddleware, index);
router.post(
  "/",
  AuthMiddleware,
  validate({ body: invoiceCreateSchema }),
  store,
);
router.get("/:id", AuthMiddleware, validate({ params: idParamSchema }), show);
router.delete(
  "/:id",
  AuthMiddleware,
  validate({ params: idParamSchema }),
  destroy,
);

export default router;
