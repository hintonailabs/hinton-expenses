import { serve } from "@hono/node-server";
import { app } from "./app";

const port = Number(process.env.API_PORT ?? 3001);
serve({ fetch: app.fetch, port }, () => console.log(`API running on http://localhost:${port}`));

// Exit straight away on Ctrl+C so the dev watcher doesn't have to force-kill us.
for (const signal of ["SIGINT", "SIGTERM"] as const) process.on(signal, () => process.exit(0));
