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

const publicApiHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Cache-Control": "no-store",
};

app.options("/api/register", () => new Response(null, { status: 204, headers: publicApiHeaders }));
app.options("/api/events", () => new Response(null, { status: 204, headers: publicApiHeaders }));
app.options("/api/events/sync", () => new Response(null, { status: 204, headers: publicApiHeaders }));
app.options("/api/telegram/webhook", () => new Response(null, { status: 204, headers: publicApiHeaders }));

app.get("/api/events", async (context) => {
  try {
    return context.json(await procedures.getEventsPage(), 200, publicApiHeaders);
  } catch (error) {
    return context.json({ error: error instanceof Error ? error.message : "Не удалось загрузить события" }, 502, publicApiHeaders);
  }
});

let lastPublicEventsSyncAt = 0;
const PUBLIC_EVENTS_SYNC_COOLDOWN_MS = 30_000;

app.post("/api/events/sync", async (context) => {
  const now = Date.now();
  const retryAfter = Math.ceil((PUBLIC_EVENTS_SYNC_COOLDOWN_MS - (now - lastPublicEventsSyncAt)) / 1000);
  if (retryAfter > 0) {
    return context.json({ error: `Лента уже обновляется. Повторите через ${retryAfter} сек.` }, 429, {
      ...publicApiHeaders,
      "Retry-After": String(retryAfter),
    });
  }
  lastPublicEventsSyncAt = now;
  try {
    const sync = await procedures.syncTelegramFeed();
    const events = await procedures.getEventsPage();
    return context.json({ ...events, sync }, 200, publicApiHeaders);
  } catch (error) {
    lastPublicEventsSyncAt = 0;
    return context.json({ error: error instanceof Error ? error.message : "Не удалось обновить ленту" }, 502, publicApiHeaders);
  }
});

app.post("/api/register", async (context) => {
  try {
    const { kind, ...input } = await context.req.json<Parameters<typeof procedures.createEventRegistration>[0] & { kind?: "event" | "contact" }>();
    const result = kind === "contact"
      ? await procedures.createContactRequest(input)
      : await procedures.createEventRegistration(input);
    return context.json(result, 200, publicApiHeaders);
  } catch (error) {
    return context.json({ error: error instanceof Error ? error.message : "Не удалось отправить заявку" }, 400, publicApiHeaders);
  }
});

app.post("/api/telegram/webhook", async (context) => {
  const expectedSecret = env.TELEGRAM_WEBHOOK_SECRET;
  const receivedSecret = context.req.header("x-telegram-bot-api-secret-token");
  if (expectedSecret && receivedSecret !== expectedSecret) {
    return context.json({ error: "Unauthorized" }, 401, publicApiHeaders);
  }
  try {
    const update = await context.req.json();
    const response = await procedures.handleTelegramWebhookUpdate(update);
    return context.json(response ?? { ok: true }, 200, publicApiHeaders);
  } catch (error) {
    console.error("Telegram webhook error", error);
    return context.json({ ok: true }, 200, publicApiHeaders);
  }
});

app.use(honoMiddleware({ procedures, jobs, transcoder }));

serve({
  fetch: app.fetch,
  port: Number(env.PORT) + 1,
});
