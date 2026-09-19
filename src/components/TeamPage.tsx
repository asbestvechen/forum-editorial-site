import { ArrowUpRight, Instagram } from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { brand, teamImage } from "@/lib/brand";

export function TeamPage() {
  return (
    <div className="site-editorial font-body bg-[#FBF8F3] text-[#241D14] min-h-screen">
      <SiteHeader />

      <main>
        <section className="team-intro max-w-[1400px] mx-auto px-5 md:px-12 pt-8 md:pt-12 pb-16 md:pb-24">
          <div className="team-intro__layout">
            <div className="team-intro__copy">
              <p className="eyebrow text-[#C98A12] mb-5">ФОРУМ · команда</p>
              <h1 className="team-intro__title font-display">
                Люди
                <br />
                <em>ФОРУМА</em>
              </h1>
              <p className="team-intro__description text-sm md:text-base leading-relaxed text-[#241D14]/60">
                Собираем интерьер не из предметов, а из ощущений — бережно, точно и с уважением к характеру пространства.
              </p>
            </div>
            <div className="team-hero-image group relative overflow-hidden rounded-sm">
            <img
              src={teamImage}
              alt="Команда интерьерного бутика ФОРУМ в шоуруме"
              width="1600"
              height="1067"
              fetchPriority="high"
              className="w-full aspect-[16/8] md:aspect-[16/7] object-cover transition-transform duration-[1600ms] group-hover:scale-[1.025]"
            />
              <div className="absolute inset-0 bg-gradient-to-t from-[#241D14]/65 via-transparent to-transparent pointer-events-none" />
              <div className="absolute bottom-5 left-5 md:bottom-8 md:left-8 text-[#FBF8F3] flex items-center gap-3 text-xs uppercase tracking-[0.18em]">
              <span className="block h-px w-8 bg-[#C98A12]" />
              Команда ФОРУМ
              </div>
            </div>
          </div>
        </section>

        <section className="border-t border-[#241D14]/10 bg-[#241D14] text-[#FBF8F3]">
          <div className="max-w-[1400px] mx-auto px-5 md:px-12 py-16 md:py-24 flex flex-col md:flex-row md:items-end justify-between gap-8">
            <div>
              <p className="eyebrow text-[#E6B94D] mb-5">Хотите познакомиться лично?</p>
              <h2 className="font-display text-4xl md:text-6xl leading-none max-w-xl">Загляните в 4ROOM — начнём с разговора</h2>
            </div>
            <div className="team-footer__actions">
              <a href={`mailto:${brand.email}?subject=Заявка%20в%204ROOM`} className="editorial-button editorial-button--contact self-start md:self-end">
                Связаться <ArrowUpRight size={16} strokeWidth={1.5} />
              </a>
              <a href="#/" className="inline-flex items-center gap-3 self-start md:self-end text-xs uppercase tracking-[0.18em] text-[#E6B94D] border-b border-[#E6B94D]/50 pb-3 hover:border-[#E6B94D] transition-colors">
                Вернуться на главную <ArrowUpRight size={16} strokeWidth={1.5} />
              </a>
            </div>
          </div>
          <div className="max-w-[1400px] mx-auto px-5 md:px-12 pb-8 flex flex-col sm:flex-row gap-4 sm:gap-8 text-xs text-[#FBF8F3]/45">
            <a href={brand.phoneHref} className="hover:text-[#E6B94D] transition-colors">{brand.phone}</a>
            <a href={`mailto:${brand.email}`} className="hover:text-[#E6B94D] transition-colors">{brand.email}</a>
            <span>{brand.address}</span>
            <span className="sm:ml-auto flex gap-3">
              <Instagram size={15} strokeWidth={1.5} aria-label="Instagram" />
            </span>
          </div>
        </section>
      </main>
    </div>
  );
}
