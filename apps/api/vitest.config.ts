import { defineConfig } from "vitest/config";

export default defineConfig({
  // The tests never talk to the database, but importing the db client needs a URL to exist.
  test: { env: { DATABASE_URL: "postgres://user:pass@localhost/test" } },
});
