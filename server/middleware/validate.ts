import { NextFunction, Request, Response } from "express"
import { ZodSchema } from "zod"

export function validate(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse({
      body: req.body,
      query: req.query,
      params: req.params,
    })
    if (!result.success) {
      return res.status(400).json({
        success: false,
        error: result.error.issues.map((i) => i.message).join(", "),
      })
    }
    return next()
  }
}
