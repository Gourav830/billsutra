import type { Request, Response, NextFunction } from "express";
import type { ZodSchema } from "zod";

type ValidationSchemas = {
  body?: ZodSchema;
  params?: ZodSchema;
  query?: ZodSchema;
};

const formatErrors = (error: unknown) => {
  if (error && typeof error === "object" && "flatten" in error) {
    const flattened = (
      error as { flatten: () => { fieldErrors: unknown } }
    ).flatten();
    return flattened.fieldErrors;
  }

  return { error: ["Invalid request"] };
};

const validate = (schemas: ValidationSchemas) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (schemas.body) {
      const result = schemas.body.safeParse(req.body);
      if (!result.success) {
        return res.status(422).json({
          message: "Validation failed",
          errors: formatErrors(result.error),
        });
      }
      req.body = result.data;
    }

    if (schemas.params) {
      const result = schemas.params.safeParse(req.params);
      if (!result.success) {
        return res.status(422).json({
          message: "Validation failed",
          errors: formatErrors(result.error),
        });
      }
      req.params = result.data;
    }

    if (schemas.query) {
      const result = schemas.query.safeParse(req.query);
      if (!result.success) {
        return res.status(422).json({
          message: "Validation failed",
          errors: formatErrors(result.error),
        });
      }
      Object.assign(req.query, result.data);
    }

    return next();
  };
};

export default validate;
