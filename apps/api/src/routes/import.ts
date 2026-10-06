import { Hono } from "hono";
import { importRequestSchema } from "@hinton/shared";
import { parseBody } from "../errors";
import type { AppEnv } from "../middleware";
import * as service from "../services/importService";

export const importRoutes = new Hono<AppEnv>()
  .post("/preview", async (c) => c.json(await service.previewImport(c.get("userId"), (await parseBody(c, importRequestSchema)).csv)))
  .post("/commit", async (c) => c.json(await service.commitImport(c.get("userId"), (await parseBody(c, importRequestSchema)).csv)));
