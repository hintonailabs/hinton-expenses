import { serve } from "@hono/node-server";
import { app } from "./app";

const port = Number(process.env.API_PORT ?? 3001);
const server = serve({ fetch: app.fetch, port }, () => console.log(`API running on http://localhost:${port}`));

// Stop cleanly on Ctrl+C so the dev watcher doesn't have to force-kill us.
for (const signal of ["SIGINT", "SIGTERM"] as const) {
  process.on(signal, () => {
    server.closeAllConnections();
    server.close(() => process.exit(0));
    setTimeout(() => process.exit(0), 500).unref();
  });
}
