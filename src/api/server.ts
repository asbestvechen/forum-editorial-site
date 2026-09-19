import { Hono } from "hono";
import { deserialize, serialize } from "superjson";
import { serve } from "@hono/node-server";
import {
  honoMiddleware,
  initializeServerEnvironment,
} from "@adaptive-ai/sdk/server";
import { env } from "@/lib/env";

const transcoder = { serialize, deserialize };

initializeServerEnvironment({
  baseUrl: env.VITE_BASE_URL,
  realtimeDomain: env.VITE_REALTIME_DOMAIN,
  guestServicesUrl: env.GUEST_SERVICES_URL,
  environment: env.VITE_NODE_ENV,
  apiKey: env.API_KEY,
  queueDbPath: env.QUEUE_DB_FILE_NAME,
  errorsDbPath: env.ERRORS_DB_FILE_NAME,
});

// Import these after initializing the environment
const { procedures, jobs } = await import("@/api");

const app = new Hono();

const registrationCorsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Cache-Control": "no-store",
};

app.options("/api/register", () => new Response(null, { status: 204, headers: registrationCorsHeaders }));

app.post("/api/register", async (context) => {
  try {
    const { kind, ...input } = await context.req.json<Parameters<typeof procedures.createEventRegistration>[0] & { kind?: "event" | "contact" }>();
    const result = kind === "contact"
      ? await procedures.createContactRequest(input)
      : await procedures.createEventRegistration(input);
    return context.json(result, 200, registrationCorsHeaders);
  } catch (error) {
    return context.json({ error: error instanceof Error ? error.message : "Не удалось отправить заявку" }, 400, registrationCorsHeaders);
  }
});

app.use(honoMiddleware({ procedures, jobs, transcoder }));

serve({
  fetch: app.fetch,
  port: Number(env.PORT) + 1,
});
