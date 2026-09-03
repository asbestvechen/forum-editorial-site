import { useEffect, useMemo, useState, type CSSProperties, type FormEvent } from "react";
import { ArrowUpRight, CalendarDays, Check, Clock3, Images, MapPin, Send, Sparkles } from "lucide-react";
import { apiClient } from "@adaptive-ai/sdk/client";
import { SiteHeader } from "@/components/SiteHeader";
import { brand } from "@/lib/brand";
import {
  eventPostCategoryAccent,
  eventPostCategoryLabels,
  fallbackEventsPage,
  formatPostDate,
  type EventsPageData,
  type FeaturedEvent,
  type TelegramPost,
} from "@/lib/events";

type EventsApi = {
  createEventRegistration: (input: { fullName: string; phone: string; eventId?: string }) => Promise<{ id: string; notification: string }>;
};

const api = apiClient<EventsApi>();

async function submitRegistration(input: { fullName: string; phone: string; eventId?: string }) {
  const response = await fetch("./api/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  if (response.ok) return response.json() as Promise<{ id: string; notification: string }>;
  if (response.status !== 404) {
    const payload = await response.json().catch(() => null) as { error?: string } | null;
    throw new Error(payload?.error ?? "Не удалось отправить заявку");
  }
  return api.createEventRegistration(input);
}

function formatEventDate(event: FeaturedEvent | null) {
  if (!event) return null;
  const date = new Date(event.startsAt);
  return {
    day: new Intl.DateTimeFormat("ru-RU", { day: "2-digit", timeZone: event.displayTimezone }).format(date),
    month: new Intl.DateTimeFormat("ru-RU", { month: "short", timeZone: event.displayTimezone }).format(date).replace(".", ""),
    full: new Intl.DateTimeFormat("ru-RU", { weekday: "long", day: "numeric", month: "long", timeZone: event.displayTimezone }).format(date),
    time: new Intl.DateTimeFormat("ru-RU", { hour: "2-digit", minute: "2-digit", timeZone: event.displayTimezone }).format(date),
  };
}

function PostGallery({ post, index }: { post: TelegramPost; index: number }) {
  const accent = eventPostCategoryAccent[post.category];
  const images = post.imageUrls?.length ? post.imageUrls : post.imageUrl ? [post.imageUrl] : [];
  const [activeIndex, setActiveIndex] = useState(0);
  const activeImage = images[activeIndex] ?? images[0] ?? "";

  const moveToImage = (nextIndex: number) => {
    setActiveIndex(Math.max(0, Math.min(nextIndex, images.length - 1)));
  };

  return (
    <div className="events-post__gallery">
      {images.length > 0 ? (
        <div className="events-post__gallery-stage-wrap">
          <a
            className="events-post__gallery-stage"
            href={activeImage}
            target="_blank"
            rel="noreferrer"
            aria-label={`Открыть фотографию ${activeIndex + 1} из ${images.length} в полном размере`}
            onKeyDown={(event) => {
              if (event.key === "ArrowLeft") moveToImage(activeIndex - 1);
              if (event.key === "ArrowRight") moveToImage(activeIndex + 1);
            }}
          >
            <img
              src={activeImage}
              alt=""
              loading={index === 0 ? "eager" : "lazy"}
              onLoad={(event) => {
                if (event.currentTarget.naturalWidth < 640) event.currentTarget.classList.add("events-post__media-image--lowres");
              }}
            />
            <span className="events-post__gallery-position">{String(activeIndex + 1).padStart(2, "0")} / {String(images.length).padStart(2, "0")}</span>
          </a>
          {images.length > 1 && (
            <div className="events-post__thumbnails" aria-label="Фотографии публикации">
              {images.map((imageUrl, imageIndex) => (
                <button
                  className={`events-post__thumbnail ${imageIndex === activeIndex ? "events-post__thumbnail--active" : ""}`}
                  type="button"
                  key={`${imageUrl}-${imageIndex}`}
                  aria-label={`Показать фотографию ${imageIndex + 1} из ${images.length}`}
                  aria-pressed={imageIndex === activeIndex}
                  onClick={() => moveToImage(imageIndex)}
                >
                  <img src={imageUrl} alt="" loading="lazy" />
                </button>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="events-post__gallery-fallback" style={{ "--post-accent": accent } as CSSProperties}>
          <Sparkles size={26} strokeWidth={1} />
        </div>
      )}
      <div className="events-post__gallery-caption">
        <span><Images size={14} strokeWidth={1.4} /> {images.length ? `${images.length} фото` : "Без фото"}</span>
      </div>
    </div>
  );
}

function PostCard({ post, index }: { post: TelegramPost; index: number }) {
  const accent = eventPostCategoryAccent[post.category];
  return (
    <article className={`events-post ${index % 2 === 1 ? "events-post--reverse" : ""}`}>
      <PostGallery post={post} index={index} />
      <div className="events-post__body">
        <div className="events-post__eyebrow">
          <span className="events-post__number">{String(index + 1).padStart(2, "0")}</span>
          <div className="events-post__meta">
            <span style={{ color: accent }}>{eventPostCategoryLabels[post.category]}</span>
            <time dateTime={post.publishedAt}>{formatPostDate(post.publishedAt)}</time>
          </div>
        </div>
        <h3>{post.title}</h3>
        <p>{post.excerpt}</p>
        <a className="events-post__link" href={post.telegramUrl} target="_blank" rel="noreferrer">
          Читать в Telegram <ArrowUpRight size={15} strokeWidth={1.4} />
        </a>
      </div>
    </article>
  );
}

function FeaturedEvent({ event }: { event: FeaturedEvent | null }) {
  const date = formatEventDate(event);
  if (!event || !date) {
    return (
      <div className="events-featured events-featured--empty">
        <div className="events-featured__empty-mark"><CalendarDays size={28} strokeWidth={1} /></div>
        <div>
          <p className="events-kicker">Ближайшее мероприятие</p>
          <h2>Скоро увидимся в салоне</h2>
          <p className="events-featured__description">Как только появится новая дата, здесь будет подробный анонс и запись на встречу.</p>
        </div>
        <a className="editorial-button editorial-button--outline" href="https://t.me/salon4room" target="_blank" rel="noreferrer">
          Следить за анонсами <ArrowUpRight size={16} strokeWidth={1.4} />
        </a>
      </div>
    );
  }

  return (
    <div className="events-featured">
      <div className="events-featured__date" aria-label={`Дата: ${date.full}`}>
        <span>{date.day}</span>
        <small>{date.month}</small>
      </div>
      <div className="events-featured__content">
        <p className="events-kicker">Ближайшее мероприятие</p>
        <h2>{event.title}</h2>
        <p className="events-featured__description">{event.description}</p>
        <div className="events-featured__details">
          <span><CalendarDays size={15} strokeWidth={1.4} /> {date.full}</span>
          <span><Clock3 size={15} strokeWidth={1.4} /> {date.time}</span>
          <span><MapPin size={15} strokeWidth={1.4} /> {event.location}</span>
        </div>
      </div>
      <a className="editorial-button" href="#registration">
        Записаться <ArrowUpRight size={16} strokeWidth={1.4} />
      </a>
    </div>
  );
}

function RegistrationForm({ event }: { event: FeaturedEvent | null }) {
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [state, setState] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [error, setError] = useState("");

  const handleSubmit = async (submitEvent: FormEvent<HTMLFormElement>) => {
    submitEvent.preventDefault();
    if (!event) return;
    setState("submitting");
    setError("");
    try {
      await submitRegistration({ fullName, phone, eventId: event.id });
      setState("success");
      setFullName("");
      setPhone("");
    } catch (requestError) {
      setState("error");
      setError(requestError instanceof Error ? requestError.message : "Не удалось отправить заявку");
    }
  };

  return (
    <section id="registration" className={`events-registration ${!event ? "events-registration--closed" : ""}`}>
      <div className="events-registration__intro">
        <p className="events-kicker">Личная встреча</p>
        <h2>{event ? "Забронируйте место" : "Запись откроется здесь"}</h2>
        <p>{event ? "Оставьте имя и телефон — мы подтвердим участие и пришлём детали встречи." : "Когда ближайшее мероприятие будет опубликовано, форма записи станет активной."}</p>
      </div>
      {event ? (
        state === "success" ? (
          <div className="events-registration__success">
            <Check size={20} strokeWidth={1.5} />
            <strong>Заявка принята</strong>
            <span>Мы свяжемся с вами и подтвердим участие.</span>
          </div>
        ) : (
          <form className="events-registration__form" onSubmit={handleSubmit}>
            <label>
              <span>Имя и фамилия</span>
              <input value={fullName} onChange={(eventChange) => setFullName(eventChange.target.value)} name="fullName" autoComplete="name" required placeholder="Как к вам обращаться" />
            </label>
            <label>
              <span>Номер телефона</span>
              <input value={phone} onChange={(eventChange) => setPhone(eventChange.target.value)} name="phone" type="tel" inputMode="tel" autoComplete="tel" required placeholder="+7 900 000 00 00" />
            </label>
            <button className="editorial-button" type="submit" disabled={state === "submitting"}>
              {state === "submitting" ? "Отправляем…" : "Записаться"} <Send size={15} strokeWidth={1.4} />
            </button>
            {state === "error" && <p className="events-registration__error" role="alert">{error}</p>}
            <p className="events-registration__note">Нажимая кнопку, вы соглашаетесь на обработку контактных данных.</p>
          </form>
        )
      ) : (
        <a className="events-registration__channel" href={fallbackEventsPage.channelUrl} target="_blank" rel="noreferrer">
          <span>Пока следите за новостями в канале</span>
          <ArrowUpRight size={17} strokeWidth={1.4} />
        </a>
      )}
    </section>
  );
}

export function EventsPage() {
  const [pageData, setPageData] = useState<EventsPageData>(fallbackEventsPage);
  const posts = useMemo(() => pageData.posts.slice(0, 12), [pageData.posts]);

  useEffect(() => {
    let active = true;
    fetch("./events.json", { cache: "no-store" })
      .then((response) => {
        if (!response.ok) throw new Error(`Events export returned ${response.status}`);
        return response.json() as Promise<EventsPageData>;
      })
      .then((data) => {
        if (!active) return;
        setPageData({ ...fallbackEventsPage, ...data, posts: Array.isArray(data.posts) ? data.posts : [] });
      })
      .catch(() => undefined);
    return () => { active = false; };
  }, []);

  return (
    <div className="site-editorial events-page font-body bg-[#FBF8F3] text-[#241D14]">
      <SiteHeader />
      <main>
        <section className="events-hero max-w-[1400px] mx-auto px-6 md:px-12 pt-16 md:pt-24 pb-14 md:pb-20">
          <div className="events-hero__label">
            <span className="events-hero__line" />
            <span>Встречи, новинки, вдохновение</span>
          </div>
          <div className="events-hero__grid">
            <h1 className="font-display">События<span className="text-[#C98A12]">.</span></h1>
            <div className="events-hero__intro">
              <p>Следим за новыми коллекциями, встречаемся с брендами и показываем, как материалы становятся частью живого интерьера.</p>
              <a href="https://t.me/salon4room" target="_blank" rel="noreferrer">Канал 4ROOM <ArrowUpRight size={16} strokeWidth={1.4} /></a>
            </div>
          </div>
        </section>

        <section className="events-featured-section max-w-[1400px] mx-auto px-6 md:px-12 pb-24">
          <FeaturedEvent event={pageData.featuredEvent} />
        </section>

        <section className="events-feed max-w-[1400px] mx-auto px-6 md:px-12 pb-24">
          <div className="events-section-heading">
            <div>
              <p className="events-kicker">Из канала 4ROOM</p>
              <h2>Новости салона</h2>
            </div>
          </div>
          <div className="events-feed__grid">
            {posts.length > 0 ? posts.map((post, index) => <PostCard key={`${post.telegramMessageId}-${post.id}`} post={post} index={index} />) : (
              <div className="events-feed__empty">Публикации появятся после первой синхронизации с Telegram.</div>
            )}
          </div>
        </section>

        <div className="max-w-[1400px] mx-auto px-6 md:px-12 pb-24">
          <RegistrationForm event={pageData.featuredEvent} />
        </div>

        <section className="events-channel-cta max-w-[1400px] mx-auto px-6 md:px-12 pb-24">
          <div>
            <p className="events-kicker">Всё самое свежее</p>
            <h2>Оставайтесь<br /><em>на связи</em></h2>
          </div>
          <a className="editorial-button editorial-button--dark" href="https://t.me/salon4room" target="_blank" rel="noreferrer">
            Открыть Telegram <ArrowUpRight size={16} strokeWidth={1.4} />
          </a>
        </section>
      </main>
      <footer className="events-footer">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <span>© {new Date().getFullYear()} ФОРУМ — интерьерный бутик</span>
          <a href={brand.phoneHref}>{brand.phone}</a>
        </div>
      </footer>
    </div>
  );
}
