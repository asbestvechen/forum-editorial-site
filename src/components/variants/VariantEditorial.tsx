import { useCallback, useEffect, useRef, useState, type PointerEvent } from "react";
import { ArrowDown, ArrowUpRight, MapPin } from "lucide-react";
import { DirectionDrawer } from "@/components/DirectionDrawer";
import { RegistrationModal } from "@/components/RegistrationModal";
import { SiteHeader } from "@/components/SiteHeader";
import { advantages, brand, categories, lightImages } from "@/lib/brand";
import type { Category } from "@/lib/brand";

// Variant 1 — the approved Editorial concept, kept intentionally close to the original mockup.
export function VariantEditorial() {
  const motionRootRef = useRef<HTMLDivElement>(null);
  const directionScrollerRef = useRef<HTMLDivElement>(null);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [contactOpen, setContactOpen] = useState(false);
  const closeDrawer = useCallback(() => setSelectedCategory(null), []);

  useEffect(() => {
    const root = motionRootRef.current;
    if (!root) return;

    root.classList.add("editorial-motion-ready");
    const targets = Array.from(root.querySelectorAll<HTMLElement>("[data-reveal]"));
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const directionCards = targets.filter((target) => target.classList.contains("editorial-direction-card"));
    const standardTargets = targets.filter((target) => !target.classList.contains("editorial-direction-card"));
    const directionScroller = directionScrollerRef.current;

    if (reducedMotion || !("IntersectionObserver" in window)) {
      targets.forEach((target) => target.classList.add("is-visible"));
      return () => root.classList.remove("editorial-motion-ready");
    }

    const revealDirectionCards = () => {
      directionCards.forEach((card) => card.classList.add("is-visible"));
    };

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          if (entry.target === directionScroller) {
            revealDirectionCards();
          } else {
            entry.target.classList.add("is-visible");
          }
          observer.unobserve(entry.target);
        });
      },
      { rootMargin: "0px 0px -12% 0px", threshold: 0.12 },
    );

    standardTargets.forEach((target) => observer.observe(target));
    if (directionScroller) observer.observe(directionScroller);

    standardTargets.forEach((target) => {
      const bounds = target.getBoundingClientRect();
      if (bounds.bottom > 0 && bounds.top < window.innerHeight && bounds.right > 0 && bounds.left < window.innerWidth) {
        target.classList.add("is-visible");
      }
    });
    if (directionScroller) {
      const bounds = directionScroller.getBoundingClientRect();
      if (bounds.bottom > 0 && bounds.top < window.innerHeight && bounds.right > 0 && bounds.left < window.innerWidth) {
        revealDirectionCards();
      }
    }
    return () => {
      observer.disconnect();
      root.classList.remove("editorial-motion-ready");
    };
  }, []);

  const handleHeroPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (event.pointerType !== "mouse") return;
    const hero = event.currentTarget;
    const bounds = hero.getBoundingClientRect();
    const x = (event.clientX - bounds.left) / bounds.width - 0.5;
    const y = (event.clientY - bounds.top) / bounds.height - 0.5;
    hero.style.setProperty("--hero-tilt-x", `${(x * 5.5).toFixed(2)}deg`);
    hero.style.setProperty("--hero-tilt-y", `${(-y * 5.5).toFixed(2)}deg`);
    hero.style.setProperty("--hero-shift-x", `${(x * 8).toFixed(1)}px`);
    hero.style.setProperty("--hero-shift-y", `${(y * 8).toFixed(1)}px`);
    hero.style.setProperty("--hero-focus-x", `${((x + 0.5) * 100).toFixed(1)}%`);
    hero.style.setProperty("--hero-focus-y", `${((y + 0.5) * 100).toFixed(1)}%`);
  };

  const resetHeroTilt = (event: PointerEvent<HTMLDivElement>) => {
    const hero = event.currentTarget;
    hero.style.setProperty("--hero-tilt-x", "0deg");
    hero.style.setProperty("--hero-tilt-y", "0deg");
    hero.style.setProperty("--hero-shift-x", "0px");
    hero.style.setProperty("--hero-shift-y", "0px");
    hero.style.setProperty("--hero-focus-x", "50%");
    hero.style.setProperty("--hero-focus-y", "50%");
  };

  return (
    <div ref={motionRootRef} className="site-editorial font-body bg-[#FBF8F3] text-[#241D14]">
      <SiteHeader />

      {/* Hero */}
      <section className="editorial-hero-section max-w-[1400px] mx-auto px-6 md:px-12 pt-6 md:pt-10 pb-16 md:pb-28 grid md:grid-cols-2 gap-10 md:gap-16 items-center">
        <div className="editorial-hero-copy editorial-reveal editorial-reveal--1 order-2 md:order-1">
          <div className="editorial-hero-copy-lead">
            <p className="max-w-full text-[10px] md:text-sm uppercase tracking-[0.18em] md:tracking-[0.3em] text-[#C98A12] mb-6">
              Интерьерный бутик
            </p>
            <h1 className="font-display text-5xl md:text-[clamp(3.5rem,4.3vw,4.5rem)] leading-[1.05] mb-8">
              <span className="editorial-title-line editorial-title-line--1">Пространство,</span>
              <br />
              <span className="editorial-title-line editorial-title-line--2">созданное с&nbsp;умом</span>
              <br />
              <span className="editorial-title-line editorial-title-line--3 italic text-[#C98A12]">и характером</span>
            </h1>
          </div>
          <div className="editorial-hero-copy-support">
            <p className="text-base md:text-lg text-[#241D14]/70 max-w-md mb-10 leading-relaxed">
              {brand.name} напрямую работает с ведущими производителями Италии,
              Испании, Германии, Португалии и других стран — это лучшие цены,
              сроки поставки и возможность реализовать самые сложные проекты.
            </p>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
              <a href="#directions" className="editorial-button editorial-button--outline">
                Смотреть направления <ArrowDown size={16} strokeWidth={1.5} />
              </a>
              <button
                type="button"
                onClick={() => setContactOpen(true)}
                className="editorial-button editorial-button--hero-register"
              >
                Связаться <ArrowUpRight size={16} strokeWidth={1.5} />
              </button>
            </div>
          </div>
        </div>
        <div className="editorial-hero-visual editorial-reveal editorial-reveal--2 order-1 md:order-2 relative">
          <div
            className="editorial-hero-image group relative aspect-[16/9] overflow-hidden rounded-sm"
            onPointerMove={handleHeroPointerMove}
            onPointerLeave={resetHeroTilt}
          >
            <img
              src={lightImages.heroEditorial}
              alt="Современный интерьер с натуральными материалами и мягким светом"
              width="1200"
              height="675"
              fetchPriority="high"
              decoding="async"
              className="editorial-hero-photo w-full h-full object-cover"
            />
            <div className="editorial-mobile-hero-heading">
              <p className="text-[10px] uppercase tracking-[0.18em] text-[#C98A12]">Интерьерный бутик</p>
              <h1 className="font-display">
                <span className="editorial-title-line editorial-title-line--1">Пространство,</span>
                <br />
                <span className="editorial-title-line editorial-title-line--2">созданное с&nbsp;умом</span>
                <br />
                <span className="editorial-title-line editorial-title-line--3 italic text-[#C98A12]">и характером</span>
              </h1>
            </div>
            <div className="editorial-hero-caption absolute left-5 bottom-5 md:left-7 md:bottom-7 flex items-center gap-3 text-[10px] uppercase tracking-[0.18em] text-[#FBF8F3]">
              <span className="h-px w-8 bg-[#E6B94D]" />
              Сначала — ощущение
            </div>
          </div>
        </div>
      </section>

      {/* Directions — structure borrowed from Dark Luxury, colors remain Editorial */}
      <section className="editorial-directions max-w-[1400px] mx-auto px-6 md:px-12 py-16 md:py-24 scroll-mt-24">
        <div id="directions" className="editorial-scroll-reveal flex items-end justify-between mb-12 scroll-mt-24" data-reveal>
          <h2 className="font-display text-4xl md:text-5xl">Направления</h2>
          <p className="hidden md:block text-sm text-[#241D14]/50 max-w-xs text-right">
            Полный спектр решений для комплектации интерьера
          </p>
        </div>
        <div
          ref={directionScrollerRef}
          className="editorial-direction-grid flex md:grid md:grid-cols-4 gap-4 md:gap-4 overflow-x-auto md:overflow-visible pb-4 md:pb-0 [&>*]:shrink-0"
        >
          {categories.map((category, index) => (
            <button
              key={category.slug}
              type="button"
              className="editorial-direction-card editorial-scroll-reveal group relative overflow-hidden w-[280px] md:w-auto aspect-[3/4]"
              data-reveal
              aria-haspopup="dialog"
              aria-label={`Открыть описание: ${category.title}`}
              onClick={() => setSelectedCategory(category)}
            >
              <img
                src={category.image}
                alt={category.title}
                width="960"
                height="1200"
                loading="lazy"
                decoding="async"
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 z-[1] bg-gradient-to-t from-[#241D14]/90 via-[#241D14]/15 to-transparent" />
              <div className="absolute top-4 right-4 z-10 h-9 w-9 rounded-full border border-[#FBF8F3]/45 text-[#FBF8F3] flex items-center justify-center transition-all duration-500 group-hover:bg-[#C98A12] group-hover:border-[#C98A12] group-hover:rotate-45">
                <ArrowUpRight size={15} strokeWidth={1.5} />
              </div>
              <div className="editorial-direction-copy absolute bottom-0 z-10 p-5 md:p-6 text-[#FBF8F3]">
                <span className="block text-[10px] tracking-[0.2em] text-[#E6B94D] mb-2">{String(index + 1).padStart(2, "0")}</span>
                <h3 className="font-display text-xl md:text-2xl leading-[0.95] mb-2">{category.title}</h3>
                <p className="text-xs text-[#FBF8F3]/65 leading-relaxed max-w-[240px]">{category.desc}</p>
              </div>
            </button>
          ))}
        </div>
        <p className="md:hidden text-[10px] uppercase tracking-[0.18em] text-[#241D14]/40 mt-4">Листайте вправо <span className="text-[#C98A12]">→</span></p>
      </section>

      {/* About / why us — intentionally follows Directions */}
      <section
        id="about"
        className="max-w-[1400px] mx-auto px-6 md:px-12 py-16 md:py-20 border-t border-[#241D14]/10 scroll-mt-24"
      >
        <div className="flex items-end justify-between mb-10 md:mb-12">
          <div className="editorial-scroll-reveal" data-reveal>
            <p className="text-xs uppercase tracking-[0.28em] text-[#C98A12] mb-4">О нас</p>
            <h2 className="font-display text-4xl md:text-5xl">Почему ФОРУМ</h2>
          </div>
          <p className="hidden md:block text-sm text-[#241D14]/50 max-w-xs text-right">
            Работаем внимательно — от выбора коллекции до доставки
          </p>
        </div>
        <div className="grid md:grid-cols-4 gap-10 md:gap-8">
          {advantages.map((advantage, index) => (
            <div key={advantage.title} className="editorial-scroll-reveal relative group" data-reveal style={{ transitionDelay: `${index * 90}ms` }}>
              <span className="font-display text-4xl text-[#C98A12]/50">{String(index + 1).padStart(2, "0")}</span>
              <div className="w-8 h-px bg-[#C98A12] my-4 transition-all duration-300 group-hover:w-14" />
              <h3 className="font-display text-xl mt-3 mb-2">{advantage.title}</h3>
              <p className="text-sm text-[#241D14]/60 leading-relaxed">{advantage.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Location map before footer */}
      <section id="location" className="border-t border-[#241D14]/10 bg-[#EFE6DA]">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12 py-16 md:py-20">
          <div className="editorial-scroll-reveal flex flex-col md:flex-row md:items-end justify-between gap-5 mb-8" data-reveal>
            <div>
              <p className="text-xs uppercase tracking-[0.28em] text-[#C98A12] mb-4">Ждём в гостях</p>
              <h2 className="font-display text-4xl md:text-5xl">Наш адрес</h2>
            </div>
            <p className="flex items-center gap-2 text-sm text-[#241D14]/60"><MapPin size={16} className="text-[#C98A12]" strokeWidth={1.5} /> {brand.address}</p>
          </div>
          <div className="overflow-hidden rounded-sm border border-[#241D14]/12 shadow-[0_20px_60px_rgba(36,29,20,0.08)] bg-[#D9CBB9]">
            <iframe
              title="Карта расположения интерьерного бутика ФОРУМ"
              src="https://yandex.ru/map-widget/v1/?mode=search&text=%D0%95%D0%BA%D0%B0%D1%82%D0%B5%D1%80%D0%B8%D0%BD%D0%B1%D1%83%D1%80%D0%B3%2C%20%D1%83%D0%BB.%20%D0%A5%D0%BE%D1%85%D1%80%D1%8F%D0%BA%D0%BE%D0%B2%D0%B0%2C%2018&z=17"
              className="block w-full h-[340px] md:h-[420px] grayscale-[15%]"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>
      </section>

      {/* Contacts / footer */}
      <section
        id="contacts"
        className="border-t border-[#241D14]/10 bg-[#241D14] text-[#FBF8F3] scroll-mt-24"
      >
        <div className="max-w-[1400px] mx-auto px-6 md:px-12 py-16 md:py-24 grid md:grid-cols-2 gap-10">
          <div className="editorial-scroll-reveal" data-reveal>
            <img
              src="./logo/icon-gold-transparent.png"
              alt=""
              width="48"
              height="48"
              loading="lazy"
              className="h-12 w-12 mb-6"
            />
            <h2 className="font-display text-4xl md:text-5xl mb-6">
              Всегда рады
              <br />
              новым клиентам
            </h2>
            <p className="text-[#FBF8F3]/60 max-w-sm leading-relaxed">
              Приходите в салон или оставьте заявку — наш специалист свяжется с
              вами и поможет подобрать решение под ваш интерьер.
            </p>
          </div>
          <div className="editorial-scroll-reveal flex flex-col justify-end gap-4 text-sm md:text-base" data-reveal>
            <div className="flex justify-between border-b border-[#FBF8F3]/15 pb-4">
              <span className="text-[#FBF8F3]/50 uppercase tracking-wide text-xs">Телефон</span>
              <a href={brand.phoneHref} className="hover:text-[#C98A12]">{brand.phone}</a>
            </div>
            <div className="flex justify-between border-b border-[#FBF8F3]/15 pb-4">
              <span className="text-[#FBF8F3]/50 uppercase tracking-wide text-xs">Email</span>
              <a href={`mailto:${brand.email}`} className="hover:text-[#C98A12]">{brand.email}</a>
            </div>
            <div className="flex justify-between border-b border-[#FBF8F3]/15 pb-4">
              <span className="text-[#FBF8F3]/50 uppercase tracking-wide text-xs">Адрес</span>
              <span className="text-right">{brand.address}</span>
            </div>
            <div className="flex justify-between pb-4">
              <span className="text-[#FBF8F3]/50 uppercase tracking-wide text-xs">Часы работы</span>
              <span>{brand.hours}</span>
            </div>
            <button type="button" onClick={() => setContactOpen(true)} className="editorial-button editorial-button--contact">Оставить контакт <ArrowUpRight size={16} strokeWidth={1.5} /></button>
          </div>
        </div>
        <div className="max-w-[1400px] mx-auto px-6 md:px-12 pb-8 text-xs text-[#FBF8F3]/40">
          © {new Date().getFullYear()} {brand.name} — интерьерный бутик
        </div>
      </section>
      <DirectionDrawer
        category={selectedCategory}
        categories={categories}
        onClose={closeDrawer}
        onSelect={setSelectedCategory}
      />
      <RegistrationModal mode="contact" open={contactOpen} onClose={() => setContactOpen(false)} />
    </div>
  );
}
