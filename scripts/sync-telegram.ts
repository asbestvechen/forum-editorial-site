import { access, mkdir, readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { fetchTelegramPreview } from "../src/api/telegram";
import type { EventsPageData, TelegramMedia, TelegramPost } from "../src/lib/events";

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
    const sourceMedia: TelegramMedia[] = post.media?.length
      ? post.media
      : (post.imageUrls.length > 0 ? post.imageUrls : post.imageUrl ? [post.imageUrl] : [])
        .map((url) => ({ type: "image" as const, url }));
    let imageIndex = 0;
    const media = await Promise.all(sourceMedia.map(async (item) => {
      if (item.type === "video" || !item.url?.startsWith("http")) return item;
      const currentImageIndex = imageIndex;
      imageIndex += 1;
      const localUrl = await downloadPostImage(post, item.url, currentImageIndex);
      return { ...item, url: localUrl };
    }));
    const imageUrls = media.filter((item) => item.type === "image" && item.url).map((item) => item.url as string);
    const videoPoster = media.find((item) => item.type === "video")?.posterUrl ?? null;
    return { ...post, media, imageUrl: imageUrls[0] ?? videoPoster, imageUrls };
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
