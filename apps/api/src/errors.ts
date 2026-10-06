import type { Context } from "hono";
import type { ZodType, z } from "zod";
import type { ApiErrorBody } from "@hinton/shared";

/** Throw this anywhere. `onError` turns it into the one error response shape. */
export class AppError extends Error {
  constructor(
    public status: 400 | 401 | 404 | 409 | 500,
    public code: string,
    message: string,
    public details?: unknown,
  ) {
    super(message);
  }
}

export const notFound = (what: string) => new AppError(404, "not_found", `${what} not found`);

export function errorHandler(err: Error, c: Context) {
  if (err instanceof AppError) {
    const body: ApiErrorBody = { error: { code: err.code, message: err.message, details: err.details } };
    return c.json(body, err.status);
  }
  console.error(err);
  const body: ApiErrorBody = { error: { code: "internal_error", message: "Something went wrong" } };
  return c.json(body, 500);
}

/** Checks data against a Zod schema. Bad data becomes a 400 with the list of problems. */
export function parse<S extends ZodType>(schema: S, data: unknown): z.output<S> {
  const result = schema.safeParse(data);
  if (result.success) return result.data;
  const issues = result.error.issues.map((i) => ({ field: i.path.join("."), message: i.message }));
  throw new AppError(400, "validation_error", issues[0]?.message ?? "Invalid request", issues);
}

export async function parseBody<S extends ZodType>(c: Context, schema: S): Promise<z.output<S>> {
  const body = await c.req.json().catch(() => {
    throw new AppError(400, "invalid_json", "Request body must be JSON");
  });
  return parse(schema, body);
}

export const parseQuery = <S extends ZodType>(c: Context, schema: S) => parse(schema, c.req.query());
