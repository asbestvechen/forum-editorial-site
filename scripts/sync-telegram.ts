import { mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { fetchTelegramPreview } from "../src/api/telegram";
import type { EventsPageData, TelegramPost } from "../src/lib/events";

const projectRoot = process.cwd();
const eventsFile = resolve(projectRoot, "public/events.json");
const imageDirectory = resolve(projectRoot, "public/images/events");

async function downloadPostImage(post: TelegramPost) {
  if (!post.imageUrl || !post.imageUrl.startsWith("http")) return post.imageUrl ?? null;

  try {
    const response = await fetch(post.imageUrl, { headers: { "User-Agent": "4ROOM-events-export/1.0" } });
    if (!response.ok) return post.imageUrl;
    const contentType = response.headers.get("content-type") ?? "image/jpeg";
    const extension = contentType.includes("png") ? "png" : contentType.includes("webp") ? "webp" : "jpg";
    const fileName = `telegram-${post.telegramMessageId}.${extension}`;
    await writeFile(resolve(imageDirectory, fileName), Buffer.from(await response.arrayBuffer()));
    return `./images/events/${fileName}`;
  } catch {
    return post.imageUrl;
  }
}

async function main() {
  await mkdir(imageDirectory, { recursive: true });
  const sourcePosts = await fetchTelegramPreview();
  const posts = await Promise.all(sourcePosts.map(async (post) => ({
    ...post,
    imageUrl: await downloadPostImage(post),
  })));
  const data: EventsPageData = {
    featuredEvent: null,
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
