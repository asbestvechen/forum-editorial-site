import { brand, categories, advantages, darkImages } from "@/lib/brand";

// Variant 2 — Dark luxury. Bold typography, black + gold, masonry gallery.
export function VariantDarkLuxury() {
  return (
    <div className="font-body bg-[#0B0A08] text-[#F3EEE3]">
      {/* Top bar */}
      <header className="flex items-center justify-between px-6 md:px-12 py-6 max-w-[1400px] mx-auto">
        <span className="font-display text-2xl tracking-[0.1em]">
          ФОРУМ<span className="text-[#D59700]">.</span>
        </span>
        <nav className="hidden md:flex items-center gap-10 text-xs uppercase tracking-[0.25em] text-[#F3EEE3]/60">
          <a href="#gallery" className="hover:text-[#D59700] transition-colors">
            Направления
          </a>
          <a href="#why" className="hover:text-[#D59700] transition-colors">
            Почему мы
          </a>
          <a href="#contacts" className="hover:text-[#D59700] transition-colors">
            Контакты
          </a>
        </nav>
        <a href={brand.phoneHref} className="text-sm tracking-wide">
          {brand.phone}
        </a>
      </header>

      {/* Hero */}
      <section className="relative max-w-[1400px] mx-auto px-6 md:px-12 pt-4 md:pt-8">
        <div className="relative aspect-[16/9] md:aspect-[16/7] overflow-hidden">
          <img
            src={darkImages.hero}
            alt="Интерьер"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0B0A08] via-[#0B0A08]/40 to-transparent" />
          <div className="absolute inset-0 flex flex-col items-start justify-end p-8 md:p-16">
            <p className="text-xs md:text-sm uppercase tracking-[0.35em] text-[#D59700] mb-4">
              Интерьерный бутик
            </p>
            <h1 className="font-display text-5xl md:text-8xl leading-[0.95] max-w-3xl">
              Роскошь —
              <br />
              это <span className="text-[#D59700] italic">детали</span>
            </h1>
          </div>
        </div>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 py-10 md:py-14 border-b border-[#F3EEE3]/10">
          <p className="text-[#F3EEE3]/60 max-w-lg leading-relaxed text-sm md:text-base">
            {brand.name} напрямую работает с ведущими производителями Италии,
            Испании, Германии и Португалии — лучшие цены, сроки поставки и
            реализация самых сложных дизайн-проектов.
          </p>
          <button className="shrink-0 px-8 py-4 border border-[#D59700] text-[#D59700] text-sm uppercase tracking-[0.15em] hover:bg-[#D59700] hover:text-[#0B0A08] transition-colors">
            Консультация специалиста
          </button>
        </div>
      </section>

      {/* Advantages marquee-ish row */}
      <section id="why" className="max-w-[1400px] mx-auto px-6 md:px-12 py-14 md:py-20">
        <div className="grid md:grid-cols-4 gap-px bg-[#F3EEE3]/10">
          {advantages.map((a) => (
            <div key={a.title} className="bg-[#0B0A08] p-8">
              <div className="w-8 h-px bg-[#D59700] mb-6" />
              <h3 className="font-display text-xl mb-3">{a.title}</h3>
              <p className="text-sm text-[#F3EEE3]/50 leading-relaxed">
                {a.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Masonry-ish gallery of directions — horizontal scroll on mobile */}
      <section id="gallery" className="py-14 md:py-20">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12 flex items-end justify-between mb-10">
          <h2 className="font-display text-4xl md:text-6xl">Направления</h2>
          <span className="text-xs uppercase tracking-[0.25em] text-[#F3EEE3]/40 hidden md:block">
            {categories.length} категорий
          </span>
        </div>
        <div className="flex md:grid md:grid-cols-4 gap-4 md:gap-4 px-6 md:px-12 max-w-[1400px] mx-auto overflow-x-auto md:overflow-visible pb-4 [&>*]:shrink-0">
          {categories.map((c, i) => (
            <div
              key={c.title}
              className={`group relative overflow-hidden w-[260px] md:w-auto ${
                i % 3 === 0 ? "aspect-[3/4] md:row-span-2" : "aspect-[3/4]"
              }`}
              style={{ gridRow: i % 3 === 0 ? "span 2" : undefined }}
            >
              <img
                src={c.image}
                alt={c.title}
                className="absolute inset-0 w-full h-full object-cover grayscale-[15%] transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
              <div className="absolute bottom-0 p-5">
                <h3 className="font-display text-lg text-[#F3EEE3]">
                  {c.title}
                </h3>
                <p className="text-xs text-[#D59700] mt-1">{c.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Contacts */}
      <section id="contacts" className="border-t border-[#F3EEE3]/10">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12 py-16 md:py-24 grid md:grid-cols-2 gap-12">
          <h2 className="font-display text-4xl md:text-6xl leading-tight">
            Приходите
            <br />
            в <span className="text-[#D59700] italic">салон</span>
          </h2>
          <div className="flex flex-col gap-4 text-sm md:text-base justify-end">
            <div className="flex justify-between border-b border-[#F3EEE3]/10 pb-4">
              <span className="text-[#F3EEE3]/40 uppercase tracking-wide text-xs">
                Телефон
              </span>
              <a href={brand.phoneHref} className="hover:text-[#D59700]">
                {brand.phone}
              </a>
            </div>
            <div className="flex justify-between border-b border-[#F3EEE3]/10 pb-4">
              <span className="text-[#F3EEE3]/40 uppercase tracking-wide text-xs">
                Email
              </span>
              <a href={`mailto:${brand.email}`} className="hover:text-[#D59700]">
                {brand.email}
              </a>
            </div>
            <div className="flex justify-between border-b border-[#F3EEE3]/10 pb-4">
              <span className="text-[#F3EEE3]/40 uppercase tracking-wide text-xs">
                Адрес
              </span>
              <span className="text-right">{brand.address}</span>
            </div>
            <div className="flex justify-between pb-4">
              <span className="text-[#F3EEE3]/40 uppercase tracking-wide text-xs">
                Часы работы
              </span>
              <span>{brand.hours}</span>
            </div>
          </div>
        </div>
        <div className="max-w-[1400px] mx-auto px-6 md:px-12 pb-8 text-xs text-[#F3EEE3]/30">
          © {new Date().getFullYear()} {brand.name} — интерьерный бутик
        </div>
      </section>
    </div>
  );
}
