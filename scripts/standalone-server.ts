import { createServer } from "node:http";
import { appendFile, mkdir, readFile } from "node:fs/promises";
import { extname, join, normalize, resolve, sep } from "node:path";
import type { EventsPageData } from "../src/lib/events";

const projectRoot = process.cwd();
const staticRoot = resolve(projectRoot, process.env.STATIC_DIR ?? "dist");
const eventsFile = resolve(projectRoot, process.env.EVENTS_FILE ?? "public/events.json");
const registrationsFile = resolve(projectRoot, process.env.REGISTRATIONS_FILE ?? "data/registrations.jsonl");
const port = Number(process.env.PORT ?? 8787);
const botToken = process.env.TELEGRAM_BOT_TOKEN;
const notifyChatId = process.env.TELEGRAM_NOTIFY_CHAT_ID;

const contentTypes: Record<string, string> = {
  ".css": "text/css; charset=utf-8",
  ".gif": "image/gif",
  ".html": "text/html; charset=utf-8",
  ".jpg": "image/jpeg",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".webp": "image/webp",
};

function sendJson(response: import("node:http").ServerResponse, status: number, data: unknown) {
  response.writeHead(status, { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" });
  response.end(JSON.stringify(data));
}

async function readEvents(): Promise<EventsPageData> {
  return JSON.parse(await readFile(eventsFile, "utf8")) as EventsPageData;
}

async function notifyTelegram(text: string) {
  if (!botToken || !notifyChatId) return false;
  const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: notifyChatId, text }),
  });
  if (!response.ok) throw new Error(`Telegram notification failed (${response.status})`);
  return true;
}

async function readBody(request: import("node:http").IncomingMessage) {
  const chunks: Buffer[] = [];
  for await (const chunk of request) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
    if (Buffer.concat(chunks).length > 64 * 1024) throw new Error("Request body is too large");
  }
  return JSON.parse(Buffer.concat(chunks).toString("utf8")) as { fullName?: string; phone?: string; eventId?: string };
}

async function handleRegistration(request: import("node:http").IncomingMessage, response: import("node:http").ServerResponse) {
  const input = await readBody(request);
  const fullName = input.fullName?.trim().replace(/\s+/g, " ") ?? "";
  const phone = input.phone?.trim() ?? "";
  if (fullName.length < 3) return sendJson(response, 400, { error: "Укажите имя и фамилию" });
  if (!/^[+\d][\d\s()-]{9,}$/.test(phone)) return sendJson(response, 400, { error: "Укажите корректный номер телефона" });

  const events = await readEvents();
  const event = events.featuredEvent;
  if (!event || new Date(event.startsAt) <= new Date()) return sendJson(response, 400, { error: "Регистрация на мероприятие пока не открыта" });
  if (!botToken || !notifyChatId) return sendJson(response, 503, { error: "Уведомления о заявках ещё не настроены" });

  const registration = { id: `registration-${Date.now()}`, eventId: event.id, fullName, phone, createdAt: new Date().toISOString() };
  await mkdir(resolve(registrationsFile, ".."), { recursive: true });
  await appendFile(registrationsFile, `${JSON.stringify(registration)}\n`, "utf8");
  await notifyTelegram(["Новая заявка на мероприятие", "", `Мероприятие: ${event.title}`, `Имя: ${fullName}`, `Телефон: ${phone}`].join("\n"));
  return sendJson(response, 200, { id: registration.id, notification: "sent" });
}

async function serveStatic(request: import("node:http").IncomingMessage, response: import("node:http").ServerResponse) {
  const requestUrl = new URL(request.url ?? "/", "http://localhost");
  const requestedPath = decodeURIComponent(requestUrl.pathname);
  const relativePath = requestedPath === "/" ? "index.html" : requestedPath.replace(/^\/+/, "");
  const filePath = normalize(join(staticRoot, relativePath));
  const safePath = filePath === staticRoot || filePath.startsWith(`${staticRoot}${sep}`);
  if (!safePath) return sendJson(response, 403, { error: "Forbidden" });

  try {
    const file = await readFile(filePath);
    response.writeHead(200, {
      "Content-Type": contentTypes[extname(filePath).toLowerCase()] ?? "application/octet-stream",
      "Cache-Control": extname(filePath) === ".html" ? "no-cache" : "public, max-age=31536000, immutable",
    });
    response.end(file);
  } catch {
    const index = await readFile(join(staticRoot, "index.html"));
    response.writeHead(200, { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-cache" });
    response.end(index);
  }
}

const server = createServer(async (request, response) => {
  try {
    const pathname = new URL(request.url ?? "/", "http://localhost").pathname;
    if (request.method === "GET" && (pathname === "/api/events" || pathname === "/events.json")) {
      return sendJson(response, 200, await readEvents());
    }
    if (request.method === "POST" && pathname === "/api/register") return await handleRegistration(request, response);
    return await serveStatic(request, response);
  } catch (error) {
    return sendJson(response, 500, { error: error instanceof Error ? error.message : "Internal server error" });
  }
});

server.listen(port, "0.0.0.0", () => {
  console.log(`[standalone] serving ${staticRoot} on http://0.0.0.0:${port}`);
});
