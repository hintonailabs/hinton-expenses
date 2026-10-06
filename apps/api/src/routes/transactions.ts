import { Hono } from "hono";
import { listTransactionsQuerySchema, transactionInputSchema } from "@hinton/shared";
import { parseBody, parseQuery } from "../errors";
import type { AppEnv } from "../middleware";
import * as service from "../services/transactionService";

export const transactionRoutes = new Hono<AppEnv>()
  .get("/", async (c) => c.json(await service.listTransactions(c.get("userId"), parseQuery(c, listTransactionsQuerySchema))))
  .get("/:id", async (c) => c.json(await service.getTransaction(c.get("userId"), c.req.param("id"))))
  .post("/", async (c) => c.json(await service.createTransaction(c.get("userId"), await parseBody(c, transactionInputSchema)), 201))
  .put("/:id", async (c) =>
    c.json(await service.updateTransaction(c.get("userId"), c.req.param("id"), await parseBody(c, transactionInputSchema))),
  )
  .delete("/:id", async (c) => {
    await service.deleteTransaction(c.get("userId"), c.req.param("id"));
    return c.body(null, 204);
  });
