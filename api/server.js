import { Hono } from "hono";
import { deserialize, serialize } from "superjson";
import { serve } from "@hono/node-server";
import { initializeServerEnvironment, honoMiddleware } from "@adaptive-ai/sdk/server";
import { e as env } from "./assets/env-BKm1UNh2.js";
import "zod";
const transcoder = { serialize, deserialize };
initializeServerEnvironment({
  baseUrl: env.VITE_BASE_URL,
  realtimeDomain: env.VITE_REALTIME_DOMAIN,
  guestServicesUrl: env.GUEST_SERVICES_URL,
  environment: env.VITE_NODE_ENV,
  apiKey: env.API_KEY,
  queueDbPath: env.QUEUE_DB_FILE_NAME,
  errorsDbPath: env.ERRORS_DB_FILE_NAME
});
const { procedures, jobs } = await import("./assets/index-qzR7C0kP.js");
const app = new Hono();
app.use(honoMiddleware({ procedures, jobs, transcoder }));
serve({
  fetch: app.fetch,
  port: Number(env.PORT) + 1
});
