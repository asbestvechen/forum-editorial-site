import { access, mkdir, readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { fetchTelegramPreview } from "../src/api/telegram";
import type { EventsPageData, TelegramPost } from "../src/lib/events";

const projectRoot = process.cwd();
const eventsFile = resolve(projectRoot, "public/events.json");
const imageDirectory = resolve(projectRoot, "public/images/events");

async function findExistingImage(post: TelegramPost, index: number) {
  const names = [
    `telegram-${post.telegramMessageId}-${String(index + 1).padStart(2, "0")}`,
    ...(index === 0 ? [`telegram-${post.telegramMessageId}`] : []),
  ];
  for (const extension of ["jpg", "png", "webp"]) {
    for (const name of names) {
      const fileName = `${name}.${extension}`;
      try {
        await access(resolve(imageDirectory, fileName));
        return `./images/events/${fileName}`;
      } catch {
        // Try the next supported filename.
      }
    }
  }
  return null;
}

async function downloadPostImage(post: TelegramPost, imageUrl: string, index: number) {
  if (!imageUrl.startsWith("http")) return imageUrl;

  try {
    const response = await fetch(imageUrl, { headers: { "User-Agent": "4ROOM-events-export/1.0" } });
    if (!response.ok) return (await findExistingImage(post, index)) ?? imageUrl;
    const contentType = response.headers.get("content-type") ?? "image/jpeg";
    const extension = contentType.includes("png") ? "png" : contentType.includes("webp") ? "webp" : "jpg";
    const fileName = `telegram-${post.telegramMessageId}-${String(index + 1).padStart(2, "0")}.${extension}`;
    await writeFile(resolve(imageDirectory, fileName), Buffer.from(await response.arrayBuffer()));
    return `./images/events/${fileName}`;
  } catch {
    return (await findExistingImage(post, index)) ?? imageUrl;
  }
}

async function main() {
  await mkdir(imageDirectory, { recursive: true });
  let featuredEvent: EventsPageData["featuredEvent"] = null;
  try {
    const current = JSON.parse(await readFile(eventsFile, "utf8")) as Partial<EventsPageData>;
    featuredEvent = current.featuredEvent ?? null;
  } catch {
    // The first export starts without a featured event.
  }
  const sourcePosts = await fetchTelegramPreview();
  const posts = await Promise.all(sourcePosts.map(async (post) => {
    const sourceImages = post.imageUrls.length > 0 ? post.imageUrls : post.imageUrl ? [post.imageUrl] : [];
    const imageUrls = await Promise.all(sourceImages.map((imageUrl, index) => downloadPostImage(post, imageUrl, index)));
    return { ...post, imageUrl: imageUrls[0] ?? null, imageUrls };
  }));
  const data: EventsPageData = {
    featuredEvent,
    posts,
    channelUrl: "https://t.me/salon4room",
    lastSyncedAt: new Date().toISOString(),
  };

  await writeFile(eventsFile, `${JSON.stringify(data, null, 2)}\n`, "utf8");
  console.log(`[telegram] exported ${posts.length} posts to ${eventsFile}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
