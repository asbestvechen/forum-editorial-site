import { brand, categories, advantages, lightImages } from "@/lib/brand";

const heroCards = [
  { title: "Паркет", image: lightImages.parquet },
  { title: "Мебель на заказ", image: lightImages.bedroom },
  { title: "Свет и декор", image: lightImages.lighting },
  { title: "Кухни", image: lightImages.kitchen },
];

// Variant 3 — structured after adecoekb.com: dark header, 4-card hero,
// advantages strip, marquee, directions grid, dark 4-column footer.
export function VariantAdeco() {
  return (
    <div className="font-body bg-[#F7F2EA] text-[#241D14]">
      {/* Dark top bar */}
      <header className="bg-[#161109] text-[#F7F2EA]">
        <div className="max-w-[1400px] mx-auto px-6 md:px-10 py-4 flex items-center justify-between">
          <a
            href={brand.phoneHref}
            className="text-sm tracking-wide hidden sm:block"
          >
            {brand.phone}
          </a>
          <div className="flex items-center gap-2 mx-auto">
            <img
              src="./logo/icon-gold-transparent.png"
              alt=""
              className="h-6 w-6"
            />
            <span className="font-display text-xl tracking-[0.15em]">
              {brand.name}
            </span>
          </div>
          <div className="flex items-center gap-4 text-xs uppercase tracking-[0.15em] text-[#F7F2EA]/70">
            <button className="hover:text-[#D59700] transition-colors">
              Поиск
            </button>
            <button className="hover:text-[#D59700] transition-colors hidden sm:block">
              Войти
            </button>
          </div>
        </div>
      </header>

      {/* Hero: 4 photo cards row */}
      <section className="grid grid-cols-2 md:grid-cols-4">
        {heroCards.map((c) => (
          <div
            key={c.title}
            className="group relative aspect-[3/4] overflow-hidden"
          >
            <img
              src={c.image}
              alt={c.title}
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-black/25 group-hover:bg-black/35 transition-colors" />
            <div className="absolute inset-0 flex items-center justify-center p-4">
              <span className="text-white uppercase tracking-[0.2em] text-sm md:text-base text-center font-medium">
                {c.title}
              </span>
            </div>
          </div>
        ))}
      </section>

      {/* Advantages row */}
      <section className="bg-[#EFE6D8] border-b border-[#241D14]/10">
        <div className="max-w-[1400px] mx-auto px-6 md:px-10 py-10 grid grid-cols-2 md:grid-cols-4 gap-8">
          {advantages.map((a) => (
            <div key={a.title} className="text-center">
              <div className="w-10 h-10 mx-auto mb-3 rounded-full border border-[#D59700] flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-[#D59700]" />
              </div>
              <h3 className="text-xs md:text-sm uppercase tracking-[0.1em] font-semibold mb-2">
                {a.title}
              </h3>
              <p className="text-xs text-[#241D14]/60 leading-relaxed hidden md:block">
                {a.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Marquee */}
      <div className="bg-[#161109] text-[#D59700] overflow-hidden py-3 border-b border-[#F7F2EA]/10">
        <div className="flex whitespace-nowrap animate-[marquee_28s_linear_infinite]">
          {Array.from({ length: 2 }).map((_, i) => (
            <span
              key={i}
              className="mx-4 text-xs uppercase tracking-[0.3em] flex items-center gap-8"
            >
              {Array.from({ length: 8 }).map((_, j) => (
                <span key={j}>ФОРУМ · СКИДКИ · НОВЫЕ КОЛЛЕКЦИИ ·</span>
              ))}
            </span>
          ))}
        </div>
        <style>{`
          @keyframes marquee {
            from { transform: translateX(0); }
            to { transform: translateX(-50%); }
          }
        `}</style>
      </div>

      {/* Directions */}
      <section id="directions" className="max-w-[1400px] mx-auto px-6 md:px-10 py-16 md:py-20">
        <h2 className="font-display text-3xl md:text-5xl mb-2">
          Каталог направлений
        </h2>
        <p className="text-[#241D14]/50 mb-10 max-w-lg text-sm md:text-base">
          Полный спектр направлений, необходимых для комплектации интерьера
        </p>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 md:gap-5">
          {categories.map((c) => (
            <div key={c.title} className="group cursor-pointer">
              <div className="aspect-square overflow-hidden mb-3 bg-[#EFE6D8]">
                <img
                  src={c.image}
                  alt={c.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>
              <h3 className="text-sm font-semibold group-hover:text-[#D59700] transition-colors leading-snug">
                {c.title}
              </h3>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#161109] text-[#F7F2EA]">
        <div className="max-w-[1400px] mx-auto px-6 md:px-10 py-14 md:py-16 grid md:grid-cols-4 gap-10">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <img
                src="./logo/icon-gold-transparent.png"
                alt=""
                className="h-7 w-7"
              />
              <span className="font-display text-lg tracking-[0.1em]">
                {brand.name}
              </span>
            </div>
            <p className="text-xs text-[#F7F2EA]/50 uppercase tracking-[0.15em]">
              {brand.tagline}
            </p>
          </div>
          <div>
            <h4 className="text-xs uppercase tracking-[0.2em] text-[#D59700] mb-4">
              Каталог
            </h4>
            <ul className="space-y-2 text-sm text-[#F7F2EA]/70">
              <li>Паркет и напольные покрытия</li>
              <li>Мебель на заказ</li>
              <li>Кухни</li>
              <li>Свет и декор</li>
            </ul>
          </div>
          <div>
            <h4 className="text-xs uppercase tracking-[0.2em] text-[#D59700] mb-4">
              Компания
            </h4>
            <ul className="space-y-2 text-sm text-[#F7F2EA]/70">
              <li>О нас</li>
              <li>Новости</li>
              <li>Отзывы</li>
              <li>Контакты</li>
            </ul>
          </div>
          <div>
            <h4 className="text-xs uppercase tracking-[0.2em] text-[#D59700] mb-4">
              Контакты
            </h4>
            <ul className="space-y-2 text-sm text-[#F7F2EA]/70">
              <li>
                <a href={brand.phoneHref}>{brand.phone}</a>
              </li>
              <li>
                <a href={`mailto:${brand.email}`}>{brand.email}</a>
              </li>
              <li>{brand.address}</li>
              <li>{brand.hours}</li>
            </ul>
          </div>
        </div>
        <div className="border-t border-[#F7F2EA]/10">
          <div className="max-w-[1400px] mx-auto px-6 md:px-10 py-6 text-xs text-[#F7F2EA]/40">
            © {new Date().getFullYear()} {brand.name} — товары для интерьера
          </div>
        </div>
      </footer>
    </div>
  );
}
